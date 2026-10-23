import { defineRule } from "vite-plus/lint/plugins";

import { getSortPlan } from "./object-sort-utils.js";

/**
 * オブジェクトリテラルのプロパティーを、名前の長さが短い順、同じ長さなら名前順に並べます。
 *
 * 空行で区切られたグループは意図的なまとまりとみなし、グループ内だけで並べ替えます。
 * プロパティー直上のコメントはプロパティーと一緒に移動し、空行を挟んだコメントはグループ見出しとして残します。
 */
const sortObjectProperties = defineRule({
  meta: {
    docs: {
      description:
        "Sort object properties by name length and name, preserving comment groups separated by blank lines.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      sort: "Object properties must be sorted by name length, then by name.",
    },
  },
  create(context) {
    return {
      ObjectPattern(node): void {
        const plan = getSortPlan(node, context.sourceCode, {
          allowRest: true,
          forceMultiline: false,
        });

        if (plan === null || !plan.needsFix) {
          return;
        }

        context.report({
          fix(fixer) {
            if (plan.edits !== null) {
              return plan.edits.map((edit) =>
                fixer.replaceTextRange([edit.start, edit.end], edit.text),
              );
            }

            return fixer.replaceText(node, plan.replacement);
          },
          node,
          messageId: "sort",
        });
      },
      ObjectExpression(node): void {
        const plan = getSortPlan(node, context.sourceCode);

        if (plan === null || !plan.needsFix) {
          return;
        }

        context.report({
          fix(fixer) {
            if (plan.edits !== null) {
              return plan.edits.map((edit) =>
                fixer.replaceTextRange([edit.start, edit.end], edit.text),
              );
            }

            return fixer.replaceText(node, plan.replacement);
          },
          node,
          messageId: "sort",
        });
      },
    };
  },
});

export default sortObjectProperties;
