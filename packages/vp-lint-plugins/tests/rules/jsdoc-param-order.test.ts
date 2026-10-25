import jsdocParamOrder from "../../src/rules/jsdoc-param-order.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("jsdoc-param-order", jsdocParamOrder, {
  valid: [
    `
/**
 * @param a
 * @param b
 */
function f(a: string, b: number): void {}
    `,
    `
/**
 * @param a
 * @param b
 */
export function f(a: string, b: number): void {}
    `,
    `
/**
 * @param {string} [a]
 * @param {number} [b]
 */
function f(a?: string, b?: number): void {}
    `,
    `
/**
 * @param {{ a: string }} a
 */
function f(a: { a: string }): void {}
    `,
    `
/**
 * @param b
 * @param a
 */
function f({ a, b }: { a: string; b: string }): void {}
    `,
    `
/**
 * @param a
 */
function f(a: string, b: number): void {}
    `,
    `
/**
 * 説明です。
 */
function f(a: string): void {}
    `,
    "function f(a: string): void {}",
    `
class A {
  /**
   * @param a
   * @param b
   */
  f(a: string, b: number): void {}
}
    `,
  ],
  invalid: [
    {
      code: `
/**
 * @param b
 * @param a
 */
function f(a: string, b: number): void {}
      `,
      errors: [{ messageId: "paramOrder" }],
    },
    {
      code: `
class A {
  /**
   * @param b
   * @param a
   */
  f(a: string, b: number): void {}
}
      `,
      errors: [{ messageId: "paramOrder" }],
    },
    {
      code: `
/**
 * @param b
 * @param a
 */
export function f(a: string, b: number): void {}
      `,
      errors: [{ messageId: "paramOrder" }],
    },
    {
      code: `
/**
 * @param {number} b
 * @param {string} a
 */
function f(a: string, b: number): void {}
      `,
      errors: [{ messageId: "paramOrder" }],
    },
  ],
});
