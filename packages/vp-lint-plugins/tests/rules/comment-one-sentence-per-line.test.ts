import commentOneSentencePerLine from "../../src/rules/comment-one-sentence-per-line.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("comment-one-sentence-per-line", commentOneSentencePerLine, {
  valid: [
    "/**\n * これは文です。\n * これも文です。\n */\nconst a = 1;",
    "// これは文です。\n// これも文です。\nconst a = 1;",
    "/**\n * const value = 1;\n * return value;\n */",
    "/**\n * ```ts\n * const value = 1;\n * ```\n * これは説明です。\n */",
    "/**\n * - 1 つ目\n * - 2 つ目\n */",
    "// 文の途中\n\n// 次の文です。",
    "/**\n * TODO: あとで直します。\n * これは説明です。\n */",
    "/**\n * @param value 値\n * @returns 結果\n */",
    "/**\n * メモ:\n * これは説明です。\n */",
    "/**\n * @example\n * const value = 1;\n * これは説明の続きです\n */",
    "// 「これは文です。」\n// これは説明です。",
    "/*\n  これは文の途中\n  改行されています。\n*/",
    "/**\n * これは文の途中\n */",
  ],
  invalid: [
    {
      code: "/**\n * これは文の途中で\n * 改行されています。\n */\nconst a = 1;",
      errors: [{ messageId: "oneSentence" }],
      output: "/**\n * これは文の途中で改行されています。\n */\nconst a = 1;",
    },
    {
      code: "/**\n * This is a\n * sentence.\n */\nconst a = 1;",
      errors: [{ messageId: "oneSentence" }],
      output: "/**\n * This is a sentence.\n */\nconst a = 1;",
    },
    {
      code: "// これは文の途中で\n// 改行されています。\nconst a = 1;",
      errors: [{ messageId: "oneSentence" }],
      output: "// これは文の途中で改行されています。\nconst a = 1;",
    },
    {
      code: "// This is a\n// sentence.\nconst a = 1;",
      errors: [{ messageId: "oneSentence" }],
      output: "// This is a sentence.\nconst a = 1;",
    },
    {
      code: "// これは文の途中で\n// 改行されていて\n// まだ続きます。\nconst a = 1;",
      errors: [{ messageId: "oneSentence" }, { messageId: "oneSentence" }],
      output: "// これは文の途中で改行されていてまだ続きます。\nconst a = 1;",
    },
  ],
});
