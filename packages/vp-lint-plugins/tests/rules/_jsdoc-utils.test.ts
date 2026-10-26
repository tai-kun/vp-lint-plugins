import type { ESTree, Comment, SourceCode } from "vite-plus/lint/plugins";
import { test, describe } from "vite-plus/test";

import { getNodeJSDoc } from "../../src/rules/_jsdoc-utils.js";

/**
 * 指定した範囲を持つノードを作成します。
 */
function createNode(start: number, end: number): ESTree.Node {
  return { range: [start, end] } as unknown as ESTree.Node;
}

/**
 * 指定した範囲と終了行を持つブロックコメントを作成します。
 */
function createComment(start: number, end: number, endLine: number): Comment {
  return {
    loc: {
      end: {
        line: endLine,
        column: 8,
      },
      start: {
        line: 1,
        column: 0,
      },
    },
    type: "Block",
    range: [start, end],
  } as unknown as Comment;
}

describe("_jsdoc-utils", () => {
  describe("getNodeJSDoc", () => {
    test("位置情報のないコメントを無視して null を返す", ({ expect }) => {
      // 準備します。
      const corrupt = {
        ...createComment(0, 8, 1),
        range: null,
        loc: null,
      } as unknown as Comment;
      const node = createNode(9, 15);
      const sourceCode = {
        getAllComments: () => [corrupt],
      } as unknown as SourceCode;
      // 実行と検証します。
      expect(getNodeJSDoc(node, sourceCode)).toBe(null);
    });

    test("直上の JSDoc コメントを返す", ({ expect }) => {
      // 準備します。
      const comment = createComment(0, 8, 1);
      const node = createNode(9, 15);
      const sourceCode = {
        text: "/** A */\nconst a = 1;",
        getText: () => "/** A */",
        getAllComments: () => [comment],
        getLocFromIndex: () => ({
          line: 2,
          column: 0,
        }),
      } as unknown as SourceCode;
      // 実行と検証します。
      expect(getNodeJSDoc(node, sourceCode)).toBe(comment);
    });
  });
});
