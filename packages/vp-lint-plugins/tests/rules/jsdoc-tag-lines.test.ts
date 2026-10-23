import jsdocTagLines from "../../src/rules/jsdoc-tag-lines.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("jsdoc-tag-lines", jsdocTagLines, {
  valid: [
    "/**\n * 説明です。\n *\n * @param a\n * @param b\n *\n * @returns c\n */\nfunction f(a: string, b: number): string {\n  return a;\n}",
    "/**\n * @param a\n *\n * @returns b\n */\nfunction f(a: string): string {\n  return a;\n}",
    "/**\n * @see https://example.com\n * @see https://example.org\n */",
    "/**\n * 説明です。\n */",
    "/**\n * @example\n *\n * const a = 1;\n */",
    "/** @param a */",
    "/**\n * 説明です。\n *\n * 続きです。\n *\n * @param a\n */",
  ],
  invalid: [
    {
      code: "/**\n * 説明です。\n * @param a\n */\nfunction f(a: string): string {\n  return a;\n}",
      errors: [{ messageId: "missingBlankLine" }],
      output:
        "/**\n * 説明です。\n *\n * @param a\n */\nfunction f(a: string): string {\n  return a;\n}",
    },
    {
      code: "/**\n * @param a\n * @returns b\n */\nfunction f(a: string): string {\n  return a;\n}",
      errors: [{ messageId: "missingBlankLine" }],
      output:
        "/**\n * @param a\n *\n * @returns b\n */\nfunction f(a: string): string {\n  return a;\n}",
    },
    {
      code: "/**\n * @param a\n *\n * @param b\n */\nfunction f(a: string, b: number): void {}",
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: "/**\n * @param a\n * @param b\n */\nfunction f(a: string, b: number): void {}",
    },
    {
      code: "/**\n * @returns a\n * @throws b\n */",
      errors: [{ messageId: "missingBlankLine" }],
      output: "/**\n * @returns a\n *\n * @throws b\n */",
    },
    {
      code: "/**\n * @param a\n *\n */",
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: "/**\n * @param a\n */",
    },
    {
      code: "/**\n *\n * @param a\n */",
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: "/**\n * @param a\n */",
    },
  ],
});
