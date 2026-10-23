import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree, Context, SourceCode } from "vite-plus/lint/plugins";

import { getNodeJSDoc, getParamName, getJSDocLines, hasExampleOrFence } from "./jsdoc-utils.js";

function getParamNameFromPattern(param: ESTree.ParamPattern): string | null {
  if (param.type === "Identifier") {
    return param.name;
  }

  if (param.type === "AssignmentPattern") {
    return param.left.type === "Identifier" ? param.left.name : null;
  }

  if (param.type === "RestElement") {
    return param.argument.type === "Identifier" ? param.argument.name : null;
  }

  if (param.type === "TSParameterProperty") {
    return getParamNameFromPattern(param.parameter);
  }

  return null;
}

function getExpectedParams(params: readonly ESTree.ParamPattern[]): string[] | null {
  const names: string[] = [];

  for (const param of params) {
    const name = getParamNameFromPattern(param);

    if (name === null) {
      return null;
    }

    names.push(name);
  }

  return names;
}

function checkFunction(
  context: Context,
  sourceCode: SourceCode,
  node: ESTree.Node,
  params: readonly ESTree.ParamPattern[],
): void {
  const comment = getNodeJSDoc(node, sourceCode);

  if (comment === null) {
    return;
  }

  const lines = getJSDocLines(comment, sourceCode);

  if (lines === null || hasExampleOrFence(lines)) {
    return;
  }

  const tagNames = lines
    .filter((line) => line.tagName === "param")
    .map((line) => getParamName(line.content));

  if (tagNames.length === 0 || tagNames.some((name) => name === null)) {
    return;
  }

  const expected = getExpectedParams(params);

  if (expected === null || expected.length !== tagNames.length) {
    return;
  }

  if (
    new Set(expected).size !== expected.length ||
    new Set(tagNames).size !== tagNames.length ||
    tagNames.some((name) => name?.includes(".") === true)
  ) {
    return;
  }

  for (const [index, name] of tagNames.entries()) {
    if (name !== expected[index]) {
      context.report({
        loc: comment.loc,
        messageId: "paramOrder",
      });

      return;
    }
  }
}

/**
 * `@param` タグが関数の引数の順序に従っていることを要求します。
 */
const jsdocParamOrder = defineRule({
  meta: {
    docs: {
      description: "Require @param tags to follow the order of function parameters.",
    },
    type: "suggestion",
    messages: {
      paramOrder: "@param tags must follow the order of function parameters.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      MethodDefinition(node): void {
        checkFunction(context, sourceCode, node, node.value.params);
      },
      TSDeclareFunction(node): void {
        checkFunction(context, sourceCode, node, node.params);
      },
      FunctionDeclaration(node): void {
        checkFunction(context, sourceCode, node, node.params);
      },
      ExportNamedDeclaration(node): void {
        const declaration = node.declaration;

        if (
          declaration !== null &&
          (declaration.type === "FunctionDeclaration" || declaration.type === "TSDeclareFunction")
        ) {
          checkFunction(context, sourceCode, node, declaration.params);
        }
      },
      TSAbstractMethodDefinition(node): void {
        checkFunction(context, sourceCode, node, node.value.params);
      },
    };
  },
});

export default jsdocParamOrder;
