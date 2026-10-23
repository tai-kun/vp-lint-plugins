import { defineRule } from "vite-plus/lint/plugins";
import type { Fix, Fixer, ESTree, Context, SourceCode } from "vite-plus/lint/plugins";

import { getNextStatement } from "./blank-line.js";

function getFunction(node: ESTree.Node): ESTree.Function | null {
  if (node.type === "FunctionDeclaration" || node.type === "TSDeclareFunction") {
    return node;
  }

  if (node.type === "ExportNamedDeclaration" && node.declaration !== null) {
    const declaration = node.declaration;

    if (declaration.type === "FunctionDeclaration" || declaration.type === "TSDeclareFunction") {
      return declaration;
    }
  }

  return null;
}

function getKeyName(node: ESTree.MethodDefinition): string | null {
  if (node.computed) {
    return null;
  }

  const key = node.key;

  if (key.type === "Identifier") {
    return key.name;
  }

  if (key.type === "Literal" && (typeof key.value === "string" || typeof key.value === "number")) {
    return String(key.value);
  }

  return null;
}

function getRemoveBlankLinesFix(
  fixer: Fixer,
  sourceCode: SourceCode,
  previous: ESTree.Node,
  next: ESTree.Node,
): Fix | null {
  if (next.loc.start.line <= previous.loc.end.line + 1) {
    return null;
  }

  const fromLineEnd = sourceCode.text.indexOf("\n", previous.range[1]);

  if (fromLineEnd === -1) {
    return null;
  }

  const nextLineStart = sourceCode.text.lastIndexOf("\n", next.range[0]) + 1;
  const indent = sourceCode.text.slice(nextLineStart, next.range[0]);

  if (indent.trim() !== "") {
    return null;
  }

  return fixer.replaceTextRange([fromLineEnd, next.range[0]], `\n${indent}`);
}

function hasCommentBetween(
  sourceCode: SourceCode,
  previous: ESTree.Node,
  next: ESTree.Node,
): boolean {
  return sourceCode
    .getAllComments()
    .some((comment) => comment.range[0] >= previous.range[1] && comment.range[1] <= next.range[0]);
}

function reportIfSeparated(
  context: Context,
  sourceCode: SourceCode,
  previous: ESTree.Node,
  next: ESTree.Node,
): void {
  if (
    next.loc.start.line <= previous.loc.end.line + 1 ||
    hasCommentBetween(sourceCode, previous, next)
  ) {
    return;
  }

  context.report({
    fix(fixer) {
      return getRemoveBlankLinesFix(fixer, sourceCode, previous, next);
    },
    node: next,
    messageId: "adjacent",
  });
}

/**
 * オーバーロード署名と実装の間に空行を入れないようにします。
 */
const overloadSignaturesAdjacent = defineRule({
  meta: {
    docs: {
      description: "Require overload signatures and their implementation to be adjacent.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      adjacent: "Overload signatures must be adjacent to each other and to the implementation.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      ClassBody(node): void {
        for (let index = 1; index < node.body.length; index += 1) {
          const previous = node.body[index - 1];
          const next = node.body[index];

          if (
            previous === undefined ||
            next === undefined ||
            previous.type !== "MethodDefinition" ||
            previous.value.body !== null ||
            next.type !== "MethodDefinition"
          ) {
            continue;
          }

          const previousName = getKeyName(previous);
          const nextName = getKeyName(next);

          if (previousName === null || previousName !== nextName) {
            continue;
          }

          reportIfSeparated(context, sourceCode, previous, next);
        }
      },
      TSDeclareFunction(node): void {
        if (node.body !== null) {
          return;
        }

        const nextStatement = getNextStatement(node);

        if (nextStatement === null) {
          return;
        }

        const nextFunction = getFunction(nextStatement);

        if (nextFunction === null || nextFunction.id?.name !== node.id?.name) {
          return;
        }

        reportIfSeparated(context, sourceCode, node, nextStatement);
      },
      FunctionDeclaration(node): void {
        if (node.body !== null) {
          return;
        }

        const nextStatement = getNextStatement(node);

        if (nextStatement === null) {
          return;
        }

        const nextFunction = getFunction(nextStatement);

        if (nextFunction === null || nextFunction.id?.name !== node.id?.name) {
          return;
        }

        reportIfSeparated(context, sourceCode, node, nextStatement);
      },
      ExportNamedDeclaration(node): void {
        const currentFunction = getFunction(node);

        if (currentFunction === null || currentFunction.body !== null) {
          return;
        }

        const nextStatement = getNextStatement(node);

        if (nextStatement === null) {
          return;
        }

        const nextFunction = getFunction(nextStatement);

        if (nextFunction === null || nextFunction.id?.name !== currentFunction.id?.name) {
          return;
        }

        reportIfSeparated(context, sourceCode, node, nextStatement);
      },
    };
  },
});

export default overloadSignaturesAdjacent;
