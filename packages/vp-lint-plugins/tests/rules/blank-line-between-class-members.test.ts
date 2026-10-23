import blankLineBetweenClassMembers from "../../src/rules/blank-line-between-class-members.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("blank-line-between-class-members", blankLineBetweenClassMembers, {
  valid: [
    "class A {\n  a = 1;\n\n  b() {}\n}",
    "class A {\n  f(a: string): void;\n  f(a: number): void;\n  f(a: string | number): void {}\n}",
    "class A {\n  get value(): number { return 1; }\n  set value(value: number) {}\n}",
    "class A {\n  a = 1;\n}",
    "class A {\n  static {}\n\n  a = 1;\n}",
  ],
  invalid: [
    {
      code: "class A {\n  a = 1;\n  b() {}\n}",
      errors: [{ messageId: "blankLine" }],
      output: "class A {\n  a = 1;\n\n  b() {}\n}",
    },
    {
      code: "class A {\n  a() {}\n  b() {}\n}",
      errors: [{ messageId: "blankLine" }],
      output: "class A {\n  a() {}\n\n  b() {}\n}",
    },
    {
      code: "class A {\n  a() {}\n  // b です。\n  b() {}\n}",
      errors: [{ messageId: "blankLine" }],
      output: "class A {\n  a() {}\n\n  // b です。\n  b() {}\n}",
    },
    {
      code: "class A { a() {} b() {} }",
      errors: [{ messageId: "blankLine" }],
      output: "class A { a() {}\n\n b() {} }",
    },
  ],
});
