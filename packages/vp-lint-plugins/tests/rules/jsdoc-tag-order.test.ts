import jsdocTagOrder from "../../src/rules/jsdoc-tag-order.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("jsdoc-tag-order", jsdocTagOrder, {
  valid: [
    "/**\n * @param a\n * @returns b\n */",
    "/**\n * @template T\n * @param a\n */",
    "/**\n * @param a\n * @default 1\n * @returns b\n * @throws c\n * @note d\n * @deprecated e\n * @see f\n */",
    "/**\n * @param a\n * @param b\n */",
    "/**\n * @param a\n * @custom b\n */",
    "/**\n * 説明です。\n */",
    "/**\n * @example\n * @returns a\n * @param b\n */",
  ],
  invalid: [
    {
      code: "/**\n * @returns b\n * @param a\n */",
      errors: [{ messageId: "order" }],
    },
    {
      code: "/**\n * @see f\n * @deprecated e\n */",
      errors: [{ messageId: "order" }],
    },
    {
      code: "/**\n * @default 1\n * @param a\n */",
      errors: [{ messageId: "order" }],
    },
    {
      code: "/**\n * @custom b\n * @param a\n */",
      errors: [{ messageId: "order" }],
    },
    {
      code: "/**\n * @see f\n * @deprecated e\n * @param a\n */",
      errors: [{ messageId: "order" }],
    },
  ],
});
