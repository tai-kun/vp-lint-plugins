import type { Comment } from "vite-plus/lint/plugins";
import { test, describe } from "vite-plus/test";

import { isComment, isDocComment } from "../../src/rules/_blank-line-utils.js";

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
});
