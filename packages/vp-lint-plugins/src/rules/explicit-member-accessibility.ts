import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree } from "vite-plus/lint/plugins";

/**
 * `#` によるプライベート以外は `public` / `protected` / `private` を必須にします。
 *
 * `constructor` を含むすべてのフィールド・メソッド・アクセサーが対象です。
 * `static` ブロックと index signature は対象外です。
 */
const explicitMemberAccessibility = defineRule({
  meta: {
    docs: {
      description:
        "Require explicit accessibility modifiers for class members except # private members.",
    },
    type: "suggestion",
    messages: {
      missing:
        "Class members must have an explicit accessibility modifier (public, protected, or private). # private members are exempt.",
    },
  },
  create(context) {
    function checkMember(
      member: ESTree.PropertyDefinition | ESTree.AccessorProperty | ESTree.MethodDefinition,
    ): void {
      if (member.key.type === "PrivateIdentifier") {
        return;
      }

      if (
        member.accessibility === "public" ||
        member.accessibility === "protected" ||
        member.accessibility === "private"
      ) {
        return;
      }

      context.report({
        node: member,
        messageId: "missing",
      });
    }

    return {
      ClassBody(node): void {
        for (const member of node.body) {
          if (
            member.type === "PropertyDefinition" ||
            member.type === "TSAbstractPropertyDefinition" ||
            member.type === "AccessorProperty" ||
            member.type === "TSAbstractAccessorProperty" ||
            member.type === "MethodDefinition" ||
            member.type === "TSAbstractMethodDefinition"
          ) {
            checkMember(member);
          }
        }
      },
      TSParameterProperty(node): void {
        if (
          node.accessibility !== "public" &&
          node.accessibility !== "protected" &&
          node.accessibility !== "private"
        ) {
          context.report({
            node,
            messageId: "missing",
          });
        }
      },
    };
  },
});

export default explicitMemberAccessibility;
