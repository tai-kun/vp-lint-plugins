import sortObjectProperties from "../../src/rules/sort-object-properties.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("sort-object-properties", sortObjectProperties, {
  valid: [
    "const value = {\n  a: 1,\n  b: 2,\n};",
    "const value = { a: 1 };",
    "const value = { ...spread, b: 1, a: 2 };",
    "const value = { [key]: 1, a: 2 };",
    "const value = { b: 1, b: 2 };",
    "const { a, b } = value;",
    "const { a, ...rest } = value;",
    "const value = {\n  // カテゴリー 1\n\n  a: 1,\n  zebra: 2,\n\n  // カテゴリー 2\n\n  c: 3,\n  delta: 4,\n};",
    "const value = {\n  // カテゴリー\n\n  a: 2,\n  // zebra です。\n  zebra: 1,\n};",
  ],
  invalid: [
    {
      code: "const value = {\n  // カテゴリー 1\n\n  zebra: 1,\n  a: 2,\n\n  // カテゴリー 2\n\n  delta: 3,\n  c: 4,\n};",
      errors: [{ messageId: "sort" }],
      output:
        "const value = {\n  // カテゴリー 1\n\n  a: 2,\n  zebra: 1,\n\n  // カテゴリー 2\n\n  c: 4,\n  delta: 3,\n};",
    },
    {
      code: "const value = {\n  // カテゴリー\n\n  // zebra です。\n  zebra: 1,\n  a: 2,\n};",
      errors: [{ messageId: "sort" }],
      output: "const value = {\n  // カテゴリー\n\n  a: 2,\n  // zebra です。\n  zebra: 1,\n};",
    },
    {
      code: "const value = { b: 1, a: 2 };",
      errors: [{ messageId: "sort" }],
      output: "const value = {\na: 2,\nb: 1,\n};",
    },
    {
      code: "const value = {\n  b: 1,\n  a: 2,\n};",
      errors: [{ messageId: "sort" }],
      output: "const value = {\n  a: 2,\n  b: 1,\n};",
    },
    {
      code: "const value = {\n  b: 1,\n  a: 2,\n\n  d: 3,\n  c: 4,\n};",
      errors: [{ messageId: "sort" }],
      output: "const value = {\n  a: 2,\n  b: 1,\n\n  c: 4,\n  d: 3,\n};",
    },
    {
      code: "const value = {\n  // b です。\n  b: 1,\n  a: 2,\n};",
      errors: [{ messageId: "sort" }],
      output: "const value = {\n  a: 2,\n  // b です。\n  b: 1,\n};",
    },
    {
      code: "const { b, a } = value;",
      errors: [{ messageId: "sort" }],
      output: "const { a, b } = value;",
    },
    {
      code: "const { b, a, ...rest } = value;",
      errors: [{ messageId: "sort" }],
      output: "const { a, b, ...rest } = value;",
    },
  ],
});
