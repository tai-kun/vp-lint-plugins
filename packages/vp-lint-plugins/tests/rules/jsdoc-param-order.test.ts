import jsdocParamOrder from "../../src/rules/jsdoc-param-order.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("jsdoc-param-order", jsdocParamOrder, {
  valid: [
    "/**\n * @param a\n * @param b\n */\nfunction f(a: string, b: number): void {}",
    "/**\n * @param a\n * @param b\n */\nexport function f(a: string, b: number): void {}",
    "/**\n * @param {string} [a]\n * @param {number} [b]\n */\nfunction f(a?: string, b?: number): void {}",
    "/**\n * @param {{ a: string }} a\n */\nfunction f(a: { a: string }): void {}",
    "/**\n * @param b\n * @param a\n */\nfunction f({ a, b }: { a: string; b: string }): void {}",
    "/**\n * @param a\n */\nfunction f(a: string, b: number): void {}",
    "/**\n * 説明です。\n */\nfunction f(a: string): void {}",
    "function f(a: string): void {}",
    "class A {\n  /**\n   * @param a\n   * @param b\n   */\n  f(a: string, b: number): void {}\n}",
  ],
  invalid: [
    {
      code: "/**\n * @param b\n * @param a\n */\nfunction f(a: string, b: number): void {}",
      errors: [{ messageId: "paramOrder" }],
    },
    {
      code: "class A {\n  /**\n   * @param b\n   * @param a\n   */\n  f(a: string, b: number): void {}\n}",
      errors: [{ messageId: "paramOrder" }],
    },
    {
      code: "/**\n * @param b\n * @param a\n */\nexport function f(a: string, b: number): void {}",
      errors: [{ messageId: "paramOrder" }],
    },
    {
      code: "/**\n * @param {number} b\n * @param {string} a\n */\nfunction f(a: string, b: number): void {}",
      errors: [{ messageId: "paramOrder" }],
    },
  ],
});
