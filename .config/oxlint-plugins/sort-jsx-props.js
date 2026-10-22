import { defineRule } from "vite-plus/lint/plugins";

import { compareNames } from "./object-sort-utils.js";

function getAttributeGroup(name) {
  if (/^on[A-Z].*/u.test(name)) {
    return 1;
  }

  if (/^aria-.+/u.test(name)) {
    return 2;
  }

  if (/^data-.+/u.test(name)) {
    return 3;
  }

  return 0;
}

function compareAttributes(left, right) {
  const leftGroup = getAttributeGroup(left.name);
  const rightGroup = getAttributeGroup(right.name);
  if (leftGroup !== rightGroup) {
    return leftGroup - rightGroup;
  }

  return compareNames(left.name, right.name);
}

function getLineIndent(source, offset) {
  const lineStart = source.lastIndexOf("\n", offset) + 1;
  const match = /^[ \t]*/u.exec(source.slice(lineStart, offset));

  return match === null ? "" : match[0];
}

/**
 * JSX の props を「一般 → on* → aria-* → data-*」のグループ順に並べます。
 * 各グループ内ではプロパティー名の長さが短い順、同じ長さなら名前順です。
 */
const sortJsxProps = defineRule({
  meta: {
    docs: {
      description:
        "Sort JSX props by group (general, on*, aria-*, data-*), then by name length and name.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      sort: "JSX props must be sorted by group, name length, then name.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      JSXOpeningElement(node) {
        if (node.attributes.length < 2) {
          return;
        }

        if (
          node.attributes.some(
            (attribute) =>
              attribute.type !== "JSXAttribute" || attribute.name.type !== "JSXIdentifier",
          )
        ) {
          return;
        }

        const names = new Set();
        for (const attribute of node.attributes) {
          if (names.has(attribute.name.name)) {
            return;
          }

          names.add(attribute.name.name);
        }

        const comments = sourceCode.getAllComments();
        const hasCommentBetweenAttributes = node.attributes.some((attribute, index) => {
          if (index === node.attributes.length - 1) {
            return false;
          }

          const nextAttribute = node.attributes[index + 1];

          return comments.some(
            (comment) =>
              comment.range[0] >= attribute.range[1] && comment.range[1] <= nextAttribute.range[0],
          );
        });
        if (hasCommentBetweenAttributes) {
          return;
        }

        const units = node.attributes.map((attribute) => ({
          name: attribute.name.name,
          text: sourceCode.text.slice(attribute.range[0], attribute.range[1]),
        }));
        const sorted = [...units].sort(compareAttributes);
        if (sorted.every((unit, index) => unit === units[index])) {
          return;
        }

        const firstAttribute = node.attributes[0];
        const lastAttribute = node.attributes.at(-1);
        const multiline = firstAttribute.loc.start.line !== lastAttribute.loc.end.line;
        const separator = multiline
          ? `\n${getLineIndent(sourceCode.text, firstAttribute.range[0])}`
          : " ";

        context.report({
          fix(fixer) {
            return fixer.replaceTextRange(
              [firstAttribute.range[0], lastAttribute.range[1]],
              sorted.map((unit) => unit.text).join(separator),
            );
          },
          node,
          messageId: "sort",
        });
      },
    };
  },
});

export default sortJsxProps;
