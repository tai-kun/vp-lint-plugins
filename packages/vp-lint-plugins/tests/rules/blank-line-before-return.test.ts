import blankLineBeforeReturn from "../../src/rules/blank-line-before-return.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("blank-line-before-return", blankLineBeforeReturn, {
  valid: [
    "function f() {\n  return 1;\n}",
    "function f() {\n  const a = 1;\n\n  return a;\n}",
    "function f() {\n  if (a) {\n    b();\n  }\n  return 1;\n}",
    "function f() {\n  function g() {}\n  return 1;\n}",
    'function f() {\n  "use strict";\n  return 1;\n}',
    "function f() {\n  throw new Error();\n  return 1;\n}",
    "function f() {\n  switch (x) {\n    case 1:\n      return a;\n  }\n}",
  ],
  invalid: [
    {
      code: "function f() {\n  a();\n  return 1;\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  a();\n\n  return 1;\n}",
    },
    {
      code: "function f() {\n  const a = 1;\n  return a;\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  const a = 1;\n\n  return a;\n}",
    },
    {
      code: "function f() {\n  const a = 1;\n  // comment\n  return a;\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  const a = 1;\n\n  // comment\n  return a;\n}",
    },
    {
      code: "function f() {\n  switch (x) {\n    case 1:\n      a();\n      return a;\n  }\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  switch (x) {\n    case 1:\n      a();\n\n      return a;\n  }\n}",
    },
  ],
});
