import memberOrdering from "../../src/rules/member-ordering.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("member-ordering", memberOrdering, {
  valid: [
    "class A {\n  static a = 1;\n\n  static {}\n\n  b = 2;\n\n  constructor() {}\n\n  static c() {}\n\n  d() {}\n}",
    "class A {\n  a() {}\n\n  b() {}\n}",
    "class A {\n  get value(): number { return 1; }\n  set value(value: number) {}\n}",
    "class A {\n  [key: string]: unknown;\n  a = 1;\n}",
  ],
  invalid: [
    {
      code: "class A {\n  constructor() {}\n\n  a = 1;\n}",
      errors: [{ messageId: "order" }],
    },
    {
      code: "class A {\n  a = 1;\n\n  static b = 2;\n}",
      errors: [{ messageId: "order" }],
    },
    {
      code: "class A {\n  static a() {}\n\n  b = 1;\n}",
      errors: [{ messageId: "order" }],
    },
    {
      code: "class A {\n  a() {}\n\n  b = 1;\n}",
      errors: [{ messageId: "order" }],
    },
  ],
});
