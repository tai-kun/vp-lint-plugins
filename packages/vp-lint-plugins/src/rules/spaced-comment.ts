import { defineRule } from "vite-plus/lint/plugins";
import type { Fix, Comment } from "vite-plus/lint/plugins";

const DECORATIVE_LINE = /^[-=*#_~+]{3,}$/u;

function isWhitespace(char: string | undefined): boolean {
  return char === " " || char === "\t";
}

function isExemptLineComment(raw: string): boolean {
  if (raw.startsWith("///") || raw.startsWith("//!") || raw.startsWith("//@")) {
    return true;
  }

  if (raw.startsWith("//#")) {
    return true;
  }

  return DECORATIVE_LINE.test(raw.slice(2));
}

function isExemptBlockComment(raw: string): boolean {
  return raw.startsWith("/*!");
}

/**
 * コメントの開始記号の直後と終了記号の直前に空白を要求します。
 */
const spacedComment = defineRule({
  meta: {
    docs: {
      description: "Require whitespace after the comment marker and before the closing marker.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      missingLeadingSpace: "Expected a whitespace after the comment marker.",
      missingTrailingSpace: "Expected a whitespace before the closing comment marker.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function checkLineComment(comment: Comment, raw: string): void {
      if (isExemptLineComment(raw) || isWhitespace(raw[2]) || raw.length === 2) {
        return;
      }

      context.report({
        fix(fixer) {
          return fixer.insertTextAfterRange([comment.range[0], comment.range[0] + 2], " ");
        },
        loc: comment.loc,
        messageId: "missingLeadingSpace",
      });
    }

    function checkBlockComment(comment: Comment, raw: string): void {
      if (isExemptBlockComment(raw)) {
        return;
      }

      const prefixLength = raw.startsWith("/**") ? 3 : 2;
      const firstLineEnd = raw.indexOf("\n");
      const lastLineStart = raw.lastIndexOf("\n") + 1;
      let needsLeading: boolean;
      let needsTrailing: boolean;

      if (firstLineEnd === -1) {
        const contentStart = prefixLength;
        const contentEnd = raw.lastIndexOf("*/");
        const content = raw.slice(contentStart, contentEnd);
        needsLeading = content !== "" && !isWhitespace(content[0]);
        needsTrailing = content !== "" && !isWhitespace(content.at(-1));
      } else {
        const firstLine = raw.slice(0, firstLineEnd);
        const lastLine = raw.slice(lastLineStart);
        const leadingContent = firstLine.slice(prefixLength);
        const closeIndex = lastLine.lastIndexOf("*/");
        const trailingContent = lastLine.slice(0, closeIndex);
        needsLeading = leadingContent !== "" && !isWhitespace(leadingContent[0]);
        needsTrailing = trailingContent !== "" && !isWhitespace(trailingContent.at(-1));
      }

      if (!needsLeading && !needsTrailing) {
        return;
      }

      context.report({
        fix(fixer) {
          const fixes: Fix[] = [];

          if (needsLeading) {
            fixes.push(
              fixer.insertTextAfterRange([comment.range[0], comment.range[0] + prefixLength], " "),
            );
          }

          if (needsTrailing) {
            fixes.push(fixer.insertTextBeforeRange([comment.range[1] - 2, comment.range[1]], " "));
          }

          return fixes;
        },
        loc: comment.loc,
        messageId: needsLeading ? "missingLeadingSpace" : "missingTrailingSpace",
      });
    }

    return {
      Program(): void {
        for (const comment of sourceCode.getAllComments()) {
          if (comment.type === "Line") {
            checkLineComment(comment, sourceCode.getText(comment));
            continue;
          }

          if (comment.type === "Block") {
            checkBlockComment(comment, sourceCode.getText(comment));
          }
        }
      },
    };
  },
});

export default spacedComment;
