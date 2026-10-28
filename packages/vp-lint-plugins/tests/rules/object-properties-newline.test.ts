import type { Context } from "vite-plus/lint/plugins";
import { test, describe } from "vite-plus/test";

import objectPropertiesNewline from "../../src/rules/object-properties-newline.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("object-properties-newline", objectPropertiesNewline, {
  valid: [
    "const value = { a: 1 };",
    `
const value = {
  b: 1,
  a: 2,
};
    `,
    "const value = { b: 1, a: 2 };",
  ],
  invalid: [
    {
      code: `
const value = { ...base, a: 1 };
      `,
      errors: [{ messageId: "multiline" }],
      output: `
const value = {
 ...base, a: 1 };
      `,
    },
    {
      code: `
const value = { b: 1, b: 2 };
      `,
      errors: [{ messageId: "multiline" }],
      output: `
const value = {
 b: 1, b: 2 };
      `,
    },
    {
      code: `
const value = { /* comment */ a: 1, b: 2 };
      `,
      errors: [{ messageId: "multiline" }],
      output: `
const value = {
 /* comment */ a: 1, b: 2 };
      `,
    },
  ],
});

/** `JSONObjectExpression` 検証用の報告形式です。 */
interface JsonReport {
  /** 修正後のテキストです。 */
  fixText: string;

  /** 修正範囲です。 */
  fixRange: readonly [number, number];

  /** 報告の識別子です。 */
  messageId: string;
}

/**
 * `JSONObjectExpression` 訪問を直接検証するための最小モックノードです。
 * RuleTester は JSON をパースできないため、ルールの `create` が返すビジターを直接呼び出します。
 */
function createJsonNode(
  propertyLines: readonly number[],
  nodeLine: number,
  rangeStart: number,
): unknown {
  return {
    loc: { start: { line: nodeLine } },
    range: [rangeStart, rangeStart + 1],
    properties: propertyLines.map((line) => ({ loc: { start: { line } } })),
  };
}

/**
 * 報告内容と fix 結果を取得するために使用します。
 * 実際の `Fixer` の代わりに範囲とテキストを記録します。
 */
function runJsonVisitor(node: unknown): { reports: JsonReport[] } {
  const reports: JsonReport[] = [];
  const context = {
    report(descriptor: {
      fix: (fixer: {
        insertTextAfterRange: (
          range: readonly [number, number],
          text: string,
        ) => {
          text: string;
          range: readonly [number, number];
        };
      }) => unknown;
      messageId: string;
    }): void {
      const fix = descriptor.fix({
        insertTextAfterRange: (range, text) => ({
          text,
          range,
        }),
      }) as {
        text: string;
        range: readonly [number, number];
      };
      reports.push({
        fixText: fix.text,
        fixRange: fix.range,
        messageId: descriptor.messageId,
      });
    },
  } as unknown as Context;

  const create = objectPropertiesNewline.create;

  if (create === undefined) {
    throw new Error("Rule must define create.");
  }

  const visitor = create(context);
  const handler = visitor["JSONObjectExpression"];

  if (handler === undefined) {
    throw new Error("Rule must handle JSONObjectExpression.");
  }

  handler(node as never);

  return { reports };
}

describe("object-properties-newline JSON", () => {
  test("プロパティーが1つのJSONは報告しない", ({ expect }) => {
    // 準備。
    const node = createJsonNode([1], 1, 0);

    // 実行。
    const { reports } = runJsonVisitor(node);

    // 検証。
    expect(reports).toStrictEqual([]);
  });

  test("複数行のJSONは報告しない", ({ expect }) => {
    // 準備。
    const node = createJsonNode([2, 3], 1, 0);

    // 実行。
    const { reports } = runJsonVisitor(node);

    // 検証。
    expect(reports).toStrictEqual([]);
  });

  test("1行で2プロパティーのJSONは `{` の直後に改行する", ({ expect }) => {
    // 準備。
    const code = '{"b": 1, "a": 2}';
    const node = createJsonNode([1, 1], 1, 0);

    // 実行。
    const { reports } = runJsonVisitor(node);

    // 検証。
    expect(reports.length).toBe(1);

    const first = reports[0] as JsonReport;
    expect(first.messageId).toBe("multiline");
    expect(first.fixText).toBe("\n");
    expect(first.fixRange).toStrictEqual([0, 1]);

    const [start] = first.fixRange;
    const fixed = `${code.slice(0, start + 1)}${first.fixText}${code.slice(start + 1)}`;
    expect(fixed).toBe('{\n"b": 1, "a": 2}');
  });
});
