import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree, Comment, SourceCode } from "vite-plus/lint/plugins";

import { hasCommentPosition } from "./_comment-utils.js";

interface NamedSpecifier {
  local: string;
  text: string;
}

function getModuleName(node: ESTree.ImportDeclaration): string {
  return node.source.value;
}

function getAttributeKey(attribute: ESTree.ImportAttribute): string {
  const key = attribute.key.type === "Identifier" ? attribute.key.name : attribute.key.value;

  return `${key}:${attribute.value.value}`;
}

function getAttributesKey(node: ESTree.ImportDeclaration): string {
  return node.attributes.map(getAttributeKey).join(",");
}

function getLineIndent(source: string, offset: number): string {
  const lineStart = source.lastIndexOf("\n", offset) + 1;
  const match = /^[ \t]*/u.exec(source.slice(lineStart, offset));

  return match?.[0] ?? "";
}

function isMergeableDeclaration(node: ESTree.Node): node is ESTree.ImportDeclaration {
  return (
    node.type === "ImportDeclaration" &&
    node.phase === null &&
    node.specifiers.length > 0 &&
    node.specifiers.every((specifier) => specifier.type !== "ImportNamespaceSpecifier")
  );
}

function hasUnsafeComment(
  declarations: readonly ESTree.ImportDeclaration[],
  comments: readonly Comment[],
): boolean {
  const first = declarations[0];
  const last = declarations.at(-1);

  if (first === undefined || last === undefined) {
    return true;
  }

  const specifierRanges = declarations.flatMap((declaration) =>
    declaration.specifiers.map((specifier) => specifier.range),
  );

  return comments.some(
    (comment) =>
      hasCommentPosition(comment) &&
      comment.range[0] >= first.range[0] &&
      comment.range[1] <= last.range[1] &&
      !specifierRanges.some(
        (range) => comment.range[0] >= range[0] && comment.range[1] <= range[1],
      ),
  );
}

function buildNamedClause(
  declarations: readonly ESTree.ImportDeclaration[],
  specifiers: readonly NamedSpecifier[],
  sourceCode: SourceCode,
): string {
  const texts = specifiers.map((specifier) => specifier.text);
  const multiline = declarations.find((declaration) => {
    const firstSpecifier = declaration.specifiers.find(
      (specifier): specifier is ESTree.ImportSpecifier => specifier.type === "ImportSpecifier",
    );

    return (
      firstSpecifier !== undefined && firstSpecifier.loc.start.line > declaration.loc.start.line
    );
  });

  if (multiline === undefined) {
    return `{ ${texts.join(", ")} }`;
  }

  const firstNamed = multiline.specifiers.find(
    (specifier): specifier is ESTree.ImportSpecifier => specifier.type === "ImportSpecifier",
  );
  const lastNamed = multiline.specifiers.findLast(
    (specifier): specifier is ESTree.ImportSpecifier => specifier.type === "ImportSpecifier",
  );
  const firstDeclaration = declarations[0];

  if (firstNamed === undefined || lastNamed === undefined || firstDeclaration === undefined) {
    return `{ ${texts.join(", ")} }`;
  }

  const indent = getLineIndent(sourceCode.text, firstNamed.range[0]);
  const closingIndent = getLineIndent(sourceCode.text, firstDeclaration.range[0]);
  const beforeSource = sourceCode.text.slice(lastNamed.range[1], multiline.source.range[0]);
  const trailingComma = /,\s*\}/u.test(beforeSource);

  return `{\n${indent}${texts.join(`,\n${indent}`)}${trailingComma ? "," : ""}\n${closingIndent}}`;
}

