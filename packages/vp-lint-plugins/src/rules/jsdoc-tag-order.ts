import { defineRule } from "vite-plus/lint/plugins";

import { hasCommentPosition } from "./_comment-utils.js";
import { getJSDocLines, hasExampleOrFence } from "./_jsdoc-utils.js";

const TAG_ORDER: Record<string, number> = {
  see: 70,
  beta: 65,
  note: 50,
  param: 10,
  throws: 40,
  default: 20,
  returns: 30,
  internal: 65,
  template: 5,
  typeParam: 5,
  deprecated: 60,
};
const UNKNOWN_TAG_ORDER = 100;

/**
 * JSDoc のタグの順序を統一します。
 */
const jsdocTagOrder = defineRule({
  meta: {
    docs: {
      description: "Enforce a consistent order of JSDoc tags.",
    },
    type: "suggestion",
    messages: {
      order:
        "JSDoc tags must be ordered as follows: @param, @default, @returns, @throws, @note, @deprecated, @see.",
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

          if (lines === null || hasExampleOrFence(lines)) {
            continue;
          }

          let previousOrder: number | null = null;

          for (const line of lines) {
            if (line.tagName === null) {
              continue;
            }

            const order = TAG_ORDER[line.tagName] ?? UNKNOWN_TAG_ORDER;

            if (previousOrder !== null && order < previousOrder) {
              context.report({
                loc: comment.loc,
                messageId: "order",
              });
              break;
            }

            previousOrder = order;
          }
        }
      },
    };
  },
});

export default jsdocTagOrder;
