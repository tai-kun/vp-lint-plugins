import type { ESTree, Comment, SourceCode } from "vite-plus/lint/plugins";
import { test, describe } from "vite-plus/test";

import { isComment, isDocComment, getInsertionTarget } from "../../src/rules/_blank-line-utils.js";

/**
 * 指定した値を保持するブロックコメントを作成します。
 * 実行時には値が null のコメントを受け取る場合があるため、値の型は問いません。
 */
function createBlockComment(value: unknown): Comment {
  return {
    type: "Block",
    value,
  } as unknown as Comment;
}

/** 指定した開始行と終了行を持つ位置情報を作成します。 */
function createLoc(startLine: number, endLine: number): Comment["loc"] {
  return {
    end: {
      line: endLine,
      column: 0,
    },
    start: {
      line: startLine,
      column: 0,
    },
  };
}

/** 指定した範囲と終了行を持つ文を作成します。 */
function createStatement(start: number, end: number, endLine: number): ESTree.Node {
  return {
    loc: createLoc(1, endLine),
    range: [start, end],
  } as unknown as ESTree.Node;
}

/** 指定した範囲と開始行を持つブロックコメントを作成します。 */
function createPositionedComment(start: number, end: number, line: number): Comment {
  return {
    loc: createLoc(line, line),
    type: "Block",
    range: [start, end],
  } as unknown as Comment;
}

/** 指定したコメント配列を返す最小の SourceCode を作成します。 */
function createSourceCode(comments: Comment[]): SourceCode {
  return { getAllComments: () => comments } as unknown as SourceCode;
}

describe("_blank-line-utils", () => {
  describe("isDocComment", () => {
    test("値が null のブロックコメントを JSDoc として扱わない", ({ expect }) => {
      // 準備します。
      const comment = createBlockComment(null);

      // 実行と検証します。
      expect(isDocComment(comment)).toBe(false);
    });

    test("JSDoc 形式のブロックコメントを検出する", ({ expect }) => {
      // 準備します。
      const comment = createBlockComment("* 説明です。");

      // 実行と検証します。
      expect(isDocComment(comment)).toBe(true);
    });

    test("通常のブロックコメントを JSDoc として扱わない", ({ expect }) => {
      // 準備します。
      const comment = createBlockComment(" 通常のコメントです。");

      // 実行と検証します。
      expect(isDocComment(comment)).toBe(false);
    });
  });

  describe("isComment", () => {
    test("null をコメントとして扱わない", ({ expect }) => {
      // 実行と検証します。
      expect(isComment(null as unknown as Comment)).toBe(false);
    });
  });

  describe("getInsertionTarget", () => {
    test("位置情報のないコメントを無視して次の文を返す", ({ expect }) => {
      // 準備します。
      const previous = createStatement(0, 10, 1);
      const next = createStatement(30, 40, 5);
      const corrupt = {
        ...createPositionedComment(12, 25, 3),
        range: null,
        loc: null,
      } as unknown as Comment;
      const sourceCode = createSourceCode([corrupt]);
      // 実行と検証します。
      expect(getInsertionTarget(previous, next, sourceCode)).toBe(next);
    });

    test("次の文に付くコメントを挿入位置として返す", ({ expect }) => {
      // 準備します。
      const previous = createStatement(0, 10, 1);
      const next = createStatement(30, 40, 5);
      const comment = createPositionedComment(12, 25, 3);
      const sourceCode = createSourceCode([comment]);
      // 実行と検証します。
      expect(getInsertionTarget(previous, next, sourceCode)).toBe(comment);
    });
  });
});
