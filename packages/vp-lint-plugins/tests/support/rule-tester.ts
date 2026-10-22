import { RuleTester } from "vite-plus/lint/plugins-dev";
import { test, describe } from "vite-plus/test";

/**
 * RuleTester のテスト実行を Vitest に委譲します。
 */
function configureRuleTester(): void {
  RuleTester.describe = describe;
  RuleTester.it = test;
}

/**
 * TypeScript として解釈する RuleTester を作成します。
 * JSX を含むケースは、テストケースごとに `.tsx` などの filename を指定してください。
 */
function createRuleTester(): RuleTester {
  configureRuleTester();

  return new RuleTester({
    languageOptions: {
      parserOptions: { lang: "ts" },
    },
  });
}

export { createRuleTester };
