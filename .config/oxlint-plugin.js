import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

const sourceRoot = new URL("../packages/vp-lint-plugins/src/", import.meta.url).href;
// Oxlint は JS プラグインを Node.js の ESM ローダーで読み込みます。
// パッケージのソースは TypeScript のため、`.js` 指定の相対 import を `.ts` に解決し直します。
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith(".") &&
      specifier.endsWith(".js") &&
      context.parentURL?.startsWith(sourceRoot) === true
    ) {
      const tsUrl = new URL(`${specifier.slice(0, -3)}.ts`, context.parentURL);

      if (existsSync(fileURLToPath(tsUrl))) {
        return {
          url: tsUrl.href,
          shortCircuit: true,
        };
      }
    }

    return nextResolve(specifier, context);
  },
});

const { default: projectPlugin } = await import("../packages/vp-lint-plugins/src/index.ts");

export default projectPlugin;
