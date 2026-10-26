import type { Comment } from "vite-plus/lint/plugins";
import { test, describe } from "vite-plus/test";

import { hasCommentPosition } from "../../src/rules/_comment-utils.js";

/**
 * 指定した位置情報を持つコメントを作成します。
 * 実行時には null の位置情報を保持する場合があるため、値の型は問いません。
 */
function createComment(range: unknown, loc: unknown): Comment {
  return {
    loc,
    type: "Block",
    range,
  } as unknown as Comment;
}

describe("_comment-utils", () => {
  describe("hasCommentPosition", () => {
    test("位置情報を持つコメントを有効として扱う", ({ expect }) => {
      // 準備します。
      const comment = createComment([0, 10], {
        end: {
          line: 1,
          column: 10,
        },
        start: {
          line: 1,
          column: 0,
        },
      });
      // 実行と検証します。
      expect(hasCommentPosition(comment)).toBe(true);
    });

    test("null を無効として扱う", ({ expect }) => {
      // 実行と検証します。
      expect(hasCommentPosition(null as unknown as Comment)).toBe(false);
    });

    test("range が null のコメントを無効として扱う", ({ expect }) => {
      // 準備します。
      const comment = createComment(null, {
        end: {
          line: 1,
          column: 10,
        },
        start: {
          line: 1,
          column: 0,
        },
      });
      // 実行と検証します。
      expect(hasCommentPosition(comment)).toBe(false);
    });

    test("loc が null のコメントを無効として扱う", ({ expect }) => {
      // 準備します。
      const comment = createComment([0, 10], null);
      // 実行と検証します。
      expect(hasCommentPosition(comment)).toBe(false);
    });
  });
});
