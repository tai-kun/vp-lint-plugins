/**
 * 文の配列を持つ親から、その文が属する配列を取得します。
 */
function getStatementBody(node) {
  const parent = node.parent;
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

function getNextStatement(node) {
  const body = getStatementBody(node);
  if (body === null) {
    return null;
  }

  const index = body.indexOf(node);
  if (index === -1 || index === body.length - 1) {
    return null;
  }

  return body[index + 1];
}

function getPreviousStatement(node) {
  const body = getStatementBody(node);
  if (body === null) {
    return null;
  }

  const index = body.indexOf(node);
  if (index <= 0) {
    return null;
  }

  return body[index - 1];
}

/**
 * 空行の挿入位置を返します。
 *
 * 次の文に付くコメントがある場合は、そのコメントの前を挿入位置にします。
 * 同じ行の末尾コメントは対象外です。
 */
function getInsertionTarget(node, nextStatement, sourceCode) {
  return (
    sourceCode
      .getAllComments()
      .find(
        (comment) =>
          comment.range[0] >= node.range[1] &&
          comment.range[1] <= nextStatement.range[0] &&
          comment.loc.start.line > node.loc.end.line,
      ) ?? nextStatement
  );
}

function hasBlankLine(node, target) {
  return target.loc.start.line > node.loc.end.line + 1;
}

function getBlankLineFix(fixer, sourceCode, node, target) {
  if (target.loc.start.line === node.loc.end.line) {
    return fixer.insertTextAfterRange([node.range[1], node.range[1]], "\n\n");
  }

  const lineEnd = sourceCode.text.indexOf("\n", node.range[1]);
  if (lineEnd === -1) {
    return null;
  }

  return fixer.insertTextBeforeRange([lineEnd, lineEnd + 1], "\n");
}

export {
  hasBlankLine,
  getBlankLineFix,
  getNextStatement,
  getStatementBody,
  getInsertionTarget,
  getPreviousStatement,
};
