import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree, Variable } from "vite-plus/lint/plugins";

import {
  hasBlankLine,
  getBlankLineFix,
  getNextStatement,
  getInsertionTarget,
  getPreviousStatement,
  getRemoveBlankLineFix,
} from "./blank-line.js";

function getVariableDeclaration(node: ESTree.Node): ESTree.VariableDeclaration | null {
  if (node.type === "VariableDeclaration") {
    return node;
  }

  if (node.type === "ExportNamedDeclaration" && node.declaration?.type === "VariableDeclaration") {
    return node.declaration;
  }

  return null;
}

function isRelatedExpression(
  statement: ESTree.Statement,
  variables: ReadonlySet<Variable>,
): boolean {
  if (statement.type !== "ExpressionStatement") {
    return false;
  }

  for (const variable of variables) {
    for (const reference of variable.references) {
      if (
        reference.identifier.range[0] >= statement.range[0] &&
        reference.identifier.range[1] <= statement.range[1]
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 連続する変数宣言の後に別の種類の文が続く場合、空行を 1 行以上確保します。
 *
 * 宣言した変数を使う式文は同じ宣言グループとして扱い、グループ内の空行は削除します。
 * return の直前は blank-line-before-return が担当するため対象外にします。
 */
const blankLineAfterVariableDeclaration = defineRule({
  meta: {
    docs: {
      description:
        "Require a blank line after a variable declaration group and remove blank lines before related statements.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      blankLine:
        "Expected a blank line after a variable declaration group when another statement follows.",
      unexpectedBlankLine:
        "Expected no blank line between a variable declaration and its related statement.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function checkStatement(node: ESTree.Node): void {
      const variableDeclaration = getVariableDeclaration(node);

      if (variableDeclaration === null) {
        return;
      }

      if (node.type === "VariableDeclaration" && node.parent.type === "ExportNamedDeclaration") {
        return;
      }

      const previousStatement = getPreviousStatement(node);

      if (previousStatement !== null && getVariableDeclaration(previousStatement) !== null) {
        return;
      }

      const variables = new Set<Variable>(sourceCode.getDeclaredVariables(variableDeclaration));
      let last = node;
      let nextStatement = getNextStatement(last);

      while (nextStatement !== null) {
        const nextVariableDeclaration = getVariableDeclaration(nextStatement);

        if (nextVariableDeclaration !== null && getVariableDeclaration(last) !== null) {
          for (const variable of sourceCode.getDeclaredVariables(nextVariableDeclaration)) {
            variables.add(variable);
          }

          last = nextStatement;
          nextStatement = getNextStatement(last);
          continue;
        }

        if (
          nextStatement.type === "ExpressionStatement" &&
          isRelatedExpression(nextStatement, variables)
        ) {
          const target = getInsertionTarget(last, nextStatement, sourceCode);

          if (hasBlankLine(last, target)) {
            context.report({
              fix(fixer) {
                return getRemoveBlankLineFix(fixer, sourceCode, last, target);
              },
              node: nextStatement,
              messageId: "unexpectedBlankLine",
            });
          }

          last = nextStatement;
          nextStatement = getNextStatement(last);
          continue;
        }

        break;
      }

      if (
        nextStatement === null ||
        nextStatement.type === "EmptyStatement" ||
        nextStatement.type === "ReturnStatement"
      ) {
        return;
      }

      const target = getInsertionTarget(last, nextStatement, sourceCode);

      if (hasBlankLine(last, target)) {
        return;
      }

      context.report({
        fix(fixer) {
          return getBlankLineFix(fixer, sourceCode, last, target);
        },
        node: nextStatement,
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
