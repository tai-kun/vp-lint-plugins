import blankLineAfterVariableDeclaration from "../../src/rules/blank-line-after-variable-declaration.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("blank-line-after-variable-declaration", blankLineAfterVariableDeclaration, {
  valid: [
    "const a = 1;\nconst b = 2;\n\nfoo();",
    "export const a = 1;\nexport const b = 2;\n\nfoo();",
    "export const a = 1;\nconst b = 2;\n\nfoo();",
    "const a = 1;\n\nfoo();",
    "const a = 1;\nreturn a;",
    "function f() {\n  const a = 1;\n  return a;\n}",
    "for (const x of xs) {\n  foo(x);\n}",
    "const a = 1;",
    "const ready = items;\nready.sort(compare);\n\nconst sorted = [];",
    "const ready = items;\nready.sort(compare);",
    "const ready = items;\nready.sort(compare);\nready.reverse();\n\nconst sorted = [];",
    "const { ready } = state;\nready.sort(compare);\n\nconst sorted = [];",
    "export const ready = items;\nready.sort(compare);\n\nconst sorted = [];",
    "const ready = items;\nready.sort(compare);\nreturn ready;",
  ],
  invalid: [
    {
      code: "const ready = items;\n\nready.sort(compare);",
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: "const ready = items;\nready.sort(compare);",
    },
    {
      code: "const ready = items;\n\nready.sort(compare);\nconst sorted = [];",
      errors: [{ messageId: "unexpectedBlankLine" }, { messageId: "blankLine" }],
      output: "const ready = items;\nready.sort(compare);\n\nconst sorted = [];",
    },
    {
      code: "const ready = items;\nready.sort(compare);\n\nready.reverse();",
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: "const ready = items;\nready.sort(compare);\nready.reverse();",
    },
    {
      code: "const ready = items;\n\n// sort\nready.sort(compare);",
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: "const ready = items;\n// sort\nready.sort(compare);",
    },
    {
      code: "function f() {\n  const ready = items;\n\n  ready.sort(compare);\n  const sorted = [];\n}",
      errors: [{ messageId: "unexpectedBlankLine" }, { messageId: "blankLine" }],
      output:
        "function f() {\n  const ready = items;\n  ready.sort(compare);\n\n  const sorted = [];\n}",
    },
    {
      code: "const ready = items;\nready.sort(compare);\nconst sorted = [];",
      errors: [{ messageId: "blankLine" }],
      output: "const ready = items;\nready.sort(compare);\n\nconst sorted = [];",
    },
    {
      code: "const ready = items;\nready.sort(compare);\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const ready = items;\nready.sort(compare);\n\nfoo();",
    },
    {
      code: "function f() {\n  const ready = items;\n  ready.sort(compare);\n  const sorted = [];\n}",
      errors: [{ messageId: "blankLine" }],
      output:
        "function f() {\n  const ready = items;\n  ready.sort(compare);\n\n  const sorted = [];\n}",
    },
    {
      code: "const ready = items;\nready.sort(compare);\n// comment\nconst sorted = [];",
      errors: [{ messageId: "blankLine" }],
      output: "const ready = items;\nready.sort(compare);\n\n// comment\nconst sorted = [];",
    },
    {
      code: "const a = 1;\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\nfoo();",
    },
    {
      code: "export const a = 1;\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "export const a = 1;\n\nfoo();",
    },
    {
      code: "const a = 1;\nconst b = 2;\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\nconst b = 2;\n\nfoo();",
    },
    {
      code: "const a = 1;\nfunction f() {}",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\nfunction f() {}",
    },
    {
      code: "const a = 1;\n// comment\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\n// comment\nfoo();",
    },
    {
      code: "function f() {\n  const a = 1;\n  foo();\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  const a = 1;\n\n  foo();\n}",
    },
    {
      code: "const a = 1; foo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\n foo();",
    },
  ],
});
