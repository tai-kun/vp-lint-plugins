import { test, describe } from "vite-plus/test";

import plugin from "../src/index.js";

describe("plugin", () => {
  test("デフォルトエクスポートで tai-kun プラグインを公開する", ({ expect }) => {
    // 実行と検証
    expect(plugin.meta?.name).toBe("tai-kun");
  });
});
