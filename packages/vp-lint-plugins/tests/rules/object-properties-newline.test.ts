import objectPropertiesNewline from "../../src/rules/object-properties-newline.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("object-properties-newline", objectPropertiesNewline, {
  valid: [
    "const value = { a: 1 };",
    "const value = {\n  b: 1,\n  a: 2,\n};",
    "const value = { b: 1, a: 2 };",
  ],
  invalid: [
    {
      code: "const value = { ...base, a: 1 };",
      errors: [{ messageId: "multiline" }],
      output: "const value = {\n ...base, a: 1 };",
    },
    {
      code: "const value = { b: 1, b: 2 };",
      errors: [{ messageId: "multiline" }],
      output: "const value = {\n b: 1, b: 2 };",
    },
    {
      code: "const value = { /* comment */ a: 1, b: 2 };",
      errors: [{ messageId: "multiline" }],
      output: "const value = {\n /* comment */ a: 1, b: 2 };",
    },
  ],
});
