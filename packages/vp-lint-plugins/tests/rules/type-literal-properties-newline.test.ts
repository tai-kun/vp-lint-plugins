import typeLiteralPropertiesNewline from "../../src/rules/type-literal-properties-newline.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("type-literal-properties-newline", typeLiteralPropertiesNewline, {
  valid: [
    "type Value = { a: string };",
    `
type Value = {
  a: string;
  b: number;
};
    `,
    `
interface Value {
  a: string;
}
    `,
  ],
  invalid: [
    {
      code: `
type Value = { a: string; b: number };
      `,
      errors: [{ messageId: "multiline" }],
      output: `
type Value = {
 a: string; b: number };
      `,
    },
    {
      code: `
type Value = { a: string;
  b: number };
      `,
      errors: [{ messageId: "multiline" }],
      output: `
type Value = {
 a: string;
  b: number };
      `,
    },
  ],
});
