import { defineRule } from "vite-plus/lint/plugins";
import type { Fix, ESTree } from "vite-plus/lint/plugins";

/**
 * 禁止する catch 引数名（小文字で比較します）。
 */
const BANNED_NAMES: ReadonlySet<string> = new Set(["e", "err", "error", "reason"]);

/**
 * 診断対象の名前かどうかを返します。
 */
function isBannedName(name: string): boolean {
  return BANNED_NAMES.has(name.toLowerCase());
}

/**
 * catch の引数名に `e` / `err` / `error` / `reason` を使わせません。
 *
 * `error` は `Error` オブジェクトと紛らわしく、`reason` は拒否理由との区別が付きにくいため、例外であることを示す `ex`（推奨）や `exception` を使ってください。
 */
const catchParamName = defineRule({
  meta: {
    docs: {
      description: "Disallow `e`, `err`, `error` and `reason` as catch clause parameter names.",
    },
    type: "suggestion",
    messages: {
      renameToEx: "`ex` にリネームする",
      catchParamName:
        "catch の引数名に `{{ name }}` は使わないでください。`ex`（推奨）や `exception` を使ってください。",
      renameToException: "`exception` にリネームする",
    },
    hasSuggestions: true,
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      CatchClause(node): void {
        const param = node.param;

        if (param === null || param.type !== "Identifier") {
          return;
        }

        const name = param.name;

        if (!isBannedName(name)) {
          return;
        }

        const variables = sourceCode.getDeclaredVariables(node);
        const variable = variables.find((candidate) => candidate.name === name);

        const targets = new Map<number, ESTree.Node>();
        const addTarget = (identifier: ESTree.Node): void => {
          if (!targets.has(identifier.range[0])) {
            targets.set(identifier.range[0], identifier);
          }
        };
        addTarget(param);

        if (variable !== undefined) {
          for (const reference of variable.references) {
            const identifier = reference.identifier;

            if (identifier.name !== name) {
              continue;
            }

            addTarget(identifier);
          }
        }

        const identifiers = [...targets.values()].sort((a, b) => a.range[0] - b.range[0]);
        context.report({
          data: { name },
          node: param,
          suggest: [
            {
              fix(fixer): Fix[] {
                return identifiers.map((identifier) => {
                  // 引数本体は `catch (error: unknown)` のように型注釈を含むため、名前部分だけを置換します。
                  if (identifier.range[0] === param.range[0]) {
                    return fixer.replaceTextRange(
                      [param.range[0], param.range[0] + name.length],
                      "ex",
                    );
                  }

                  return fixer.replaceText(identifier, "ex");
                });
              },
              messageId: "renameToEx",
            },
            {
              fix(fixer): Fix[] {
                return identifiers.map((identifier) => {
                  if (identifier.range[0] === param.range[0]) {
                    return fixer.replaceTextRange(
                      [param.range[0], param.range[0] + name.length],
                      "exception",
                    );
                  }

                  return fixer.replaceText(identifier, "exception");
                });
              },
              messageId: "renameToException",
            },
          ],
          messageId: "catchParamName",
        });
      },
    };
  },
});

export default catchParamName;
