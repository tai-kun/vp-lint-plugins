import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree } from "vite-plus/lint/plugins";

import {
  hasBlankLine,
  getBlankLineFix,
  getNextStatement,
  getInsertionTarget,
} from "./blank-line.js";

function isVariableDeclarationStatement(node: ESTree.Node): boolean {
  if (node.type === "VariableDeclaration") {
    return true;
  }

  return node.type === "ExportNamedDeclaration" && node.declaration?.type === "VariableDeclaration";
}

/**
 * 連続する変数宣言の後に別の種類の文が続く場合、空行を 1 行以上確保します。
 *
 * return の直前は blank-line-before-return が担当するため対象外にします。
 */
const blankLineAfterVariableDeclaration = defineRule({
  meta: {
    docs: {
      description:
        "Require a blank line after a variable declaration group when another statement follows.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      blankLine:
        "Expected a blank line after a variable declaration group when another statement follows.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function checkStatement(node: ESTree.Node): void {
      if (node.type === "VariableDeclaration" && node.parent.type === "ExportNamedDeclaration") {
        return;
      }

      const nextStatement = getNextStatement(node);

      if (
        nextStatement === null ||
        nextStatement.type === "EmptyStatement" ||
        nextStatement.type === "ReturnStatement" ||
        isVariableDeclarationStatement(nextStatement)
      ) {
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

    return {
      VariableDeclaration(node): void {
        checkStatement(node);
      },
      ExportNamedDeclaration(node): void {
        if (node.declaration?.type === "VariableDeclaration") {
          checkStatement(node);
        }
      },
    };
  },
});

export default blankLineAfterVariableDeclaration;
