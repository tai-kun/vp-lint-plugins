import { defineRule } from "vite-plus/lint/plugins";

import {
  hasBlankLine,
  getBlankLineFix,
  getInsertionTarget,
  getPreviousStatement,
} from "./blank-line.js";

const SKIP_PREVIOUS_TYPES = new Set([
  // 制御ブロックは blank-line-after-control-block が担当します。
  "DoWhileStatement",
  "ForInStatement",
  "ForOfStatement",
  "ForStatement",
  "IfStatement",
  "SwitchStatement",
  "TryStatement",
  "WhileStatement",
  // 宣言は blank-line-after-declaration が担当します。
  "ClassDeclaration",
  "ExportAllDeclaration",
  "ExportDefaultDeclaration",
  "ExportNamedDeclaration",
  "FunctionDeclaration",
  "ImportDeclaration",
  "TSDeclareFunction",
  "TSEnumDeclaration",
  "TSInterfaceDeclaration",
  "TSModuleDeclaration",
  "TSTypeAliasDeclaration",
  // 途中で終わる文や空文の後は対象外にします。
  "BlockStatement",
  "BreakStatement",
  "ContinueStatement",
  "DebuggerStatement",
  "EmptyStatement",
  "LabeledStatement",
  "ReturnStatement",
  "ThrowStatement",
  "WithStatement",
]);

/**
 * return の直前に処理がある場合、空行を 1 行以上確保します。
 * 余分な空行は Oxfmt が 1 行に畳みます。
 */
const blankLineBeforeReturn = defineRule({
  meta: {
    docs: {
      description:
        "Require a blank line before a return statement when another statement precedes it.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      blankLine:
        "Expected a blank line before a return statement when another statement precedes it.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      ReturnStatement(node) {
        const previousStatement = getPreviousStatement(node);
        if (previousStatement === null) {
          return;
        }

        if (SKIP_PREVIOUS_TYPES.has(previousStatement.type)) {
          return;
        }

        if (
          previousStatement.type === "ExpressionStatement" &&
          previousStatement.directive !== undefined
        ) {
          return;
        }

        const target = getInsertionTarget(previousStatement, node, sourceCode);
        if (hasBlankLine(previousStatement, target)) {
          return;
        }

        context.report({
          fix(fixer) {
            return getBlankLineFix(fixer, sourceCode, previousStatement, target);
          },
          node,
          messageId: "blankLine",
        });
      },
    };
  },
});

export default blankLineBeforeReturn;