function buildReplacement(
  declarations: readonly ESTree.ImportDeclaration[],
  sourceCode: SourceCode,
): string | null {
  const first = declarations[0];

  if (first === undefined) {
    return null;
  }

  const defaultSpecifiers = declarations.flatMap((declaration) =>
    declaration.specifiers
      .filter(
        (specifier): specifier is ESTree.ImportDefaultSpecifier =>
          specifier.type === "ImportDefaultSpecifier",
      )
      .map((specifier) => ({
        local: specifier.local.name,
        typeOnly: declaration.importKind === "type",
      })),
  );
  const hasNamed = declarations.some((declaration) =>
    declaration.specifiers.some((specifier) => specifier.type === "ImportSpecifier"),
  );

  let defaultSpecifier: {
    local: string;
    typeOnly: boolean;
  } | null = null;

  for (const specifier of defaultSpecifiers) {
    if (defaultSpecifier === null) {
      defaultSpecifier = specifier;
      continue;
    }

    // default import は 1 つしか置けないため、別名の default import はまとめられません。
    if (
      defaultSpecifier.local !== specifier.local ||
      defaultSpecifier.typeOnly !== specifier.typeOnly
    ) {
      return null;
    }
  }

  const allTypeOnly = declarations.every((declaration) => declaration.importKind === "type");
  // `import type Foo, { Bar }` は書けないため、default と名前付きを併存させる場合は `type default as Foo` を使う通常の import に変換します。
  const useTypeOnlyDeclaration = allTypeOnly && !(defaultSpecifier !== null && hasNamed);
  const namedByLocal = new Map<string, string>();
  const named: NamedSpecifier[] = [];

  function addNamed(local: string, text: string): boolean {
    const existing = namedByLocal.get(local);

    if (existing !== undefined) {
      return existing === text;
    }

    namedByLocal.set(local, text);
    named.push({
      text,
      local,
    });

    return true;
  }

  let defaultClause: string | null = null;

  if (defaultSpecifier !== null) {
    if (useTypeOnlyDeclaration || !defaultSpecifier.typeOnly) {
      defaultClause = defaultSpecifier.local;
    } else if (!addNamed(defaultSpecifier.local, `type default as ${defaultSpecifier.local}`)) {
      return null;
    }
  }

  for (const declaration of declarations) {
    const forceType = !useTypeOnlyDeclaration && declaration.importKind === "type";

    for (const specifier of declaration.specifiers) {
      if (specifier.type !== "ImportSpecifier") {
        continue;
      }

      const original = sourceCode.getText(specifier);
      const text = forceType && specifier.importKind !== "type" ? `type ${original}` : original;

      if (!addNamed(specifier.local.name, text)) {
        return null;
      }
    }
  }

  if (defaultClause !== null && namedByLocal.has(defaultClause)) {
    return null;
  }

  const bindings: string[] = [];

  if (defaultClause !== null) {
    bindings.push(defaultClause);
  }

  if (named.length > 0) {
    bindings.push(buildNamedClause(declarations, named, sourceCode));
  }

  if (bindings.length === 0) {
    return null;
  }

  const sourceText = sourceCode.getText(first.source);
  // `with { ... }` や `assert { ... }`、セミコロンの有無を元の宣言から引き継ぎます。
  const suffix = sourceCode.text.slice(first.source.range[1], first.range[1]);

  return `import ${useTypeOnlyDeclaration ? "type " : ""}${bindings.join(
    ", ",
  )} from ${sourceText}${suffix}`;
}

/**
 * 同じモジュールを指す連続した import 宣言を 1 つにまとめます。
 *
 * 別名の default import、namespace import、副作用だけの import、属性が異なる import は安全にまとめられないため対象外にします。コメントが specifier の外側にある場合も、コメントを失わないように対象外にします。
 */
const mergeImports = defineRule({
  meta: {
    docs: {
      description: "Merge consecutive import declarations that import from the same module.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      merge: "Import declarations from the same module must be merged.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program(node): void {
        const comments = sourceCode.getAllComments();
        let index = 0;

        while (index < node.body.length) {
          const first = node.body[index];

          if (first === undefined || !isMergeableDeclaration(first)) {
            index += 1;
            continue;
          }

          const declarations = [first];
          let next = index + 1;

          while (next < node.body.length) {
            const candidate = node.body[next];

            if (
              candidate === undefined ||
              !isMergeableDeclaration(candidate) ||
              getModuleName(candidate) !== getModuleName(first) ||
              getAttributesKey(candidate) !== getAttributesKey(first)
            ) {
              break;
            }

            declarations.push(candidate);
            next += 1;
          }

          if (declarations.length > 1 && !hasUnsafeComment(declarations, comments)) {
            const replacement = buildReplacement(declarations, sourceCode);
            const last = declarations.at(-1);

            if (replacement !== null && last !== undefined) {
              context.report({
                fix(fixer) {
                  return [
                    fixer.replaceText(first, replacement),
                    fixer.removeRange([first.range[1], last.range[1]]),
                  ];
                },
                node: first,
                messageId: "merge",
              });
            }
          }

          index = next;
        }
      },
    };
  },
});

export default mergeImports;
