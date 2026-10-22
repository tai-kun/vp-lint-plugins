import { defineRule } from "vite-plus/lint/plugins";

import {
  hasBlankLine,
  getBlankLineFix,
  getNextStatement,
  getInsertionTarget,
} from "./blank-line.js";

const DECLARATION_TYPES = new Set([
  "ClassDeclaration",
  "FunctionDeclaration",
  "TSDeclareFunction",
  "TSEnumDeclaration",
  "TSInterfaceDeclaration",
  "TSModuleDeclaration",
  "TSTypeAliasDeclaration",
]);

function getDeclaration(node) {
  if (DECLARATION_TYPES.has(node.type)) {
    return node;
  }

  if (
    (node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration") &&
    node.declaration !== null &&
    DECLARATION_TYPES.has(node.declaration.type)
  ) {
    return node.declaration;
  }

  return null;
}

function isOverload(declaration) {
  return (
    (declaration.type === "FunctionDeclaration" || declaration.type === "TSDeclareFunction") &&
    declaration.body === null
  );
}

/**
 * 関数・クラス・型などの宣言の後に次の文がある場合、空行を 1 行以上確保します。
 * 余分な空行は Oxfmt が 1 行に畳みます。
 */
const blankLineAfterDeclaration = defineRule({
  meta: {
    docs: {
      description: "Require a blank line after a declaration when another statement follows.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      blankLine: "Expected a blank line after a declaration when another statement follows.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function checkNode(node) {
      const declaration = getDeclaration(node);
      if (declaration === null || isOverload(declaration)) {
        return;
      }

      const nextStatement = getNextStatement(node);
      if (nextStatement === null || nextStatement.type === "EmptyStatement") {
        return;
      }

      const target = getInsertionTarget(node, nextStatement, sourceCode);
      if (hasBlankLine(node, target)) {
        return;
      }

      context.report({
        fix(fixer) {
          return getBlankLineFix(fixer, sourceCode, node, target);
        },
        node,
        messageId: "blankLine",
      });
    }

    const visitors = {
      ClassDeclaration: checkNode,
      TSDeclareFunction: checkNode,
      TSEnumDeclaration: checkNode,
      FunctionDeclaration: checkNode,
      TSModuleDeclaration: checkNode,
      ExportNamedDeclaration: checkNode,
      TSInterfaceDeclaration: checkNode,
      TSTypeAliasDeclaration: checkNode,
      ExportDefaultDeclaration: checkNode,
    };

    return visitors;
  },
});

export default blankLineAfterDeclaration;
