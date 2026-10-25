import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree, SourceCode } from "vite-plus/lint/plugins";

import { compareNames } from "./_object-sort-utils.js";

interface SpecifierUnit {
  group: number;
  name: string;
  text: string;
}

function getSpecifierName(node: ESTree.ModuleExportName): string | null {
  if (node.type === "Identifier") {
    return node.name;
  }

  if (node.type === "Literal") {
    return node.value;
  }

  return null;
}

function getLineIndent(source: string, offset: number): string {
  const lineStart = source.lastIndexOf("\n", offset) + 1;
  const match = /^[ \t]*/u.exec(source.slice(lineStart, offset));

  return match?.[0] ?? "";
}

function hasUnsafeComment(
  node: ESTree.Node,
  specifiers: readonly ESTree.Node[],
  sourceCode: SourceCode,
): boolean {
  const comments = sourceCode
    .getAllComments()
    .filter((comment) => comment.range[0] >= node.range[0] && comment.range[1] <= node.range[1]);

  return comments.some(
    (comment) =>
      !specifiers.some(
        (specifier) =>
          comment.range[0] >= specifier.range[0] && comment.range[1] <= specifier.range[1],
      ),
  );
}

function buildReplacement(
  units: readonly SpecifierUnit[],
  sourceCode: SourceCode,
  first: ESTree.Node,
  last: ESTree.Node,
): string | null {
  const sorted = [...units].sort((left, right) => {
    if (left.group !== right.group) {
      return left.group - right.group;
    }

    return compareNames(left.name, right.name);
  });

  if (sorted.every((unit, index) => unit === units[index])) {
    return null;
  }

  const multiline = first.loc.start.line !== last.loc.end.line;
  const separator = multiline ? `,\n${getLineIndent(sourceCode.text, first.range[0])}` : ", ";

  return sorted.map((unit) => unit.text).join(separator);
}

/**
 * import / export の波括弧内の specifier を並べます。
 *
 * 「型 → 変数など → default」のグループ順で、各グループ内は名前の長さが短い順、同じ長さなら名前順です。
 */
const sortImportExportSpecifiers = defineRule({
  meta: {
    docs: {
      description:
        "Sort import and export specifiers by group (type, value, default), then by name length and name.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      sort: "Import/export specifiers must be sorted by group, name length, then name.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function reportSort(
      node: ESTree.Node,
      specifiers: readonly ESTree.Node[],
      units: readonly SpecifierUnit[],
    ): void {
      const first = specifiers[0];
      const last = specifiers.at(-1);

      if (first === undefined || last === undefined) {
        return;
      }

      const replacement = buildReplacement(units, sourceCode, first, last);

      if (replacement === null) {
        return;
      }

      context.report({
        fix(fixer) {
          return fixer.replaceTextRange([first.range[0], last.range[1]], replacement);
        },
        node,
        messageId: "sort",
      });
    }

    return {
      ImportDeclaration(node): void {
        const specifiers = node.specifiers.filter(
          (specifier): specifier is ESTree.ImportSpecifier => specifier.type === "ImportSpecifier",
        );

        if (specifiers.length < 2 || hasUnsafeComment(node, specifiers, sourceCode)) {
          return;
        }

        const units: SpecifierUnit[] = [];

        for (const specifier of specifiers) {
          const name = getSpecifierName(specifier.imported);

          if (name === null) {
            return;
          }

          let group = 1;

          if (node.importKind === "type" || specifier.importKind === "type") {
            group = 0;
          } else if (name === "default") {
            group = 2;
          }

          units.push({
            name,
            text: sourceCode.text.slice(specifier.range[0], specifier.range[1]),
            group,
          });
        }

        reportSort(node, specifiers, units);
      },
      ExportNamedDeclaration(node): void {
        const { specifiers } = node;

        if (specifiers.length < 2 || hasUnsafeComment(node, specifiers, sourceCode)) {
          return;
        }

        const units: SpecifierUnit[] = [];

        for (const specifier of specifiers) {
          const localName = getSpecifierName(specifier.local);
          const exportedName = getSpecifierName(specifier.exported);

          if (localName === null || exportedName === null) {
            return;
          }

          let group = 1;

          if (node.exportKind === "type" || specifier.exportKind === "type") {
            group = 0;
          } else if (localName === "default" || exportedName === "default") {
            group = 2;
          }

          units.push({
            name: localName,
            text: sourceCode.text.slice(specifier.range[0], specifier.range[1]),
            group,
          });
        }

        reportSort(node, specifiers, units);
      },
    };
  },
});

export default sortImportExportSpecifiers;
