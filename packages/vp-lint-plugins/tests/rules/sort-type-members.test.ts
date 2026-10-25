import sortTypeMembers from "../../src/rules/sort-type-members.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("sort-type-members", sortTypeMembers, {
  valid: [
    "type A = { a: string; b: number };",
    `
type A = {
  a: string;
  b: number;
};
    `,
    `
interface A {
  b: string;
  a: number;
}
    `,
    "type A = { a: string };",
    `
type A = {
  b(a: string): void;
  b(a: number): void;
  a: string;
};
    `,
    `
type A = {
  [key: string]: unknown;
  a: string;
  b: number;
};
    `,
    "type A = { b: string } | { a: number };",
  ],
  invalid: [
    {
      code: `
type A = { b: string; a: number };
      `,
      errors: [{ messageId: "sort" }],
      output: `
type A = { a: number;
b: string };
      `,
    },
    {
      code: `
type A = {
  b: string;
  a: number;
};
      `,
      errors: [{ messageId: "sort" }],
      output: `
type A = {
  a: number;
  b: string;
};
      `,
    },
    {
      code: `
type A = {
  b: string;
  a: number;

  d: boolean;
  c: null;
};
      `,
      errors: [{ messageId: "sort" }],
      output: `
type A = {
  a: number;
  b: string;

  c: null;
  d: boolean;
};
      `,
    },
    {
      code: `
type A = {
  // b です。
  b: string;
  a: number;
};
      `,
      errors: [{ messageId: "sort" }],
      output: `
type A = {
  a: number;
  // b です。
  b: string;
};
      `,
    },
    {
      code: `
type A = {
  [key: string]: unknown;
  b: string;
  a: number;
};
      `,
      errors: [{ messageId: "sort" }],
      output: `
type A = {
  [key: string]: unknown;
  a: number;
  b: string;
};
      `,
    },
    {
      code: `
type A = { "b": string; a: number };
      `,
      errors: [{ messageId: "sort" }],
      output: `
type A = { a: number;
"b": string };
      `,
    },
    {
      code: `
type A = { foo: string; a: number; bb: boolean };
      `,
      errors: [{ messageId: "sort" }],
      output: `
type A = { a: number;
bb: boolean;
foo: string };
      `,
    },
  ],
});
