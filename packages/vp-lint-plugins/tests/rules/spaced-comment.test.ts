import spacedComment from "../../src/rules/spaced-comment.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("spaced-comment", spacedComment, {
  valid: [
    "// comment\nconst a = 1;",
    "//\nconst a = 1;",
    "//\tcomment\nconst a = 1;",
    '/// <reference types="node" />',
    "//#region",
    "//#endregion",
    "//@ts-check",
    "//----",
    "/* comment */",
    "/**\n * comment\n */",
    "/*! license */",
    "/* */",
  ],
  invalid: [
    {
      code: "//comment\nconst a = 1;",
      errors: [{ messageId: "missingLeadingSpace" }],
      output: "// comment\nconst a = 1;",
    },
    {
      code: "/*comment*/",
      errors: [{ messageId: "missingLeadingSpace" }],
      output: "/* comment */",
    },
    {
      code: "/**comment*/",
      errors: [{ messageId: "missingLeadingSpace" }],
      output: "/** comment */",
    },
    {
      code: "/*comment */",
      errors: [{ messageId: "missingLeadingSpace" }],
      output: "/* comment */",
    },
    {
      code: "/* comment*/",
      errors: [{ messageId: "missingTrailingSpace" }],
      output: "/* comment */",
    },
    {
      code: "/*comment\n * more */",
      errors: [{ messageId: "missingLeadingSpace" }],
      output: "/* comment\n * more */",
    },
    {
      code: "//TODO: あとで直します。",
      errors: [{ messageId: "missingLeadingSpace" }],
      output: "// TODO: あとで直します。",
    },
  ],
});
