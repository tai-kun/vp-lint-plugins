import { defineRule } from "vite-plus/lint/plugins";

import { compareNames } from "./object-sort-utils.js";

function getSpecifierName(node) {
  if (node.type === "Identifier") {
    return node.name;
  }

  if (node.type === "Literal") {
    return String(node.value);
  }

  return null;
}

function getLineIndent(source, offset) {
  const lineStart = source.lastIndexOf("\n", offset) + 1;
  const match = /^[ \t]*/u.exec(source.slice(lineStart, offset));

  return match === null ? "" : match[0];
}

/**
 * @param {any} node
 * @param {Array<any>} specifiers
 * @param {any} sourceCode
 * @returns {boolean}
 */
function hasUnsafeComment(node, specifiers, sourceCode) {
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

function buildReplacement(units, sourceCode, first, last) {
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

    function checkImport(node) {
      const specifiers = node.specifiers.filter(
        (specifier) => specifier.type === "ImportSpecifier",
      );
      if (specifiers.length < 2 || hasUnsafeComment(node, specifiers, sourceCode)) {
        return;
      }

      const units = [];
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

      const replacement = buildReplacement(units, sourceCode, specifiers[0], specifiers.at(-1));
      if (replacement === null) {
        return;
      }

      context.report({
        fix(fixer) {
          return fixer.replaceTextRange(
            [specifiers[0].range[0], specifiers.at(-1).range[1]],
            replacement,
          );
        },
        node,
        messageId: "sort",
      });
    }

    function checkExport(node) {
      /** @type {Array<any>} */
      const specifiers = node.specifiers;
      if (
        specifiers.length < 2 ||
        specifiers.some((specifier) => specifier.type !== "ExportSpecifier") ||
        hasUnsafeComment(node, specifiers, sourceCode)
      ) {
        return;
      }

      const units = [];
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

      const replacement = buildReplacement(units, sourceCode, specifiers[0], specifiers.at(-1));
      if (replacement === null) {
        return;
      }

      context.report({
        fix(fixer) {
          return fixer.replaceTextRange(
            [specifiers[0].range[0], specifiers.at(-1).range[1]],
            replacement,
          );
        },
        node,
        messageId: "sort",
      });
    }

    return {
      ImportDeclaration: checkImport,
      ExportNamedDeclaration: checkExport,
    };
  },
});

export default sortImportExportSpecifiers;
