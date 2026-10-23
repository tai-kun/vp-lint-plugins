import { defineRule } from "vite-plus/lint/plugins";

import { hasBlankLine, getBlankLineFix, getInsertionTarget } from "./blank-line.js";

/**
 * 空でない switch の case の間に空行を 1 行以上確保します。
 *
 * 連続する case はフォールスルーとみなし、対象外にします。
 */
const blankLineBetweenSwitchCases = defineRule({
  meta: {
    docs: {
      description: "Require a blank line between non-empty switch cases.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      blankLine: "Expected a blank line between switch cases.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      SwitchStatement(node): void {
        for (let index = 1; index < node.cases.length; index += 1) {
          const previous = node.cases[index - 1];
          const next = node.cases[index];

          if (previous === undefined || next === undefined || previous.consequent.length === 0) {
            continue;
          }

          const target = getInsertionTarget(previous, next, sourceCode);

          if (hasBlankLine(previous, target)) {
            continue;
          }

          context.report({
            fix(fixer) {
              return getBlankLineFix(fixer, sourceCode, previous, target);
            },
            node: next,
            messageId: "blankLine",
          });
        }
      },
    };
  },
});

export default blankLineBetweenSwitchCases;
