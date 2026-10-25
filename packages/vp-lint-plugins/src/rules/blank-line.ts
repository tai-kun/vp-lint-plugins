import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree, Variable } from "vite-plus/lint/plugins";

import {
  isComment,
  hasBlankLine,
  isDocComment,
  getBlankLineFix,
  getInsertionTarget,
  getRemoveBlankLineFix,
} from "./blank-line-utils.js";

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

const DECLARATION_TYPES: ReadonlySet<string> = new Set([
  "ClassDeclaration",
  "FunctionDeclaration",
  "TSDeclareFunction",
  "TSEnumDeclaration",
  "TSInterfaceDeclaration",
  "TSModuleDeclaration",
  "TSTypeAliasDeclaration",
]);

const SKIP_RETURN_PREVIOUS_TYPES: ReadonlySet<string> = new Set([
  // 制御ブロックの後は afterControlBlock が担当するため、ここでは判定しません。
  "DoWhileStatement",
  "ForInStatement",
  "ForOfStatement",
  "ForStatement",
  "IfStatement",
  "SwitchStatement",
  "TryStatement",
  "WhileStatement",
  // 宣言の後は afterDeclaration が担当するため、ここでは判定しません。
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

interface BlankLineOptions {
  afterControlBlock: boolean;
  afterDeclaration: boolean;
  afterVariableDeclaration: boolean;
  beforeReturn: boolean;
  betweenClassMembers: boolean;
  betweenSwitchCases: boolean;
  betweenTypeMembers: boolean;
}

const DEFAULT_OPTIONS: BlankLineOptions = {
  beforeReturn: true,
  afterDeclaration: true,
  afterControlBlock: true,
  betweenSwitchCases: true,
  betweenTypeMembers: true,
  betweenClassMembers: true,
  afterVariableDeclaration: true,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getFlag(option: Record<string, unknown>, key: keyof BlankLineOptions): boolean {
  const value = option[key];

  return value === undefined ? DEFAULT_OPTIONS[key] : value === true;
}

function getOptions(options: readonly unknown[]): BlankLineOptions {
  const option = options[0];

  if (!isObject(option)) {
    return { ...DEFAULT_OPTIONS };
  }

  return {
    beforeReturn: getFlag(option, "beforeReturn"),
    afterDeclaration: getFlag(option, "afterDeclaration"),
    afterControlBlock: getFlag(option, "afterControlBlock"),
    betweenSwitchCases: getFlag(option, "betweenSwitchCases"),
    betweenTypeMembers: getFlag(option, "betweenTypeMembers"),
    betweenClassMembers: getFlag(option, "betweenClassMembers"),
    afterVariableDeclaration: getFlag(option, "afterVariableDeclaration"),
  };
}

function isControlStatement(node: ESTree.Node): node is ControlStatement {
  return CONTROL_STATEMENT_TYPES.has(node.type as ControlStatement["type"]);
}

function getDeclaration(node: ESTree.Node): ESTree.Node | null {
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

function isOverload(declaration: ESTree.Node): boolean {
  return (
    (declaration.type === "FunctionDeclaration" || declaration.type === "TSDeclareFunction") &&
    declaration.body === null
  );
}

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

function isDirective(node: ESTree.Node): boolean {
  return node.type === "ExpressionStatement" && typeof node.directive === "string";
}

function getKeyName(member: ESTree.ClassElement): string | null {
  if (member.type === "TSIndexSignature" || member.type === "StaticBlock") {
    return null;
  }

  if (member.computed) {
    return null;
  }

  const key = member.key;

  if (key.type === "Identifier") {
    return key.name;
  }

  if (key.type === "Literal" && (typeof key.value === "string" || typeof key.value === "number")) {
    return String(key.value);
  }

  return null;
}

function isOverloadMember(member: ESTree.ClassElement): boolean {
  return member.type === "MethodDefinition" && member.value.body === null;
}

function isGetterSetterPair(previous: ESTree.ClassElement, next: ESTree.ClassElement): boolean {
  if (previous.type !== "MethodDefinition" || next.type !== "MethodDefinition") {
    return false;
  }

  if (
    !(
      (previous.kind === "get" && next.kind === "set") ||
      (previous.kind === "set" && next.kind === "get")
    )
  ) {
    return false;
  }

  const previousName = getKeyName(previous);
  const nextName = getKeyName(next);

  return previousName !== null && previousName === nextName;
}

function getMemberStart(member: ESTree.ClassElement): ESTree.ClassElement | ESTree.Decorator {
  if (member.type === "TSIndexSignature" || member.type === "StaticBlock") {
    return member;
  }

  return member.decorators[0] ?? member;
}

/**
 * 宣言・制御ブロック・変数宣言グループ・return・クラスや型のメンバー・switch の case における空行を、1 つのルールでまとめて扱います。
 *
 * 文の境界ごとに該当する項目を 1 つだけ判定するため、複数の診断が同じ箇所で矛盾しません。
 * 行コメントや通常のブロックコメントを挟む場合、前後の空行は任意とします。
 */
const blankLine = defineRule({
  meta: {
    docs: {
      description:
        "Require blank lines between statements, class members, and switch cases, and above JSDoc-style block comments.",
    },
    type: "layout",
    schema: [
      {
        type: "object",
        properties: {
          beforeReturn: { type: "boolean" },
          afterDeclaration: { type: "boolean" },
          afterControlBlock: { type: "boolean" },
          betweenSwitchCases: { type: "boolean" },
          betweenTypeMembers: { type: "boolean" },
          betweenClassMembers: { type: "boolean" },
          afterVariableDeclaration: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    fixable: "whitespace",
    messages: {
      blankLine: "Expected a blank line here.",
      unexpectedBlankLine:
        "Expected no blank line between a variable declaration and its related statement.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = getOptions(context.options);

    function requireBlankLine(
      previous: ESTree.Node,
      next: ESTree.Node,
      reportNode: ESTree.Node,
    ): void {
      const target = getInsertionTarget(previous, next, sourceCode);

      // JSDoc 形式のブロックコメントの 1 行上は空行にします。
      // それ以外のコメントを挟む場合、前後の空行は任意とします。
      if (isComment(target) && !isDocComment(target)) {
        return;
      }

      if (hasBlankLine(previous, target)) {
        return;
      }

      context.report({
        fix(fixer) {
          return getBlankLineFix(fixer, sourceCode, previous, target);
        },
        node: reportNode,
        messageId: "blankLine",
      });
    }

    /**
     * 変数宣言グループを収集します。
     *
     * 連続する変数宣言と、宣言した変数を使う式文を同じグループとして扱います。
     * グループ開始でない場合は null を返します。
     */
    function collectVariableGroup(
      body: readonly ESTree.Node[],
      start: number,
    ): {
      variables: Set<Variable>;
      statements: ESTree.Node[];
    } | null {
      const first = body[start];

      if (first === undefined) {
        return null;
      }

      const firstDeclaration = getVariableDeclaration(first);

      if (firstDeclaration === null) {
        return null;
      }

      const variables = new Set<Variable>(sourceCode.getDeclaredVariables(firstDeclaration));
      const statements: ESTree.Node[] = [first];
      let index = start + 1;

      while (index < body.length) {
        const next = body[index];

        if (next === undefined) {
          break;
        }

        const nextDeclaration = getVariableDeclaration(next);
        const lastStatement = statements.at(-1);

        if (
          nextDeclaration !== null &&
          lastStatement !== undefined &&
          getVariableDeclaration(lastStatement) !== null
        ) {
          for (const variable of sourceCode.getDeclaredVariables(nextDeclaration)) {
            variables.add(variable);
          }

          statements.push(next);
          index += 1;
          continue;
        }

        if (next.type === "ExpressionStatement" && isRelatedExpression(next, variables)) {
          statements.push(next);
          index += 1;
          continue;
        }

        break;
      }

      return {
        variables,
        statements,
      };
    }

    function checkVariableGroupBoundary(last: ESTree.Node, next: ESTree.Node | undefined): void {
      if (next === undefined || next.type === "EmptyStatement") {
        return;
      }

      if (next.type === "ReturnStatement") {
        if (options.beforeReturn) {
          requireBlankLine(last, next, next);
        }

        return;
      }

      if (options.afterVariableDeclaration) {
        requireBlankLine(last, next, next);
      }
    }

    function checkStatementBody(body: readonly ESTree.Node[]): void {
      let index = 0;

      while (index < body.length) {
        const group =
          options.afterVariableDeclaration || options.beforeReturn
            ? collectVariableGroup(body, index)
            : null;

        if (group !== null) {
          if (options.afterVariableDeclaration) {
            for (let offset = 0; offset < group.statements.length - 1; offset += 1) {
              const previous = group.statements[offset];
              const next = group.statements[offset + 1];

              if (previous === undefined || next === undefined) {
                continue;
              }

              const target = getInsertionTarget(previous, next, sourceCode);

              // JSDoc 形式のブロックコメントの 1 行上は空行にします。
              if (isDocComment(target)) {
                requireBlankLine(previous, next, next);
                continue;
              }

              // 変数同士の境界は空行の有無を問いません。
              if (next.type !== "ExpressionStatement") {
                continue;
              }

              if (isComment(target) || !hasBlankLine(previous, target)) {
                continue;
              }

              context.report({
                fix(fixer) {
                  return getRemoveBlankLineFix(fixer, sourceCode, previous, target);
                },
                node: next,
                messageId: "unexpectedBlankLine",
              });
            }
          }

          const last = group.statements.at(-1);
          const next = body[index + group.statements.length];

          if (last === undefined) {
            index += group.statements.length;
            continue;
          }

          checkVariableGroupBoundary(last, next);

          index += group.statements.length;
          continue;
        }

        const previous = body[index];
        const next = body[index + 1];

        if (previous === undefined || next === undefined || next.type === "EmptyStatement") {
          index += 1;
          continue;
        }

        if (isControlStatement(previous)) {
          if (options.afterControlBlock) {
            requireBlankLine(previous, next, previous);
          }

          index += 1;
          continue;
        }

        const declaration = getDeclaration(previous);

        if (declaration !== null) {
          if (!isOverload(declaration) && options.afterDeclaration) {
            requireBlankLine(previous, next, previous);
          }

          index += 1;
          continue;
        }

        if (next.type === "ReturnStatement") {
          if (
            options.beforeReturn &&
            !SKIP_RETURN_PREVIOUS_TYPES.has(previous.type) &&
            !isDirective(previous)
          ) {
            requireBlankLine(previous, next, next);
          }

          index += 1;
          continue;
        }

        index += 1;
      }
    }

    /**
     * 型や interface のメンバー境界を確認します。
     *
     * メンバー間の空行は要求せず、JSDoc 形式のブロックコメントの 1 行上だけ空行を要求します。
     */
    function checkTypeMembers(members: readonly ESTree.TSSignature[]): void {
      for (let index = 1; index < members.length; index += 1) {
        const previous = members[index - 1];
        const next = members[index];

        if (previous === undefined || next === undefined) {
          continue;
        }

        const target = getInsertionTarget(previous, next, sourceCode);

        if (!isDocComment(target) || hasBlankLine(previous, target)) {
          continue;
        }

        context.report({
          fix(fixer) {
            return getBlankLineFix(fixer, sourceCode, previous, target);
          },
          node: next,
          messageId: "blankLine",
        });
      }
    }

    return {
      Program(node): void {
        checkStatementBody(node.body);
      },
      ClassBody(node): void {
        if (!options.betweenClassMembers) {
          return;
        }

        for (let index = 1; index < node.body.length; index += 1) {
          const previous = node.body[index - 1];
          const next = node.body[index];

          if (previous === undefined || next === undefined) {
            continue;
          }

          if (isOverloadMember(previous) || isGetterSetterPair(previous, next)) {
            continue;
          }

          requireBlankLine(previous, getMemberStart(next), next);
        }
      },
      SwitchCase(node): void {
        checkStatementBody(node.consequent);
      },
      StaticBlock(node): void {
        checkStatementBody(node.body);
      },
      TSModuleBlock(node): void {
        checkStatementBody(node.body);
      },
      TSTypeLiteral(node): void {
        if (!options.betweenTypeMembers) {
          return;
        }

        checkTypeMembers(node.members);
      },
      BlockStatement(node): void {
        checkStatementBody(node.body);
      },
      SwitchStatement(node): void {
        if (!options.betweenSwitchCases) {
          return;
        }

        for (let index = 1; index < node.cases.length; index += 1) {
          const previous = node.cases[index - 1];
          const next = node.cases[index];

          if (previous === undefined || next === undefined || previous.consequent.length === 0) {
            continue;
          }

          requireBlankLine(previous, next, next);
        }
      },
      TSInterfaceBody(node): void {
        if (!options.betweenTypeMembers) {
          return;
        }

        checkTypeMembers(node.body);
      },
    };
  },
});

export default blankLine;
