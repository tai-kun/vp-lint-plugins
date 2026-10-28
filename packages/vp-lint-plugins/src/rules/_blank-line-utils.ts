import type { Fix, Fixer, ESTree, Comment, SourceCode } from "vite-plus/lint/plugins";

import { hasCommentPosition } from "./_comment-utils.js";

/** 文の配列を持つ親から、その文が属する配列を取得します。 */
function getStatementBody(node: ESTree.Node): readonly ESTree.Node[] | null {
  const { parent } = node;

  if (parent === null) {
    return null;
  }

  if (
    parent.type === "Program" ||
    parent.type === "BlockStatement" ||
    parent.type === "StaticBlock" ||
    parent.type === "TSModuleBlock"
  ) {
    return parent.body;
  }

  if (parent.type === "SwitchCase") {
    return parent.consequent;
  }

  return null;
}

function getNextStatement(node: ESTree.Node): ESTree.Node | null {
  const body = getStatementBody(node);

  if (body === null) {
    return null;
  }

  const index = body.indexOf(node);

  if (index === -1 || index === body.length - 1) {
    return null;
  }

  return body[index + 1] ?? null;
}

function getPreviousStatement(node: ESTree.Node): ESTree.Node | null {
  const body = getStatementBody(node);

  if (body === null) {
    return null;
  }

  const index = body.indexOf(node);

  if (index <= 0) {
    return null;
  }

  return body[index - 1] ?? null;
}

/**
 * 空行の挿入位置を返します。
 *
 * 次の文に付くコメントがある場合は、そのコメントの前を挿入位置にします。
 * 同じ行の末尾コメントは対象外です。
 */
function getInsertionTarget(
  node: ESTree.Node,
  nextStatement: ESTree.Node,
  sourceCode: SourceCode,
): ESTree.Node | Comment {
  return (
    sourceCode
      .getAllComments()
      .find(
        (comment) =>
          hasCommentPosition(comment) &&
          comment.range[0] >= node.range[1] &&
          comment.range[1] <= nextStatement.range[0] &&
          comment.loc.start.line > node.loc.end.line,
      ) ?? nextStatement
  );
}

function hasBlankLine(node: ESTree.Node, target: ESTree.Node | Comment): boolean {
  return target.loc.start.line > node.loc.end.line + 1;
}

/**
 * 挿入対象がコメントかどうかを返します。
 *
 * コメントを挟む場合、前後の空行は任意とします。
 */
function isComment(target: ESTree.Node | Comment): target is Comment {
  if (target === null || typeof target !== "object") {
    return false;
  }

  const { type } = target as { type: unknown };

  return type === "Line" || type === "Block" || type === "Shebang";
}

/**
 * JSDoc 形式のブロックコメント（`/**` で始まる）かどうかを返します。
 *
 * JSDoc 形式のブロックコメントの 1 行上は空行にします。
 * 実行時に値が null のコメントを受け取る場合があるため、文字列であることを確認します。
 */
function isDocComment(target: ESTree.Node | Comment): target is Comment {
  return (
    isComment(target) &&
    target.type === "Block" &&
    typeof target.value === "string" &&
    target.value.startsWith("*")
  );
}

function getBlankLineFix(
  fixer: Fixer,
  sourceCode: SourceCode,
  node: ESTree.Node,
  target: ESTree.Node | Comment,
): Fix | null {
  if (target.loc.start.line === node.loc.end.line) {
    return fixer.insertTextAfterRange([node.range[1], node.range[1]], "\n\n");
  }

  const lineEnd = sourceCode.text.indexOf("\n", node.range[1]);

  if (lineEnd === -1) {
    return null;
  }

  return fixer.insertTextBeforeRange([lineEnd, lineEnd + 1], "\n");
}

/** 指定したノードと対象の間の空行を削除します。 */
function getRemoveBlankLineFix(
  fixer: Fixer,
  sourceCode: SourceCode,
  node: ESTree.Node,
  target: ESTree.Node | Comment,
): Fix | null {
  if (target.loc.start.line <= node.loc.end.line + 1) {
    return null;
  }

  const fromLineEnd = sourceCode.text.indexOf("\n", node.range[1]);

  if (fromLineEnd === -1) {
    return null;
  }

  const targetLineStart = sourceCode.text.lastIndexOf("\n", target.range[0]) + 1;
  const indent = sourceCode.text.slice(targetLineStart, target.range[0]);

  if (indent.trim() !== "") {
    return null;
  }

  return fixer.replaceTextRange([fromLineEnd, target.range[0]], `\n${indent}`);
}

export {
  isComment,
  hasBlankLine,
  isDocComment,
  getBlankLineFix,
  getNextStatement,
  getInsertionTarget,
  getPreviousStatement,
  getRemoveBlankLineFix,
};
