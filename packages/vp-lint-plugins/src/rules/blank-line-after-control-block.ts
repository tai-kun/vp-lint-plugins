import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree, Visitor } from "vite-plus/lint/plugins";

import {
  hasBlankLine,
  getBlankLineFix,
  getNextStatement,
  getInsertionTarget,
} from "./blank-line.js";

type ControlStatement =
  | ESTree.DoWhileStatement
  | ESTree.ForInStatement
  | ESTree.ForOfStatement
  | ESTree.ForStatement
  | ESTree.IfStatement
  | ESTree.SwitchStatement
  | ESTree.TryStatement
  | ESTree.WhileStatement;

const CONTROL_STATEMENT_TYPES: ReadonlySet<ControlStatement["type"]> = new Set([
  "DoWhileStatement",
  "ForInStatement",
  "ForOfStatement",
  "ForStatement",
  "IfStatement",
  "SwitchStatement",
  "TryStatement",
  "WhileStatement",
]);

/**
 * 制御ブロックの直後に次の処理がある場合、空行を 1 行以上確保します。
 * 余分な空行は Oxfmt が 1 行に畳みます。
 */
const blankLineAfterControlBlock = defineRule({
  meta: {
    docs: {
      description: "Require a blank line after a control block when another statement follows.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      blankLine: "Expected a blank line after a control block when another statement follows.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function checkNode(node: ESTree.Node): void {
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

    const visitors: Visitor = {};
    for (const type of CONTROL_STATEMENT_TYPES) {
      visitors[type] = checkNode;
    }

    return visitors;
  },
});

export default blankLineAfterControlBlock;
