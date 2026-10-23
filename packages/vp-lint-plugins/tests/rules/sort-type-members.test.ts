import sortTypeMembers from "../../src/rules/sort-type-members.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("sort-type-members", sortTypeMembers, {
  valid: [
    "type A = { a: string; b: number };",
    "type A = {\n  a: string;\n  b: number;\n};",
    "interface A {\n  b: string;\n  a: number;\n}",
    "type A = { a: string };",
    "type A = {\n  b(a: string): void;\n  b(a: number): void;\n  a: string;\n};",
    "type A = {\n  [key: string]: unknown;\n  a: string;\n  b: number;\n};",
    "type A = { b: string } | { a: number };",
  ],
  invalid: [
    {
      code: "type A = { b: string; a: number };",
      errors: [{ messageId: "sort" }],
      output: "type A = { a: number;\nb: string };",
    },
    {
      code: "type A = {\n  b: string;\n  a: number;\n};",
      errors: [{ messageId: "sort" }],
      output: "type A = {\n  a: number;\n  b: string;\n};",
    },
    {
      code: "type A = {\n  b: string;\n  a: number;\n\n  d: boolean;\n  c: null;\n};",
      errors: [{ messageId: "sort" }],
      output: "type A = {\n  a: number;\n  b: string;\n\n  c: null;\n  d: boolean;\n};",
    },
    {
      code: "type A = {\n  // b です。\n  b: string;\n  a: number;\n};",
      errors: [{ messageId: "sort" }],
      output: "type A = {\n  a: number;\n  // b です。\n  b: string;\n};",
    },
    {
      code: "type A = {\n  [key: string]: unknown;\n  b: string;\n  a: number;\n};",
      errors: [{ messageId: "sort" }],
      output: "type A = {\n  [key: string]: unknown;\n  a: number;\n  b: string;\n};",
    },
    {
      code: 'type A = { "b": string; a: number };',
      errors: [{ messageId: "sort" }],
      output: 'type A = { a: number;\n"b": string };',
    },
    {
      code: "type A = { foo: string; a: number; bb: boolean };",
      errors: [{ messageId: "sort" }],
      output: "type A = { a: number;\nbb: boolean;\nfoo: string };",
    },
  ],
});
