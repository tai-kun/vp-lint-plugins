import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree } from "vite-plus/lint/plugins";

import { hasBlankLine, getBlankLineFix, getInsertionTarget } from "./blank-line.js";

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

function isOverload(member: ESTree.ClassElement): boolean {
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
 * クラスメンバーの間に空行を 1 行以上確保します。
 *
 * オーバーロード署名と getter/setter のペアは連続させます。
 */
const blankLineBetweenClassMembers = defineRule({
  meta: {
    docs: {
      description: "Require a blank line between class members.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      blankLine: "Expected a blank line between class members.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      ClassBody(node): void {
        for (let index = 1; index < node.body.length; index += 1) {
          const previous = node.body[index - 1];
          const next = node.body[index];

          if (previous === undefined || next === undefined) {
            continue;
          }

          if (isOverload(previous) || isGetterSetterPair(previous, next)) {
            continue;
          }

          const target = getInsertionTarget(previous, getMemberStart(next), sourceCode);

          if (hasBlankLine(previous, target)) {
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
      },
    };
  },
});

export default blankLineBetweenClassMembers;
