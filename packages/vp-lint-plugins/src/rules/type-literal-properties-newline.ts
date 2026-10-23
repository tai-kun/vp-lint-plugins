import { defineRule } from "vite-plus/lint/plugins";

/**
 * メンバーが 2 つ以上ある型リテラルを複数行にします。
 *
 * Oxfmt の `objectWrap` はオブジェクトリテラル用のため、型リテラルは `{` の直後の改行を目印に複数行を維持します。
 */
const typeLiteralPropertiesNewline = defineRule({
  meta: {
    docs: {
      description: "Enforce multiline type literals when they have two or more members.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      multiline: "Type literals with 2 or more members must be multiline.",
    },
  },
  create(context) {
    return {
      TSTypeLiteral(node): void {
        if (node.members.length < 2) {
          return;
        }

        const firstMember = node.members[0];

        if (firstMember === undefined || firstMember.loc.start.line !== node.loc.start.line) {
          return;
        }

        context.report({
          fix(fixer) {
            return fixer.insertTextAfterRange([node.range[0], node.range[0] + 1], "\n");
          },
          node,
          messageId: "multiline",
        });
      },
    };
  },
});

export default typeLiteralPropertiesNewline;
