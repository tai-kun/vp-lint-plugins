import blankLineAfterDeclaration from "../../src/rules/blank-line-after-declaration.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("blank-line-after-declaration", blankLineAfterDeclaration, {
  valid: [
    "function a() {}\n\nconst b = 1;",
    "function a(): void;\nfunction a() {}\n\nconst b = 1;",
    "const a = 1;\nconst b = 2;",
    "function a() {}",
    "interface A {\n  a: string;\n}",
  ],
  invalid: [
    {
      code: "function a() {}\nconst b = 1;",
      errors: [{ messageId: "blankLine" }],
      output: "function a() {}\n\nconst b = 1;",
    },
    {
      code: "interface A {\n  a: string;\n}\nconst b = 1;",
      errors: [{ messageId: "blankLine" }],
      output: "interface A {\n  a: string;\n}\n\nconst b = 1;",
    },
    {
      code: "type A = string;\nconst b = 1;",
      errors: [{ messageId: "blankLine" }],
      output: "type A = string;\n\nconst b = 1;",
    },
    {
      code: "export function a() {}\nconst b = 1;",
      errors: [{ messageId: "blankLine" }],
      output: "export function a() {}\n\nconst b = 1;",
    },
    {
      code: "function a() {}\n// comment\nconst b = 1;",
      errors: [{ messageId: "blankLine" }],
      output: "function a() {}\n\n// comment\nconst b = 1;",
    },
  ],
});
