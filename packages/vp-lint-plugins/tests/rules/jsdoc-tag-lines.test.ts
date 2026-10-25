import jsdocTagLines from "../../src/rules/jsdoc-tag-lines.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("jsdoc-tag-lines", jsdocTagLines, {
  valid: [
    `
/**
 * 説明です。
 *
 * @param a
 * @param b
 *
 * @returns c
 */
function f(a: string, b: number): string {
  return a;
}
    `,
    `
/**
 * @param a
 *
 * @returns b
 */
function f(a: string): string {
  return a;
}
    `,
    `
/**
 * @see https://example.com
 * @see https://example.org
 */
    `,
    `
/**
 * 説明です。
 */
    `,
    `
/**
 * @example
 *
 * const a = 1;
 */
    `,
    "/** @param a */",
    `
/**
 * 説明です。
 *
 * 続きです。
 *
 * @param a
 */
    `,
  ],
  invalid: [
    {
      code: `
/**
 * 説明です。
 * @param a
 */
function f(a: string): string {
  return a;
}
      `,
      errors: [{ messageId: "missingBlankLine" }],
      output: `
/**
 * 説明です。
 *
 * @param a
 */
function f(a: string): string {
  return a;
}
      `,
    },
    {
      code: `
/**
 * @param a
 * @returns b
 */
function f(a: string): string {
  return a;
}
      `,
      errors: [{ messageId: "missingBlankLine" }],
      output: `
/**
 * @param a
 *
 * @returns b
 */
function f(a: string): string {
  return a;
}
      `,
    },
    {
      code: `
/**
 * @param a
 *
 * @param b
 */
function f(a: string, b: number): void {}
      `,
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: `
/**
 * @param a
 * @param b
 */
function f(a: string, b: number): void {}
      `,
    },
    {
      code: `
/**
 * @returns a
 * @throws b
 */
      `,
      errors: [{ messageId: "missingBlankLine" }],
      output: `
/**
 * @returns a
 *
 * @throws b
 */
      `,
    },
    {
      code: `
/**
 * @param a
 *
 */
      `,
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: `
/**
 * @param a
 */
      `,
    },
    {
      code: `
/**
 *
 * @param a
 */
      `,
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: `
/**
 * @param a
 */
      `,
    },
  ],
});
