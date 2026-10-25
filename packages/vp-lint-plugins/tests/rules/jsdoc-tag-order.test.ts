import jsdocTagOrder from "../../src/rules/jsdoc-tag-order.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("jsdoc-tag-order", jsdocTagOrder, {
  valid: [
    `
/**
 * @param a
 * @returns b
 */
    `,
    `
/**
 * @template T
 * @param a
 */
    `,
    `
/**
 * @param a
 * @default 1
 * @returns b
 * @throws c
 * @note d
 * @deprecated e
 * @see f
 */
    `,
    `
/**
 * @param a
 * @param b
 */
    `,
    `
/**
 * @param a
 * @custom b
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
 * @returns a
 * @param b
 */
    `,
  ],
  invalid: [
    {
      code: `
/**
 * @returns b
 * @param a
 */
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
/**
 * @see f
 * @deprecated e
 */
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
/**
 * @default 1
 * @param a
 */
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
/**
 * @custom b
 * @param a
 */
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
/**
 * @see f
 * @deprecated e
 * @param a
 */
      `,
      errors: [{ messageId: "order" }],
    },
  ],
});
