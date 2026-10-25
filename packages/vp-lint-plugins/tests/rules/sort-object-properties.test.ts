import sortObjectProperties from "../../src/rules/sort-object-properties.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("sort-object-properties", sortObjectProperties, {
  valid: [
    `
const value = {
  a: 1,
  b: 2,
};
    `,
    "const value = { a: 1 };",
    "const value = { ...spread, b: 1, a: 2 };",
    "const value = { [key]: 1, a: 2 };",
    "const value = { b: 1, b: 2 };",
    "const { a, b } = value;",
    "const { a, ...rest } = value;",
    `
const value = {
  // カテゴリー 1

  a: 1,
  zebra: 2,

  // カテゴリー 2

  c: 3,
  delta: 4,
};
    `,
    `
const value = {
  // カテゴリー

  a: 2,
  // zebra です。
  zebra: 1,
};
    `,
  ],
  invalid: [
    {
      code: `
const value = {
  // カテゴリー 1

  zebra: 1,
  a: 2,

  // カテゴリー 2

  delta: 3,
  c: 4,
};
      `,
      errors: [{ messageId: "sort" }],
      output: `
const value = {
  // カテゴリー 1

  a: 2,
  zebra: 1,

  // カテゴリー 2

  c: 4,
  delta: 3,
};
      `,
    },
    {
      code: `
const value = {
  // カテゴリー

  // zebra です。
  zebra: 1,
  a: 2,
};
      `,
      errors: [{ messageId: "sort" }],
      output: `
const value = {
  // カテゴリー

  a: 2,
  // zebra です。
  zebra: 1,
};
      `,
    },
    {
      code: `
const value = { b: 1, a: 2 };
      `,
      errors: [{ messageId: "sort" }],
      output: `
const value = {
a: 2,
b: 1,
};
      `,
    },
    {
      code: `
const value = {
  b: 1,
  a: 2,
};
      `,
      errors: [{ messageId: "sort" }],
      output: `
const value = {
  a: 2,
  b: 1,
};
      `,
    },
    {
      code: `
const value = {
  b: 1,
  a: 2,

  d: 3,
  c: 4,
};
      `,
      errors: [{ messageId: "sort" }],
      output: `
const value = {
  a: 2,
  b: 1,

  c: 4,
  d: 3,
};
      `,
    },
    {
      code: `
const value = {
  // b です。
  b: 1,
  a: 2,
};
      `,
      errors: [{ messageId: "sort" }],
      output: `
const value = {
  a: 2,
  // b です。
  b: 1,
};
      `,
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
