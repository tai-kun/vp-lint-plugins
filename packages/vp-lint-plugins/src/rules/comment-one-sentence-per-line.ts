import { defineRule } from "vite-plus/lint/plugins";
import type { Comment, Location, SourceCode } from "vite-plus/lint/plugins";

interface LineInfo {
  column: number;
  content: string;
  end: number;
  line: number;
  start: number;
}

interface SentenceFix {
  end: number;
  loc: Location;
  start: number;
  text: string;
}

const SENTENCE_END = /[。．.!?！？]$/u;
const TRAILING_CLOSERS = /[」』】）》）〕〉］｝"'”’]+$/u;
const DIRECTIVE_PREFIXES = [
  "#!",
  "///",
  "oxlint-",
  "eslint-",
  "prettier-",
  "@ts-",
  "@type",
  "@see",
  "@link",
  "TODO",
  "FIXME",
  "NOTE",
  "HACK",
  "XXX",
  "istanbul",
  "c8 ",
  "v8 ",
  "#region",
  "#endregion",
  "biome-",
  "deno-",
];

function isBlank(text: string): boolean {
  return text.trim() === "";
}

function isDirective(text: string): boolean {
  const value = text.trimStart();

  return DIRECTIVE_PREFIXES.some((prefix) => value.indexOf(prefix) === 0);
}

function isLabelLine(text: string): boolean {
  const value = text.trim();

  return /^[^\s:：]{1,20}[:：]\s/u.test(value) || /[:：]$/u.test(value);
}

function isTag(text: string): boolean {
  return /^@[A-Za-z]/u.test(text.trimStart());
}

function isListOrHeading(text: string): boolean {
  return /^(?:[-*+]\s|\d+[.)]\s|#{1,6}\s|\|)/u.test(text.trimStart());
}

function isCodeLike(text: string): boolean {
  const value = text.trimStart();

  return (
    /^(?:```|~~~|const |let |var |function |return |if \(|for \(|while \(|switch \(|class |import |export |type |interface |\{|\}|\$ |> |pnpm |npm |npx |node |git |mise |yarn |bun |deno |curl |cd |echo |sudo |https?:\/\/)/u.test(
      value,
    ) || /=>|;\s*$/u.test(value)
  );
}

function isSentenceEnd(text: string): boolean {
  const value = text.trimEnd().replace(TRAILING_CLOSERS, "");

  return SENTENCE_END.test(value);
}

function needsSpace(left: string, right: string): boolean {
  const leftIsAscii = /[A-Za-z0-9`)]$/u.test(left);
  const leftIsWord = /[\p{L}\p{N}]$/u.test(left);
  const leftIsOperator = /[+\-*/=<>]$/u.test(left);
  const rightIsAscii = /^[A-Za-z0-9`(]/u.test(right);

  return (leftIsAscii || leftIsWord || leftIsOperator) && rightIsAscii;
}

function canContinue(current: string, next: LineInfo): boolean {
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

function getBlockLineInfos(comment: Comment, sourceCode: SourceCode): (LineInfo | null)[] {
  const raw = sourceCode.getText(comment);
  if (!raw.includes("\n")) {
    return [];
  }

  const lines = raw.split("\n");
  const infos: (LineInfo | null)[] = [];
  let offset = comment.range[0];

  for (const [index, line] of lines.entries()) {
    let contentStart: number;
    let contentEnd = line.length;

    if (index === 0) {
      contentStart = raw.slice(0, 3) === "/**" ? 3 : 2;
    } else {
      const match = /^(?<prefix>\s*\*[ \t]?).*$/u.exec(line);
      if (match === null) {
        infos.push(null);
        offset += line.length + 1;
        continue;
      }

      contentStart = match.groups?.["prefix"]?.length ?? 0;
      const closeIndex = line.indexOf("*/");
      if (closeIndex !== -1) {
        contentEnd = Math.max(contentStart, closeIndex);
      }
    }

    infos.push({
      end: offset + contentEnd,
      line: comment.loc.start.line + index,
      start: offset + contentStart,
      column: index === 0 ? comment.loc.start.column + contentStart : contentStart,
      content: line.slice(contentStart, contentEnd),
    });
    offset += line.length + 1;
  }

  return infos;
}

function getLineGroupInfos(group: readonly Comment[], sourceCode: SourceCode): LineInfo[] {
  return group.map((comment) => {
    const raw = sourceCode.getText(comment);
    const commentPrefix = raw.slice(0, 2) === "//" ? 2 : 0;
    const spacePrefix = raw[commentPrefix] === " " ? 1 : 0;
    const contentStart = commentPrefix + spacePrefix;

    return {
      end: comment.range[1],
      line: comment.loc.start.line,
      start: comment.range[0] + contentStart,
      column: comment.loc.start.column + contentStart,
      content: raw.slice(contentStart),
    };
  });
}

function collectFixes(infos: readonly (LineInfo | null)[]): SentenceFix[] {
  const fixes: SentenceFix[] = [];
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

    if (trimmed.slice(0, 3) === "```" || trimmed.slice(0, 3) === "~~~") {
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

    if (
      isDirective(trimmed) ||
      isLabelLine(trimmed) ||
      isListOrHeading(trimmed) ||
      isCodeLike(trimmed)
    ) {
      continue;
    }

    if (isSentenceEnd(content)) {
      continue;
    }

    const next = infos[index + 1];
    if (next === undefined || next === null || !canContinue(content, next)) {
      continue;
    }

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
  }

  return fixes;
}

/**
 * コメントを 1 行 1 文にします。
 *
 * 複数行のコメントで、文の途中（「、」など）で改行している箇所を検出し、次の行と結合します。文末は「。」「．」「.」「!」「?」などを判定します。
 */
const commentOneSentencePerLine = defineRule({
  meta: {
    docs: {
      description: "Enforce one sentence per comment line.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      oneSentence: "文の終わり（。．.!? など）で改行してください。",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function report(fixes: readonly SentenceFix[]): void {
      for (const fix of fixes) {
        context.report({
          fix(fixer) {
            return fixer.replaceTextRange([fix.start, fix.end], fix.text);
          },
          loc: fix.loc,
          messageId: "oneSentence",
        });
      }
    }

    return {
      "Program:exit"(): void {
        const comments = sourceCode.getAllComments();
        let lineGroup: Comment[] = [];

        for (const comment of comments) {
          if (comment.type === "Line") {
            const previous = lineGroup.at(-1);
            if (previous !== undefined && comment.loc.start.line !== previous.loc.end.line + 1) {
              if (lineGroup.length > 1) {
                report(collectFixes(getLineGroupInfos(lineGroup, sourceCode)));
              }

              lineGroup = [];
            }

            lineGroup.push(comment);
            continue;
          }

          if (lineGroup.length > 1) {
            report(collectFixes(getLineGroupInfos(lineGroup, sourceCode)));
          }

          lineGroup = [];

          if (comment.type === "Block") {
            report(collectFixes(getBlockLineInfos(comment, sourceCode)));
          }
        }

        if (lineGroup.length > 1) {
          report(collectFixes(getLineGroupInfos(lineGroup, sourceCode)));
        }
      },
    };
  },
});

export default commentOneSentencePerLine;
