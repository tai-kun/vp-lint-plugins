import overloadSignaturesAdjacent from "../../src/rules/overload-signatures-adjacent.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("overload-signatures-adjacent", overloadSignaturesAdjacent, {
  valid: [
    `
function f(a: string): void;
function f(a: number): void;
function f(a: string | number): void {}
    `,
    `
function f(a: string): void;
function f(a: string): void {}

function g() {}
    `,
    `
function f(a: string): void;
function f(a: string): void {}
    `,
    `
function f(a: string): void;
// comment
function f(a: string): void {}
    `,
    `
class A {
  f(a: string): void;
  f(a: number): void;
  f(a: string | number): void {}
}
    `,
  ],
  invalid: [
    {
      code: `
function f(a: string): void;

function f(a: number): void;
function f(a: string | number): void {}
      `,
      errors: [{ messageId: "adjacent" }],
      output: `
function f(a: string): void;
function f(a: number): void;
function f(a: string | number): void {}
      `,
    },
    {
      code: `
function f(a: string): void;

function f(a: string): void {}
      `,
      errors: [{ messageId: "adjacent" }],
      output: `
function f(a: string): void;
function f(a: string): void {}
      `,
    },
    {
      code: `
class A {
  f(a: string): void;

  f(a: number): void;
  f(a: string | number): void {}
}
      `,
      errors: [{ messageId: "adjacent" }],
      output: `
class A {
  f(a: string): void;
  f(a: number): void;
  f(a: string | number): void {}
}
      `,
    },
    {
      code: `
export function f(a: string): void;

export function f(a: string): void {}
      `,
      errors: [{ messageId: "adjacent" }],
      output: `
export function f(a: string): void;
export function f(a: string): void {}
      `,
    },
  ],
});
