import spacedComment from "../../src/rules/spaced-comment.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("spaced-comment", spacedComment, {
  valid: [
    `
// comment
const a = 1;
    `,
    `
//
const a = 1;
    `,
    `
//	comment
const a = 1;
    `,
    '/// <reference types="node" />',
    "//#region",
    "//#endregion",
    "//@ts-check",
    "//----",
    "/* comment */",
    `
/**
 * comment
 */
    `,
    "/*! license */",
    "/* */",
    "/*#__PURE__*/",
  ],
  invalid: [
    {
      code: `
//comment
const a = 1;
      `,
      errors: [{ messageId: "missingLeadingSpace" }],
      output: `
// comment
const a = 1;
      `,
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
      code: `
/*comment
 * more */
      `,
      errors: [{ messageId: "missingLeadingSpace" }],
      output: `
/* comment
 * more */
      `,
    },
    {
      code: "//TODO: あとで直します。",
      errors: [{ messageId: "missingLeadingSpace" }],
      output: "// TODO: あとで直します。",
    },
  ],
});
