import commentOneSentencePerLine from "../../src/rules/comment-one-sentence-per-line.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("comment-one-sentence-per-line", commentOneSentencePerLine, {
  valid: [
    `
    /**
     * これは文です。
     * これも文です。
     */
    const a = 1;
    `,
    `
    // これは文です。
    // これも文です。
    const a = 1;
    `,
    `
    /**
     * const value = 1;
     * return value;
     */
    `,
    `
    /**
     * \`\`\`ts
     * const value = 1;
     * \`\`\`
     * これは説明です。
     */
    `,
    `
    /**
     * - 1 つ目
     * - 2 つ目
     */
    `,
    `
    // 文の途中

    // 次の文です。
    `,
    `
    /**
     * TODO: あとで直します。
     * これは説明です。
     */
    `,
    `
    /**
     * @param value 値
     * @returns 結果
     */
    `,
    `
    /**
     * メモ:
     * これは説明です。
     */
    `,
    `
    /**
     * 「注意:」
     * 必ず確認してください。
     */
    `,
    `
    // 理由は「A:」
    // 次の文です。
    `,
    `
    /**
     * @example
     * const value = 1;
     * これは説明の続きです
     */
    `,
    `
    // 「これは文です。」
    // これは説明です。
    `,
    `
    /*
      これは文の途中
      改行されています。
    */
    `,
    `
    /**
     * これは文です。
     *
     * これは説明です。
     */
    `,
    `
    /**
     * これは文です。
     * これも文です。
     */
    `,
    `
    /**
     * これは文です。
     *
     */
    `,
    "/** これは文です。 */",
    "/*#__PURE__*/",
  ],
  invalid: [
    {
      code: `
      /**
       * これは文の途中で
       * 改行されています。
       */
      const a = 1;
      `,
      errors: [{ messageId: "singleLine" }],
      output: `
      /** これは文の途中で改行されています。 */
      const a = 1;
      `,
    },
    {
      code: `
      /**
       * This is a
       * sentence.
       */
      const a = 1;
      `,
      errors: [{ messageId: "singleLine" }],
      output: `
      /** This is a sentence. */
      const a = 1;
      `,
    },
    {
      code: `
      /**
       * これは文です。
       */
      const a = 1;
      `,
      errors: [{ messageId: "singleLine" }],
      output: `
      /** これは文です。 */
      const a = 1;
      `,
    },
    {
      code: `
      /**
       * これは文の途中
       */
      const a = 1;
      `,
      errors: [{ messageId: "singleLine" }],
      output: `
      /** これは文の途中 */
      const a = 1;
      `,
    },
    {
      code: `
      /** This is a
       * sentence. */
      const a = 1;
      `,
      errors: [{ messageId: "singleLine" }],
      output: `
      /** This is a sentence. */
      const a = 1;
      `,
    },
    {
      code: `
      /**
       * This is a sentence,
       * and it continues.
       */
      const a = 1;
      `,
      errors: [{ messageId: "singleLine" }],
      output: `
      /** This is a sentence, and it continues. */
      const a = 1;
      `,
    },
    {
      code: `
      /**
       * これは文の途中で、
       * 改行されています。
       */
      const a = 1;
      `,
      errors: [{ messageId: "singleLine" }],
      output: `
      /** これは文の途中で、改行されています。 */
      const a = 1;
      `,
    },
    {
      code: `
      // これは文の途中で
      // 改行されています。
      const a = 1;
      `,
      errors: [{ messageId: "oneSentence" }],
      output: `
      // これは文の途中で改行されています。
      const a = 1;
      `,
    },
    {
      code: `
      // This is a
      // sentence.
      const a = 1;
      `,
      errors: [{ messageId: "oneSentence" }],
      output: `
      // This is a sentence.
      const a = 1;
      `,
    },
    {
      code: `
      // これは文の途中で
      // 改行されていて
      // まだ続きます。
      const a = 1;
      `,
      errors: [{ messageId: "oneSentence" }, { messageId: "oneSentence" }],
      output: `
      // これは文の途中で改行されていてまだ続きます。
      const a = 1;
      `,
    },
  ],
});
ruleTester.run("comment-one-sentence-per-line (requireEndPunctuation)", commentOneSentencePerLine, {
  valid: [
    {
      code: `
      // これは文です。
      const a = 1;
      `,
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: `
      // 準備:
      // 内容です。
      `,
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: `
      // eslint-disable-next-line no-console
      console.log(1);
      `,
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: `
      // TODO: あとで直します。
      const a = 1;
      `,
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: `
      /**
       * @param value 値
       */
      `,
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: `
      /**
       * - 項目
       */
      `,
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: `
      /**
       * const value = 1;
       */
      `,
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: `
      /**
       * これは文です。
       * これも文です。
       */
      `,
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: "/** これは文です。 */",
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: "// [API Reference](https://example.com/)",
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: "/*#__PURE__*/",
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: "/** [API Reference](https://example.com/) */",
      options: [{ requireEndPunctuation: true }],
    },
  ],
  invalid: [
    {
      code: `
      // これは文です
      const a = 1;
      `,
      errors: [{ messageId: "missingEndPunctuation" }],
      output: null,
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: `
      /**
       * これは文です
       */
      `,
      errors: [{ messageId: "singleLine" }, { messageId: "missingEndPunctuation" }],
      output: `
      /** これは文です */
      `,
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: `
      /**
       * これは文です。
       * これも文です
       */
      `,
      errors: [{ messageId: "missingEndPunctuation" }],
      output: null,
      options: [{ requireEndPunctuation: true }],
    },
    {
      code: "/** これは文です */",
      errors: [{ messageId: "missingEndPunctuation" }],
      output: null,
      options: [{ requireEndPunctuation: true }],
    },
  ],
});
