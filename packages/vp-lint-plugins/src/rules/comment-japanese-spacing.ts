import { defineRule } from "vite-plus/lint/plugins";
import type { Comment, Context } from "vite-plus/lint/plugins";

import type { CommentLine } from "./comment-utils.js";
import {
  isBlank,
  isFence,
  isCodeLike,
  isDirective,
  getLineGroupInfos,
  getCommentLineInfos,
} from "./comment-utils.js";

interface SpacingEdit {
  end: number;
  start: number;
  text: string;
}

interface ProtectedRange {
  end: number;
  start: number;
}

interface ProtectedRanges {
  inlineCode: ProtectedRange[];
  url: ProtectedRange[];
}

const JAPANESE = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\u30FC\uFF66-\uFF9F]$/u;
const ASCII_BOUNDARY = /^[A-Za-z0-9+#@%/&=$~^|:\\`]$/u;
const EXCLUDED_PUNCTUATION = new Set(["、", "。", "（", "）", "「", "」"]);
const URL = /https?:\/\/[!-~]+/gu;
const INLINE_CODE = /(?<ticks>`+)[\s\S]*?\k<ticks>/gu;

function isJapanese(char: string | undefined): boolean {
  return char !== undefined && JAPANESE.test(char);
}

function isAsciiBoundary(char: string | undefined): boolean {
  return char !== undefined && ASCII_BOUNDARY.test(char);
}

function isExcluded(char: string | undefined): boolean {
  return char !== undefined && EXCLUDED_PUNCTUATION.has(char);
}

function isSpacing(char: string): boolean {
  return char === " " || char === "\t" || char === "\u3000";
}

function getProtectedRanges(text: string): ProtectedRanges {
  const inlineCode: ProtectedRange[] = [];
  const url: ProtectedRange[] = [];

  for (const match of text.matchAll(INLINE_CODE)) {
    const start = match.index;
    const end = start + match[0].length;

    if (end > start + 2) {
      inlineCode.push({
        end: end - 1,
        start: start + 1,
      });
    }
  }

  for (const match of text.matchAll(URL)) {
    const start = match.index;
    const end = start + match[0].length;

    if (end > start + 1) {
      url.push({
        end,
        start,
      });
    }
  }

  return {
    url,
    inlineCode,
  };
}

function isProtected(offset: number, ranges: ProtectedRanges): boolean {
  return (
    ranges.inlineCode.some((range) => offset >= range.start && offset <= range.end) ||
    ranges.url.some((range) => offset > range.start && offset < range.end)
  );
}

/**
 * 日本語と半角文字の間に半角スペースを 1 つ挿入します。
 */
function findSpacingEdits(text: string): SpacingEdit[] {
  const edits: SpacingEdit[] = [];
  const protectedRanges = getProtectedRanges(text);

  for (let index = 0; index < text.length; index += 1) {
    const left = text[index];

    if (!isJapanese(left) && !isAsciiBoundary(left)) {
      continue;
    }

    let nextIndex = index + 1;

    while (nextIndex < text.length && isSpacing(text[nextIndex] ?? "")) {
      nextIndex += 1;
    }

    const right = text[nextIndex];
    const isBoundary =
      (isJapanese(left) && isAsciiBoundary(right)) || (isAsciiBoundary(left) && isJapanese(right));

    if (!isBoundary || isExcluded(left) || isExcluded(right)) {
      continue;
    }

    if (isProtected(index + 1, protectedRanges)) {
      continue;
    }

    if (nextIndex === index + 1) {
      edits.push({
        end: index + 1,
        text: " ",
        start: index + 1,
      });
      continue;
    }

    const spacing = text.slice(index + 1, nextIndex);

    if (spacing !== " ") {
      edits.push({
        end: nextIndex,
        text: " ",
        start: index + 1,
      });
    }
  }

  return edits;
}

function checkLines(context: Context, infos: readonly (CommentLine | null)[]): void {
  let inExample = false;
  let inFence = false;

  for (const info of infos) {
    if (info === null) {
      continue;
    }

    const trimmed = info.content.trim();

    if (isBlank(trimmed)) {
      continue;
    }

    if (inExample) {
      if (trimmed.slice(0, 1) === "@") {
        inExample = false;
      } else {
        continue;
      }
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

    if (isDirective(trimmed) || isCodeLike(trimmed)) {
      continue;
    }

    for (const edit of findSpacingEdits(info.content)) {
      context.report({
        fix(fixer) {
          return fixer.replaceTextRange(
            [info.start + edit.start, info.start + edit.end],
            edit.text,
          );
        },
        loc: {
          end: {
            line: info.line,
            column: info.column + edit.end,
          },
          start: {
            line: info.line,
            column: info.column + edit.start,
          },
        },
        messageId: "spacing",
      });
    }
  }
}

/**
 * 日本語と半角文字の間に半角スペースを 1 つ要求します。
 *
 * `、` `。` `（` `）` `「` `」` の前後は対象外にします。
 */
const commentJapaneseSpacing = defineRule({
  meta: {
    docs: {
      description: "Require a half-width space between Japanese and half-width characters.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      spacing: "日本語と半角文字の間には半角スペースを 1 つ入れてください。",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      "Program:exit"(): void {
        const comments = sourceCode.getAllComments();
        let lineGroup: Comment[] = [];

        function flushLineGroup(): void {
          if (lineGroup.length === 0) {
            return;
          }

          checkLines(context, getLineGroupInfos(lineGroup, sourceCode));
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
            checkLines(context, getCommentLineInfos(comment, sourceCode));
          }
        }

        flushLineGroup();
      },
    };
  },
});

export default commentJapaneseSpacing;
