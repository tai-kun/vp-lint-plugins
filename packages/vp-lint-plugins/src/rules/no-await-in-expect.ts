import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree } from "vite-plus/lint/plugins";

/** 括弧で包まれた式を剥がして中身を返します。 */
function unwrapParenthesized(node: ESTree.Expression): ESTree.Expression {
  let current = node;

  while (current.type === "ParenthesizedExpression") {
    current = current.expression;
  }

  return current;
}

/** `expect(...)` から `.resolves` / `.rejects` に続くチェーンかどうかを返します。 */
function usesResolvesStyle(node: ESTree.CallExpression): boolean {
  let current: ESTree.Node = node;
  let parent: ESTree.Node | undefined = node.parent;

  while (
    parent !== undefined &&
    parent.type === "MemberExpression" &&
    !parent.computed &&
    parent.object === current &&
    parent.property.type === "Identifier"
  ) {
    if (parent.property.name === "resolves" || parent.property.name === "rejects") {
      return true;
    }

    current = parent;
    parent = parent.parent;
  }

  return false;
}

/**
 * `expect(...)` を含む式全体がすでに `await` されているかどうかを返します。
 *
 * `await expect(await ...).toBe(1)` のように、チェーンの外側で待たれている場合は `await` を追加しません。
 */
function isAlreadyAwaited(node: ESTree.CallExpression): boolean {
  let outer: ESTree.Node = node;
  let parent: ESTree.Node | undefined = node.parent;

  while (parent !== undefined) {
    if (parent.type === "ParenthesizedExpression" || parent.type === "ChainExpression") {
      outer = parent;
      parent = parent.parent;
    } else if (parent.type === "MemberExpression" && parent.object === outer) {
      outer = parent;
      parent = parent.parent;
    } else if (parent.type === "CallExpression" && parent.callee === outer) {
      outer = parent;
      parent = parent.parent;
    } else {
      break;
    }
  }

  return parent !== undefined && parent.type === "AwaitExpression";
}

/**
 * `expect(await ...)` の代わりに `await expect(...).resolves` / `.rejects` を使います。
 *
 * `expect()` の引数で `await` すると、拒否された Promise を `.rejects` で検証できません。
 * 成功の検証には `await expect(...).resolves` を、失敗の検証には `await expect(...).rejects` を使ってください。
 * 自動修正では `.resolves` を付けて書き換えるため、拒否の検証が必要な場合は手で `.rejects` に直してください。
 */
const noAwaitInExpect = defineRule({
  meta: {
    docs: {
      description:
        "Require `await expect(...).resolves` or `.rejects` instead of `expect(await ...)`.",
    },
    type: "problem",
    fixable: "code",
    messages: {
      noAwaitInExpect:
        "expect() の中で await しないでください。await expect(...).resolves / .rejects を使ってください。",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      CallExpression(node): void {
        if (node.callee.type !== "Identifier" || node.callee.name !== "expect") {
          return;
        }

        const first = node.arguments[0];

        if (first === undefined || first.type === "SpreadElement") {
          return;
        }

        const awaited = unwrapParenthesized(first);

        if (awaited.type !== "AwaitExpression") {
          return;
        }

        // 入れ子の await はいちばん内側まで剥がして 1 回で修正します。
        let inner = unwrapParenthesized(awaited.argument);

        while (inner.type === "AwaitExpression") {
          inner = unwrapParenthesized(inner.argument);
        }

        const resolvesStyle = usesResolvesStyle(node);
        const prefix = resolvesStyle || isAlreadyAwaited(node) ? "" : "await ";

        const text = sourceCode.text;
        const replacement =
          prefix +
          text.slice(node.range[0], awaited.range[0]) +
          text.slice(inner.range[0], inner.range[1]) +
          text.slice(awaited.range[1], node.range[1]) +
          (resolvesStyle ? "" : ".resolves");
        context.report({
          fix(fixer) {
            return fixer.replaceTextRange([node.range[0], node.range[1]], replacement);
          },
          node,
          messageId: "noAwaitInExpect",
        });
      },
    };
  },
});

export default noAwaitInExpect;
