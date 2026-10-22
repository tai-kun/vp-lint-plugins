import { test, describe } from "vite-plus/test";

import { add } from "../src/add.js";

describe("add", () => {
  test.for([
    {
      a: 1,
      b: 2,
      expected: 3,
    },
    {
      a: 0,
      b: 0,
      expected: 0,
    },
    {
      a: -1,
      b: 1,
      expected: 0,
    },
    {
      a: 0.1,
      b: 0.2,
      expected: 0.30000000000000004,
    },
  ])("add($a, $b) -> $expected", ({ a, b, expected }, { expect }) => {
    // 実行
    const actual = add(a, b);

    // 検証
    expect(actual).toBe(expected);
  });
});
