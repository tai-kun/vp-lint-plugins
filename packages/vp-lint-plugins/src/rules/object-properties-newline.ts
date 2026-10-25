import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree } from "vite-plus/lint/plugins";

import { getSortPlan } from "./object-sort-utils.js";

/**
 * 改行判定に必要な最小限のオブジェクト形状です。
 *
 * `ObjectExpression` と JSON パーサーの `JSONObjectExpression` の両方を受け付けます。
 */
interface MultilineTarget {
  /**
   * オブジェクトの位置情報です。
   */
  loc: {
    /**
     * 開始位置です。
     */
    start: {
      /**
       * 1 始まりの行番号です。
       */
      line: number;
    };
  };

  /**
   * プロパティーの一覧です。
   */
  properties: readonly {
    /**
     * プロパティーの位置情報です。
     */
    loc: {
      /**
       * 開始位置です。
       */
      start: {
        /**
         * 1 始まりの行番号です。
         */
        line: number;
      };
    };
  }[];

  /**
   * オブジェクトの範囲です。
   */
  range: readonly [number, number];
}

/**
 * 複数行にすべき 1 行オブジェクトかどうかを判定します。
 *
 * プロパティーが 2 つ以上あり、最初のプロパティーが `{` と同じ行にある場合に `true` を返します。
 *
 * @param node 判定対象のオブジェクトです。
 *
 * @returns 複数行にすべき場合に `true` です。
 */
function needsMultiline(node: MultilineTarget): boolean {
  if (node.properties.length < 2) {
    return false;
  }

  const firstProperty = node.properties[0];

  if (firstProperty === undefined) {
    return false;
  }

  return firstProperty.loc.start.line === node.loc.start.line;
}

/**
 * プロパティーが 2 つ以上あるオブジェクトリテラルと JSON オブジェクトを複数行にします。
 *
 * Oxfmt の `objectWrap` には「プロパティー数で改行を強制する」オプションがないため、改行を挿入する最小限の fix を提供します。
 * `objectWrap: "preserve"` と組み合わせることで、後続の Oxfmt がプロパティーごとの改行とインデントを整えます。
 * JSON (`JSONObjectExpression`) も同じ fix で複数行化します。
 */
const objectPropertiesNewline = defineRule({
  meta: {
    docs: {
      description: "Enforce multiline objects when they have two or more properties.",
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
        // 並び替え可能なオブジェクトは sort-object-properties が複数行化も担当します。
        if (getSortPlan(node, context.sourceCode) !== null) {
          return;
        }

        // Oxfmt は `{` の直後に改行があるかどうかで複数行を維持するため、最初のプロパティーが `{` と同じ行にある場合だけを対象にします。
        if (!needsMultiline(node)) {
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
      JSONObjectExpression(node): void {
        const target = node as unknown as MultilineTarget;

        if (!needsMultiline(target)) {
          return;
        }

        context.report({
          fix(fixer) {
            // JSON も `objectWrap: "preserve"` で整形されるため、JS と同じく `{` の直後に改行を 1 つ挿入するだけで十分です。
            return fixer.insertTextAfterRange([target.range[0], target.range[0] + 1], "\n");
          },
          // `JSONObjectExpression` は `VisitorObject` の既定の型に含まれないため、報告時は `node` をそのまま渡します。
          node: node as unknown as ESTree.ObjectExpression,
          messageId: "multiline",
        });
      },
    };
  },
});

export default objectPropertiesNewline;
