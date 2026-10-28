import { defineRule } from "vite-plus/lint/plugins";
import type { ESTree } from "vite-plus/lint/plugins";

type Accessibility = "public" | "protected" | "private";

type MemberGroup =
  | "public-static-field"
  | "protected-static-field"
  | "private-static-field"
  | "static-block"
  | "public-instance-field"
  | "protected-instance-field"
  | "private-instance-field"
  | "constructor"
  | "public-static-method"
  | "protected-static-method"
  | "private-static-method"
  | "public-instance-method"
  | "protected-instance-method"
  | "private-instance-method";

const MEMBER_GROUP_ORDER: Record<MemberGroup, number> = {
  constructor: 7,
  "static-block": 3,
  "public-static-field": 0,
  "private-static-field": 2,
  "public-static-method": 8,
  "private-static-method": 10,
  "public-instance-field": 4,
  "private-instance-field": 6,
  "protected-static-field": 1,
  "public-instance-method": 11,
  "private-instance-method": 13,
  "protected-static-method": 9,
  "protected-instance-field": 5,
  "protected-instance-method": 12,
};

function getAccessibility(
  member: ESTree.PropertyDefinition | ESTree.AccessorProperty | ESTree.MethodDefinition,
): Accessibility {
  if (member.key.type === "PrivateIdentifier") {
    return "private";
  }

  if (member.accessibility === "protected" || member.accessibility === "private") {
    return member.accessibility;
  }

  return "public";
}

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
    const accessibility = getAccessibility(member);

    return member.static
      ? (`${accessibility}-static-field` as const)
      : (`${accessibility}-instance-field` as const);
  }

  if (member.type === "MethodDefinition" || member.type === "TSAbstractMethodDefinition") {
    if (member.kind === "constructor") {
      return "constructor";
    }

    const accessibility = getAccessibility(member);

    return member.static
      ? (`${accessibility}-static-method` as const)
      : (`${accessibility}-instance-method` as const);
  }

  return null;
}

/** クラスメンバーを「public static フィールド → protected static フィールド → private static フィールド → static ブロック → public インスタンスフィールド → protected インスタンスフィールド → private インスタンスフィールド → constructor → public static メソッド → protected static メソッド → private static メソッド → public インスタンスメソッド → protected インスタンスメソッド → private インスタンスメソッド」の順に要求します。`#` によるプライベートは private として扱います。 */
const memberOrdering = defineRule({
  meta: {
    docs: {
      description:
        "Require class members to be ordered as public static fields, protected static fields, private static fields, static blocks, public instance fields, protected instance fields, private instance fields, constructor, public static methods, protected static methods, private static methods, public instance methods, protected instance methods, and private instance methods.",
    },
    type: "suggestion",
    messages: {
      order:
        "Class members must be ordered as public static fields, protected static fields, private static fields, static blocks, public instance fields, protected instance fields, private instance fields, constructor, public static methods, protected static methods, private static methods, public instance methods, protected instance methods, and private instance methods.",
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
