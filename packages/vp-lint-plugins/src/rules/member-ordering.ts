import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree } from "vite-plus/lint/plugins";

type MemberGroup =
  | "static-field"
  | "static-block"
  | "instance-field"
  | "constructor"
  | "static-method"
  | "instance-method";

const MEMBER_GROUP_ORDER: Record<MemberGroup, number> = {
  constructor: 3,
  "static-block": 1,
  "static-field": 0,
  "static-method": 4,
  "instance-field": 2,
  "instance-method": 5,
};

function getMemberGroup(member: ESTree.ClassElement): MemberGroup | null {
  if (member.type === "StaticBlock") {
    return "static-block";
  }

  if (member.type === "TSIndexSignature") {
    return null;
  }

  if (
    member.type === "PropertyDefinition" ||
    member.type === "TSAbstractPropertyDefinition" ||
    member.type === "AccessorProperty" ||
    member.type === "TSAbstractAccessorProperty"
  ) {
    return member.static ? "static-field" : "instance-field";
  }

  if (member.type === "MethodDefinition" || member.type === "TSAbstractMethodDefinition") {
    if (member.kind === "constructor") {
      return "constructor";
    }

    return member.static ? "static-method" : "instance-method";
  }

  return null;
}

/**
 * クラスメンバーを「static フィールド → static ブロック → インスタンスフィールド → constructor → static メソッド → インスタンスメソッド」の順に要求します。
 */
const memberOrdering = defineRule({
  meta: {
    docs: {
      description:
        "Require class members to be ordered as static fields, static blocks, instance fields, constructor, static methods, and instance methods.",
    },
    type: "suggestion",
    messages: {
      order:
        "Class members must be ordered as static fields, static blocks, instance fields, constructor, static methods, and instance methods.",
    },
  },
  create(context) {
    return {
      ClassBody(node): void {
        let previousRank: number | null = null;

        for (const member of node.body) {
          const group = getMemberGroup(member);

          if (group === null) {
            continue;
          }

          const rank = MEMBER_GROUP_ORDER[group];

          if (previousRank !== null && rank < previousRank) {
            context.report({
              node: member,
              messageId: "order",
            });
          }

          previousRank = rank;
        }
      },
    };
  },
});

export default memberOrdering;
