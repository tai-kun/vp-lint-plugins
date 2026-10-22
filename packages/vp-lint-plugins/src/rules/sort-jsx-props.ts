import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree, SourceCode } from "vite-plus/lint/plugins";

import { compareNames } from "./object-sort-utils.js";

interface AttributeUnit {
  name: string;
  text: string;
}

type NamedAttribute = ESTree.JSXAttribute & { name: ESTree.JSXIdentifier };

function isNamedAttribute(attribute: ESTree.JSXAttributeItem): attribute is NamedAttribute {
  return attribute.type === "JSXAttribute" && attribute.name.type === "JSXIdentifier";
}

function getAttributeGroup(name: string): number {
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

function compareAttributes(left: AttributeUnit, right: AttributeUnit): number {
  const leftGroup = getAttributeGroup(left.name);
  const rightGroup = getAttributeGroup(right.name);
  if (leftGroup !== rightGroup) {
    return leftGroup - rightGroup;
  }

  return compareNames(left.name, right.name);
}

function getLineIndent(source: string, offset: number): string {
  const lineStart = source.lastIndexOf("\n", offset) + 1;
  const match = /^[ \t]*/u.exec(source.slice(lineStart, offset));

  return match?.[0] ?? "";
}

function hasCommentBetweenAttributes(
  attributes: readonly NamedAttribute[],
  sourceCode: SourceCode,
): boolean {
  const comments = sourceCode.getAllComments();

  return attributes.some((attribute, index) => {
    const nextAttribute = attributes[index + 1];
    if (nextAttribute === undefined) {
      return false;
    }

    return comments.some(
      (comment) =>
        comment.range[0] >= attribute.range[1] && comment.range[1] <= nextAttribute.range[0],
    );
  });
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
      JSXOpeningElement(node): void {
        const attributes = node.attributes.filter(isNamedAttribute);
        if (attributes.length < 2 || attributes.length !== node.attributes.length) {
          return;
        }

        const names = new Set<string>();
        for (const attribute of attributes) {
          if (names.has(attribute.name.name)) {
            return;
          }

          names.add(attribute.name.name);
        }

        if (hasCommentBetweenAttributes(attributes, sourceCode)) {
          return;
        }

        const units: AttributeUnit[] = attributes.map((attribute) => ({
          name: attribute.name.name,
          text: sourceCode.text.slice(attribute.range[0], attribute.range[1]),
        }));
        const sorted = [...units].sort(compareAttributes);
        if (sorted.every((unit, index) => unit === units[index])) {
          return;
        }

        const firstAttribute = attributes[0];
        const lastAttribute = attributes.at(-1);
        if (firstAttribute === undefined || lastAttribute === undefined) {
          return;
        }

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
