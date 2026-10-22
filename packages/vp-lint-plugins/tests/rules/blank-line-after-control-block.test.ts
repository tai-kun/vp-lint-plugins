import blankLineAfterControlBlock from "../../src/rules/blank-line-after-control-block.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("blank-line-after-control-block", blankLineAfterControlBlock, {
  valid: [
    "if (a) {\n  b();\n}\n\nc();",
    "if (a) {\n  b();\n}",
    "if (a) {\n  b();\n};\nc();",
    "if (a) {\n  b();\n}\n// comment",
  ],
  invalid: [
    {
      code: "if (a) {\n  b();\n}\nc();",
      errors: [{ messageId: "blankLine" }],
      output: "if (a) {\n  b();\n}\n\nc();",
    },
    {
      code: "if (a) b(); c();",
      errors: [{ messageId: "blankLine" }],
      output: "if (a) b();\n\n c();",
    },
    {
      code: "if (a) {\n  b();\n}\n// comment\nc();",
      errors: [{ messageId: "blankLine" }],
      output: "if (a) {\n  b();\n}\n\n// comment\nc();",
    },
    {
      code: "for (const x of xs) {\n  b(x);\n}\nc();",
      errors: [{ messageId: "blankLine" }],
      output: "for (const x of xs) {\n  b(x);\n}\n\nc();",
    },
  ],
});
