import { defineConfig } from "vite-plus";

const ignoredPaths = [
  "**/.history/**",
  "**/coverage/**",
  "**/dist/**",
  "skills/**",
  "website/.blume/**",
];

export default defineConfig({
  fmt: {
    semi: true,
    // 日本語の JSDoc は意図した行折り返しを保つため、JSDoc の再整形は無効にします。
    jsdoc: false,
    useTabs: false,
    tabWidth: 2,
    endOfLine: "lf",
    // 日本語の Markdown は改行位置が表示に影響するため、そのまま保持します。
    proseWrap: "preserve",
    // 2 プロパティー以上のオブジェクトは Oxlint の project/object-properties-newline で複数行にし、その改行を保持します。
    objectWrap: "preserve",
    printWidth: 100,
    quoteProps: "as-needed",
    // 既定値も明示し、Oxfmt の既定値変更によって出力が揺れないようにします。
    arrowParens: "always",
    singleQuote: false,
    sortImports: {
      order: "asc",
      groups: [
        "builtin",
        "external",
        ["internal", "subpath"],
        ["parent", "sibling", "index"],
        "style",
        "unknown",
      ],
      ignoreCase: true,
      internalPattern: ["~/", "@/", "#"],
      newlinesBetween: true,
      // 副作用のある import の順序は実行結果に影響するため、並べ替えません。
      sortSideEffects: false,
      partitionByComment: false,
      partitionByNewline: false,
    },
    trailingComma: "all",
    bracketSpacing: true,
    ignorePatterns: ignoredPaths,
    jsxSingleQuote: false,
    bracketSameLine: false,
    sortPackageJson: { sortScripts: true },
    insertFinalNewline: true,
    singleAttributePerLine: false,
    vueIndentScriptAndStyle: false,
    htmlWhitespaceSensitivity: "css",
    embeddedLanguageFormatting: "auto",
    experimentalOperatorPosition: "end",
  },
  lint: {
    env: { builtin: true },
    rules: {
      // ブロックと分岐の形を統一します。

      curly: "error",
      "no-lonely-if": "error",
      "no-else-return": "error",
      "no-lone-blocks": "error",
      "default-case-last": "error",
      "unicorn/switch-case-braces": ["error", "always"],
      // return の直前に処理がある場合は空行を 1 行入れます。
      "project/blank-line-before-return": "error",
      "unicorn/switch-case-break-position": "error",
      // 宣言の後に処理が続く場合は空行を 1 行入れます。
      "project/blank-line-after-declaration": "error",
      // 制御ブロックの後に処理が続く場合は空行を 1 行入れます。
      "project/blank-line-after-control-block": "error",

      // 式と文の書き方を統一します。

      yoda: ["error", "never"],
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "one-var": ["error", "never"],
      "func-style": ["error", "declaration", { allowArrowFunctions: true }],
      "no-multi-str": "error",
      "prefer-const": "error",
      "no-multi-assign": "error",
      "prefer-template": "error",
      "arrow-body-style": ["error", "as-needed"],
      "no-return-assign": "error",
      "object-shorthand": ["error", "always"],
      "no-nested-ternary": "error",
      "no-param-reassign": "error",
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "no-inline-comments": "error",
      "no-warning-comments": "error",
      "operator-assignment": ["error", "always"],
      "no-implicit-coercion": "error",
      "prefer-object-spread": "error",
      "prefer-arrow-callback": "error",
      // 正規表現には Unicode フラグを付けます。
      "require-unicode-regexp": "error",
      "no-useless-computed-key": "error",
      "unicorn/no-zero-fractions": "error",
      // 正規表現のキャプチャーグループには名前を付けます。
      "prefer-named-capture-group": "error",
      "unicorn/number-literal-case": "error",
      "logical-assignment-operators": "error",
      "prefer-exponentiation-operator": "error",
      "project/sort-object-properties": "error",
      // JSX の props は「一般 → on* → aria-* → data-*」の順にします。
      "project/sort-jsx-props": "error",
      // import / export の specifier は「型 → 変数など → default」の順にします。
      "project/sort-import-export-specifiers": "error",
      "unicorn/numeric-separators-style": "error",
      // 2 プロパティー以上のオブジェクトは複数行にし、可能なら名前の長さ→名前順に並べます。
      "project/object-properties-newline": "error",
      // コメントは 1 行 1 文にします。
      "project/comment-one-sentence-per-line": "error",
      // 2 つ以上のメンバーを持つ型リテラルは複数行にします。
      "project/type-literal-properties-newline": "error",
      "unicorn/consistent-template-literal-escape": "error",

      // import の並びと書き方を統一します。

      "import/first": "error",
      "import/exports-last": "error",
      "import/no-namespace": "error",
      "import/group-exports": "error",
      "import/no-duplicates": "error",
      "import/no-named-default": "error",
      "import/no-mutable-exports": "error",
      "import/newline-after-import": [
        "error",
        {
          count: 1,
          exactCount: true,
          considerComments: true,
        },
      ],
      "import/no-anonymous-default-export": "error",

      // TypeScript の構文を統一します。

      "typescript/array-type": [
        "error",
        {
          default: "array",
          readonly: "array",
        },
      ],
      "typescript/dot-notation": "error",
      "typescript/no-mixed-enums": "error",
      "typescript/prefer-readonly": "error",
      "typescript/unified-signatures": "error",
      "typescript/no-inferrable-types": "error",
      "typescript/consistent-type-exports": "error",
      "typescript/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      "typescript/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "as",
          arrayLiteralTypeAssertions: "allow",
          objectLiteralTypeAssertions: "allow",
        },
      ],
      "typescript/consistent-type-definitions": ["error", "interface"],
      "typescript/related-getter-setter-pairs": "error",
      "typescript/adjacent-overload-signatures": "error",
      "typescript/consistent-generic-constructors": ["error", "constructor"],
      "typescript/consistent-indexed-object-style": ["error", "record"],

      "typescript/return-await": "error",
      "typescript/no-deprecated": "error",
      "typescript/require-await": "error",
      // 型安全性を高めるルールです。

      "typescript/ban-ts-comment": "error",
      "typescript/no-explicit-any": "error",
      "typescript/prefer-includes": "error",
      "typescript/only-throw-error": "error",
      "typescript/no-misused-promises": "error",
      "typescript/no-non-null-assertion": "error",
      "typescript/prefer-ts-expect-error": "error",
      "typescript/restrict-plus-operands": "error",
      // 実行時検証後の型アサーションを許可します。
      "typescript/no-unsafe-type-assertion": "off",
      "typescript/prefer-nullish-coalescing": "error",
      "typescript/strict-boolean-expressions": "error",
      "typescript/switch-exhaustiveness-check": "error",
      "typescript/no-confusing-void-expression": "error",
      "typescript/prefer-promise-reject-errors": "error",
      "typescript/explicit-function-return-type": "error",
      "typescript/explicit-module-boundary-types": "error",

      // コードの厳格さと可読性を高めるルールです。

      "unicorn/prefer-at": "error",
      "unicorn/escape-case": "error",
      "prefer-object-has-own": "error",
      // toSorted は target es2020 では利用できないため。
      "unicorn/no-array-sort": "off",
      "unicorn/no-hex-escape": "error",
      "unicorn/throw-new-error": "error",
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-array-flat": "error",
      "unicorn/prefer-array-some": "error",
      "unicorn/prefer-type-error": "error",
      "unicorn/no-typeof-undefined": "error",
      "promise/prefer-await-to-then": "error",
      "unicorn/no-useless-undefined": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-structured-clone": "error",
      "unicorn/prefer-number-properties": "error",
      "unicorn/prefer-string-replace-all": "error",
      "unicorn/no-await-expression-member": "error",
      "unicorn/require-array-join-separator": "error",
      "unicorn/prefer-optional-catch-binding": "error",
      "unicorn/no-useless-promise-resolve-reject": "error",
      "unicorn/require-number-to-fixed-digits-argument": "error",

      // React の JSX 表記を統一します。

      "react/jsx-fragments": ["error", "syntax"],
      "react/jsx-boolean-value": ["error", "never"],
      "react/self-closing-comp": "error",
      "react/no-array-index-key": "error",
      // React 17 以降の automatic JSX runtime を使うため。
      "react/react-in-jsx-scope": "off",
      "react/jsx-no-useless-fragment": "error",
      "react/jsx-curly-brace-presence": [
        "error",
        {
          props: "never",
          children: "never",
          propElementValues: "always",
        },
      ],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-no-constructed-context-values": "error",

      // テストの構造を統一します。

      "vitest/consistent-test-it": [
        "error",
        {
          fn: "test",
          withinDescribe: "test",
        },
      ],
      "vitest/no-duplicate-hooks": "error",
      "vitest/no-identical-title": "error",
      "vitest/prefer-hooks-on-top": "error",
      "vitest/prefer-strict-equal": "error",
      "vitest/prefer-hooks-in-order": "error",
      "vitest/no-conditional-in-test": "error",
      "vitest/no-test-return-statement": "error",
      "vitest/require-top-level-describe": "error",

      // プロジェクト固有の設定です。

      // logtape でテンプレートリテラル式の関数を実行できるようにします。
      "no-unused-expressions": "off",
      // デバッグ作業を容易にします。
      "vitest/no-focused-tests": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: [
      "eslint",
      "typescript",
      "unicorn",
      "oxc",
      "import",
      "jsdoc",
      "node",
      "promise",
      "react",
      "vitest",
    ],
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
      {
        name: "project",
        specifier: "./.config/oxlint-plugin.js",
      },
    ],
    overrides: [
      {
        files: ["scripts/**/*.mjs"],
        rules: {
          // JavaScript の戻り値には型注釈がないため、値あり・なしの return を許可します。
          "typescript/consistent-return": "off",
          // 型情報を持たない JavaScript スクリプトでは真偽値が any 扱いになるため、明示比較を強制しません。
          "typescript/strict-boolean-expressions": "off",
        },
      },
    ],
    categories: {
      suspicious: "error",
      correctness: "error",
    },
    ignorePatterns: ignoredPaths,
  },
  staged: { "*": "vp check --fix" },
});
