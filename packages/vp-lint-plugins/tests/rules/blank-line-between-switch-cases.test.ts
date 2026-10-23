import blankLineBetweenSwitchCases from "../../src/rules/blank-line-between-switch-cases.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("blank-line-between-switch-cases", blankLineBetweenSwitchCases, {
  valid: [
    "switch (x) {\n  case 1:\n    a();\n\n  case 2:\n    b();\n}",
    "switch (x) {\n  case 1:\n  case 2:\n    a();\n}",
    "switch (x) {\n  case 1:\n    a();\n}",
    "switch (x) {\n  case 1:\n    a();\n\n  default:\n    b();\n}",
  ],
  invalid: [
    {
      code: "switch (x) {\n  case 1:\n    a();\n  case 2:\n    b();\n}",
      errors: [{ messageId: "blankLine" }],
      output: "switch (x) {\n  case 1:\n    a();\n\n  case 2:\n    b();\n}",
    },
    {
      code: "switch (x) {\n  case 1:\n    a();\n  // comment\n  case 2:\n    b();\n}",
      errors: [{ messageId: "blankLine" }],
      output: "switch (x) {\n  case 1:\n    a();\n\n  // comment\n  case 2:\n    b();\n}",
    },
    {
      code: "switch (x) { case 1: a(); case 2: b(); }",
      errors: [{ messageId: "blankLine" }],
      output: "switch (x) { case 1: a();\n\n case 2: b(); }",
    },
  ],
});
