import { defineRule } from "vite-plus/lint/plugins";

import { hasCommentPosition } from "./_comment-utils.js";
import type { JSDocLine } from "./_jsdoc-utils.js";
import { getJSDocLines, hasExampleOrFence } from "./_jsdoc-utils.js";

interface Entry {
  groupId: number;
  line: JSDocLine;
  lineIndex: number;
}

function getBlankPrefix(line: JSDocLine): string {
  return line.prefix.trimEnd();
}

/** description とタグ、タググループの間の空行を揃えます。 */
const jsdocTagLines = defineRule({
  meta: {
    docs: {
      description: "Require consistent blank lines between JSDoc tag groups.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      missingBlankLine: "Expected a blank line between JSDoc tag groups.",
      unexpectedBlankLine: "Unexpected blank line in a JSDoc tag group.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      "Program:exit"(): void {
        for (const comment of sourceCode.getAllComments()) {
          if (!hasCommentPosition(comment)) {
            continue;
          }

          if (comment.type !== "Block") {
            continue;
          }

          const lines = getJSDocLines(comment, sourceCode);

          if (lines === null || lines.length < 3 || hasExampleOrFence(lines)) {
            continue;
          }

          const opening = lines[0];
          const closing = lines.at(-1);

          if (
            opening === undefined ||
            closing === undefined ||
            opening.content.trim() !== "" ||
            closing.content.trim() !== ""
          ) {
            continue;
          }

          const contentLines = lines.slice(1, -1);
          const entries: Entry[] = [];

          for (const [index, line] of contentLines.entries()) {
            if (line.content.trim() !== "") {
              entries.push({
                line,
                groupId: -1,
                lineIndex: index,
              });
            }
          }

          if (entries.length === 0 || !entries.some((entry) => entry.line.tagName !== null)) {
            continue;
          }

          let firstTagIndex = -1;
          let currentGroup = -1;
          let currentTag: string | null = null;

          for (const [index, entry] of entries.entries()) {
            if (entry.line.tagName === null) {
              if (currentTag === null) {
                continue;
              }

              entry.groupId = currentGroup;
              continue;
            }

            if (firstTagIndex === -1) {
              firstTagIndex = index;
            }

            if (currentTag === null || entry.line.tagName !== currentTag) {
              currentGroup += 1;
              currentTag = entry.line.tagName;
            }

            entry.groupId = currentGroup;
          }

          if (firstTagIndex === -1) {
            continue;
          }

          const descriptionExists = firstTagIndex > 0;
          const result: string[] = [opening.raw];
          let previousEntry: Entry | null = null;
          let missingBlankLine = false;

          for (const entry of entries) {
            let desiredBlankLines: number;
            let originalBlankLines: number;

            if (previousEntry === null) {
              originalBlankLines = entry.lineIndex;
              desiredBlankLines = 0;
            } else {
              originalBlankLines = entry.lineIndex - previousEntry.lineIndex - 1;

              if (previousEntry.groupId === -1 && entry.groupId === -1) {
                desiredBlankLines = originalBlankLines;
              } else if (previousEntry.groupId === -1) {
                desiredBlankLines = descriptionExists ? 1 : 0;
              } else {
                desiredBlankLines = previousEntry.groupId === entry.groupId ? 0 : 1;
              }
            }

            if (desiredBlankLines > originalBlankLines) {
              missingBlankLine = true;
            }

            const blankPrefix = getBlankPrefix(entry.line);

            for (let count = 0; count < desiredBlankLines; count += 1) {
              result.push(blankPrefix);
            }

            result.push(entry.line.raw);
            previousEntry = entry;
          }

          result.push(closing.raw);

          const replacement = result.join("\n");

          if (replacement === sourceCode.getText(comment)) {
            continue;
          }

          context.report({
            fix(fixer) {
              return fixer.replaceText(comment, replacement);
            },
            loc: comment.loc,
            messageId: missingBlankLine ? "missingBlankLine" : "unexpectedBlankLine",
          });
        }
      },
    };
  },
});

export default jsdocTagLines;
