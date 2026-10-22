import { defineRule } from "vite-plus/lint/plugins";

import { getSortPlan } from "./object-sort-utils.js";

/**
 * プロパティーが 2 つ以上あるオブジェクトリテラルを複数行にします。
 *
 * Oxfmt の `objectWrap` には「プロパティー数で改行を強制する」オプションがないため、改行を挿入する最小限の fix を提供します。
 * `objectWrap: "preserve"` と組み合わせることで、後続の Oxfmt がプロパティーごとの改行とインデントを整えます。
 */
const objectPropertiesNewline = defineRule({
  meta: {
    docs: {
      description: "Enforce multiline object literals when they have two or more properties.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      multiline: "Objects with 2 or more properties must be multiline.",
    },
  },
  create(context) {
    return {
      ObjectExpression(node): void {
        if (node.properties.length < 2) {
          return;
        }

        // 並び替え可能なオブジェクトは sort-object-properties が複数行化も担当します。
        if (getSortPlan(node, context.sourceCode) !== null) {
          return;
        }

        // Oxfmt は `{` の直後に改行があるかどうかで複数行を維持するため、最初のプロパティーが `{` と同じ行にある場合だけを対象にします。
        const firstProperty = node.properties[0];
        if (firstProperty === undefined || firstProperty.loc.start.line !== node.loc.start.line) {
          return;
        }

        context.report({
          fix(fixer) {
            // Oxfmt は `{` の直後の改行を複数行オブジェクトの目印にするため、ここでは改行を 1 つ挿入するだけで十分です。
            return fixer.insertTextAfterRange([node.range[0], node.range[0] + 1], "\n");
          },
          node,
          messageId: "multiline",
        });
      },
    };
  },
});

export default objectPropertiesNewline;
