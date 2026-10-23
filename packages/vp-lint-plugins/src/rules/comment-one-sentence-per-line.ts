import { defineRule } from "vite-plus/lint/plugins";
import type { Comment, Location } from "vite-plus/lint/plugins";

import type { CommentLine } from "./comment-utils.js";
import {
  isTag,
  isBlank,
  isFence,
  isCodeLike,
  isDirective,
  isLabelLine,
  isSentenceEnd,
  isListOrHeading,
  getLineGroupInfos,
  getCommentLineInfos,
  isSkippableProseLine,
} from "./comment-utils.js";

interface SentenceFix {
  end: number;
  loc: Location;
  start: number;
  text: string;
}

interface CommentDiagnostics {
  fixes: SentenceFix[];
  missingPunctuation: CommentLine[];
}

interface CommentOptions {
  requireEndPunctuation: boolean;
}

function needsSpace(left: string, right: string): boolean {
  const leftIsAscii = /[A-Za-z0-9`)]$/u.test(left);
  const leftIsWord = /[\p{L}\p{N}]$/u.test(left);
  const leftIsOperator = /[+\-*/=<>]$/u.test(left);
  const rightIsAscii = /^[A-Za-z0-9`(]/u.test(right);

  return (leftIsAscii || leftIsWord || leftIsOperator) && rightIsAscii;
}

function canContinue(current: string, next: CommentLine): boolean {
  if (isBlank(next.content)) {
    return false;
  }

  const nextText = next.content.trimStart();

  if (
    isDirective(nextText) ||
    isLabelLine(nextText) ||
    isTag(nextText) ||
    isListOrHeading(nextText) ||
    isCodeLike(nextText)
  ) {
    return false;
  }

  return !isDirective(current) && !isCodeLike(current);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptions(options: readonly unknown[]): CommentOptions {
  const option = options[0];

  return {
    requireEndPunctuation: isObject(option) && option["requireEndPunctuation"] === true,
  };
}

function collectDiagnostics(
  infos: readonly (CommentLine | null)[],
  requireEndPunctuation: boolean,
): CommentDiagnostics {
  const fixes: SentenceFix[] = [];
  const missingPunctuation: CommentLine[] = [];
  let inExample = false;
  let inFence = false;

  for (const [index, info] of infos.entries()) {
    if (info === null) {
      continue;
    }

    const content = info.content;
    const trimmed = content.trim();

    if (inExample) {
      if (trimmed.slice(0, 1) === "@") {
        inExample = false;
      } else {
        continue;
      }
    }

    if (trimmed === "") {
      continue;
    }

    if (isFence(trimmed)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    if (trimmed.slice(0, 8) === "@example") {
      inExample = true;
      continue;
    }

    if (isSkippableProseLine(trimmed)) {
      continue;
    }

    if (isSentenceEnd(content)) {
      continue;
    }

    const next = infos[index + 1];

    if (next !== undefined && next !== null && canContinue(content, next)) {
      const nextLeadingSpace = /^\s*/u.exec(next.content)?.[0] ?? "";
      const separator = nextLeadingSpace === "" && needsSpace(content, next.content) ? " " : "";

      fixes.push({
        end: next.start,
        loc: {
          end: {
            line: info.line,
            column: info.column + content.length,
          },
          start: {
            line: info.line,
            column: info.column,
          },
        },
        text: separator,
        start: info.end,
      });
      continue;
    }

    if (requireEndPunctuation) {
      missingPunctuation.push(info);
    }
  }

  return {
    fixes,
    missingPunctuation,
  };
}

/**
 * コメントを 1 行 1 文にします。
 *
 * 複数行のコメントで、文の途中（「、」など）で改行している箇所を検出し、次の行と結合します。文末は「。」「．」「.」「!」「?」などを判定します。
 * `requireEndPunctuation` を有効にすると、文末の句読点がない散文行も報告します。
 */
const commentOneSentencePerLine = defineRule({
  meta: {
    docs: {
      description: "Enforce one sentence per comment line.",
    },
    type: "layout",
    schema: [
      {
        type: "object",
        properties: {
          requireEndPunctuation: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    fixable: "whitespace",
    messages: {
      oneSentence: "文の終わり（。．.!? など）で改行してください。",
      missingEndPunctuation: "文末に句読点（。．.!? など）を付けてください。",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const { requireEndPunctuation } = getOptions(context.options);

    function report(infos: readonly (CommentLine | null)[]): void {
      const diagnostics = collectDiagnostics(infos, requireEndPunctuation);

      for (const fix of diagnostics.fixes) {
        context.report({
          fix(fixer) {
            return fixer.replaceTextRange([fix.start, fix.end], fix.text);
          },
          loc: fix.loc,
          messageId: "oneSentence",
        });
      }

      for (const info of diagnostics.missingPunctuation) {
        const column = info.column + info.content.trimEnd().length;

        context.report({
          loc: {
            end: {
              line: info.line,
              column,
            },
            start: {
              line: info.line,
              column,
            },
          },
          messageId: "missingEndPunctuation",
        });
      }
    }

    return {
      "Program:exit"(): void {
        const comments = sourceCode.getAllComments();
        let lineGroup: Comment[] = [];

        function flushLineGroup(): void {
          if (lineGroup.length === 0) {
            return;
          }

          report(getLineGroupInfos(lineGroup, sourceCode));
          lineGroup = [];
        }

        for (const comment of comments) {
          if (comment.type === "Line") {
            const previous = lineGroup.at(-1);

            if (previous !== undefined && comment.loc.start.line !== previous.loc.end.line + 1) {
              flushLineGroup();
            }

            lineGroup.push(comment);
            continue;
          }

          flushLineGroup();

          if (comment.type === "Block") {
            report(getCommentLineInfos(comment, sourceCode));
          }
        }

        flushLineGroup();
      },
    };
  },
});

export default commentOneSentencePerLine;
