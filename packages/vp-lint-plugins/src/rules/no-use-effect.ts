import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree, Variable } from "vite-plus/lint/plugins";

const REACT_MODULE = "react";
const HOOK_NAME = "useEffect";

/** import / export の名前を文字列で返します。 */
function getName(node: ESTree.ModuleExportName): string {
  return node.type === "Identifier" ? node.name : node.value;
}

/**
 * `typeof React.useEffect` のような型参照かどうかを返します。
 *
 * 型として参照するだけなら実行されないため、報告対象から外します。
 */
function isTypeQueryReference(node: ESTree.Node): boolean {
  let current = node;
  let parent: ESTree.Node | null = node.parent;

  while (parent !== null && parent.type === "MemberExpression" && parent.object === current) {
    current = parent;
    parent = parent.parent;
  }

  return parent !== null && parent.type === "TSTypeQuery";
}

/**
 * `import { useEffect } from "react"` の参照を報告します。
 *
 * 呼び出しの場合は呼び出し式全体を、それ以外は参照している識別子を報告します。
 */
function reportDirectUse(variable: Variable, report: (node: ESTree.Node) => void): void {
  for (const reference of variable.references) {
    const identifier = reference.identifier;
    const parent = identifier.parent;

    if (isTypeQueryReference(identifier)) {
      continue;
    }

    report(parent.type === "CallExpression" && parent.callee === identifier ? parent : identifier);
  }
}

/**
 * `React.useEffect` のようにオブジェクト経由で参照している箇所を報告します。
 *
 * `React["useEffect"]` のような計算プロパティーも対象です。
 */
function reportNamespaceUse(variable: Variable, report: (node: ESTree.Node) => void): void {
  for (const reference of variable.references) {
    const identifier = reference.identifier;
    const parent: ESTree.Node | null = identifier.parent;

    if (parent === null || parent.type !== "MemberExpression" || parent.object !== identifier) {
      continue;
    }

    if (isTypeQueryReference(identifier)) {
      continue;
    }

    if (parent.computed) {
      if (parent.property.type !== "Literal" || parent.property.value !== HOOK_NAME) {
        continue;
      }
    } else if (parent.property.type !== "Identifier" || parent.property.name !== HOOK_NAME) {
      continue;
    }

    report(parent);
  }
}

/**
 * React の `useEffect` を禁止します。
 *
 * `import { useEffect } from "react"` の直接参照と、default / namespace import 経由の `React.useEffect` を検出します。
 * 別名 import と計算プロパティーも対象です。
 * `react` 以外のモジュールから import した同名の関数や、ローカル変数で上書きされた `useEffect` は対象外です。
 */
const noUseEffect = defineRule({
  meta: {
    docs: {
      description: "Disallow React's `useEffect`.",
    },
    type: "suggestion",
    messages: {
      noUseEffect: "React の useEffect は使用しないでください。",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function report(node: ESTree.Node): void {
      context.report({
        node,
        messageId: "noUseEffect",
      });
    }

    return {
      ImportDeclaration(node): void {
        if (node.source.value !== REACT_MODULE || node.importKind === "type") {
          return;
        }

        const variables = sourceCode.getDeclaredVariables(node);
        const variableByName = new Map(variables.map((variable) => [variable.name, variable]));

        for (const specifier of node.specifiers) {
          const variable = variableByName.get(specifier.local.name);

          if (variable === undefined) {
            continue;
          }

          if (specifier.type !== "ImportSpecifier") {
            // default / namespace import は React 本体として `React.useEffect` を検査します。
            reportNamespaceUse(variable, report);

            continue;
          }

          if (specifier.importKind === "type") {
            continue;
          }

          const importedName = getName(specifier.imported);

          if (importedName === HOOK_NAME) {
            reportDirectUse(variable, report);
          } else if (importedName === "default") {
            reportNamespaceUse(variable, report);
          }
        }
      },
    };
  },
});

export default noUseEffect;
