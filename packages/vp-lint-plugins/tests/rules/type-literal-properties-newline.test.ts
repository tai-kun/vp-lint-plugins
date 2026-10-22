import typeLiteralPropertiesNewline from "../../src/rules/type-literal-properties-newline.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("type-literal-properties-newline", typeLiteralPropertiesNewline, {
  valid: [
    "type Value = { a: string };",
    "type Value = {\n  a: string;\n  b: number;\n};",
    "interface Value {\n  a: string;\n}",
  ],
  invalid: [
    {
      code: "type Value = { a: string; b: number };",
      errors: [{ messageId: "multiline" }],
      output: "type Value = {\n a: string; b: number };",
    },
    {
      code: "type Value = { a: string;\n  b: number };",
      errors: [{ messageId: "multiline" }],
      output: "type Value = {\n a: string;\n  b: number };",
    },
  ],
});
