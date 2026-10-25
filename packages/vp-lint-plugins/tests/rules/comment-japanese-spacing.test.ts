import commentJapaneseSpacing from "../../src/rules/comment-japanese-spacing.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("comment-japanese-spacing", commentJapaneseSpacing, {
  valid: [
    "// これは Vite+ のテストです。",
    "// これは（test）です。",
    "// 「Vite+」のテストです。",
    "// これは、test です。",
    "// 404 の場合、再試行します。",
    "// これは（テスト）です。",
    "// これは.test",
    "// https://example.com を参照してください。",
    `
// \`\`\`
// const value = 1;
// \`\`\`
    `,
    `
// eslint-disable-next-line no-console
console.log(1);
    `,
    `
/**
 * @param value 値
 */
    `,
    `
/**
 * @example
 * const 日本 = 1;
 */
    `,
  ],
  invalid: [
    {
      code: "// Vite+のlint",
      errors: [{ messageId: "spacing" }, { messageId: "spacing" }],
      output: "// Vite+ の lint",
    },
    {
      code: "// 404の場合",
      errors: [{ messageId: "spacing" }],
      output: "// 404 の場合",
    },
    {
      code: "// v2に更新",
      errors: [{ messageId: "spacing" }],
      output: "// v2 に更新",
    },
    {
      code: "// これはVite+です",
      errors: [{ messageId: "spacing" }, { messageId: "spacing" }],
      output: "// これは Vite+ です",
    },
    {
      code: "// これは  404です",
      errors: [{ messageId: "spacing" }, { messageId: "spacing" }],
      output: "// これは 404 です",
    },
    {
      code: "// これは`foo`です",
      errors: [{ messageId: "spacing" }, { messageId: "spacing" }],
      output: "// これは `foo` です",
    },
    {
      code: "// 詳細はhttps://example.comです",
      errors: [{ messageId: "spacing" }, { messageId: "spacing" }],
      output: "// 詳細は https://example.com です",
    },
    {
      code: `
/**
 * これはVite+です
 */
      `,
      errors: [{ messageId: "spacing" }, { messageId: "spacing" }],
      output: `
/**
 * これは Vite+ です
 */
      `,
    },
    {
      code: "/* これはVite+です */",
      errors: [{ messageId: "spacing" }, { messageId: "spacing" }],
      output: "/* これは Vite+ です */",
    },
  ],
});
