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
  ],
  invalid: [
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
