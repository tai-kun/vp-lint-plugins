import blankLine from "../../src/rules/blank-line.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("blank-line", blankLine, {
  valid: [
    // 制御ブロックの後には空行を入れます。
    "if (a) {\n  b();\n}\n\nc();",
    "if (a) {\n  b();\n}",
    "if (a) {\n  b();\n};\nc();",
    "if (a) {\n  b();\n}\n// comment",
    "if (a) {\n  b();\n}\n// comment\nc();",
    "if (a) {\n  b();\n}\n\n// comment\nc();",
    "if (a) {\n  b();\n}\n// comment\n\nc();",
    "if (a) {\n  b();\n}\n\n// comment\n\nc();",
    // 宣言の後には空行を入れます。
    "function a() {}\n\nconst b = 1;",
    "function a(): void;\nfunction a() {}\n\nconst b = 1;",
    "const a = 1;\nconst b = 2;",
    "function a() {}",
    "interface A {\n  a: string;\n}",
    "function a() {}\n// comment\nconst b = 1;",
    "function a() {}\n\n// comment\nconst b = 1;",
    "function a() {}\n// comment\n\nconst b = 1;",
    "function a() {}\n\n// comment\n\nconst b = 1;",
    // 変数宣言グループの後には空行を入れます。
    "const a = 1;\nconst b = 2;\n\nfoo();",
    "export const a = 1;\nexport const b = 2;\n\nfoo();",
    "export const a = 1;\nconst b = 2;\n\nfoo();",
    "const a = 1;\n\nfoo();",
    "const a = 1;",
    "for (const x of xs) {\n  foo(x);\n}",
    "const ready = items;\nready.sort(compare);\n\nconst sorted = [];",
    "const ready = items;\nready.sort(compare);",
    "const ready = items;\nready.sort(compare);\nready.reverse();\n\nconst sorted = [];",
    "const { ready } = state;\nready.sort(compare);\n\nconst sorted = [];",
    "export const ready = items;\nready.sort(compare);\n\nconst sorted = [];",
    "const ready = items;\n\n// sort\nready.sort(compare);",
    "const ready = items;\n// sort\nready.sort(compare);",
    "const ready = items;\n// sort\n\nready.sort(compare);",
    "const ready = items;\n\n// sort\n\nready.sort(compare);",
    "const ready = items;\nready.sort(compare);\n// comment\nconst sorted = [];",
    "const ready = items;\nready.sort(compare);\n\n// comment\nconst sorted = [];",
    "const ready = items;\nready.sort(compare);\n// comment\n\nconst sorted = [];",
    "const ready = items;\nready.sort(compare);\n\n// comment\n\nconst sorted = [];",
    "const a = 1;\n// comment\nfoo();",
    "const a = 1;\n\n// comment\nfoo();",
    "const a = 1;\n// comment\n\nfoo();",
    "const a = 1;\n\n// comment\n\nfoo();",
    "const actual = add(a, b);\n// 検証します。\nexpect(actual).toBe(expected);",
    "const actual = add(a, b);\n\n// 検証します。\nexpect(actual).toBe(expected);",
    "const actual = add(a, b);\n// 検証します。\n\nexpect(actual).toBe(expected);",
    "const actual = add(a, b);\n\n// 検証します。\n\nexpect(actual).toBe(expected);",
    // return の直前には空行を入れます。
    "function f() {\n  return 1;\n}",
    "function f() {\n  const a = 1;\n\n  return a;\n}",
    'function f() {\n  "use strict";\n  return 1;\n}',
    "function f() {\n  throw new Error();\n  return 1;\n}",
    "function f() {\n  switch (x) {\n    case 1:\n      return a;\n  }\n}",
    "function f() {\n  const a = 1;\n  // comment\n  return a;\n}",
    "function f() {\n  const a = 1;\n\n  // comment\n  return a;\n}",
    "function f() {\n  const a = 1;\n  // comment\n\n  return a;\n}",
    "function f() {\n  const a = 1;\n\n  // comment\n\n  return a;\n}",
    // クラスメンバーの間には空行を入れます。
    "class A {\n  a = 1;\n\n  b() {}\n}",
    "class A {\n  f(a: string): void;\n  f(a: number): void;\n  f(a: string | number): void {}\n}",
    "class A {\n  get value(): number { return 1; }\n  set value(value: number) {}\n}",
    "class A {\n  a = 1;\n}",
    "class A {\n  static {}\n\n  a = 1;\n}",
    "class A {\n  a() {}\n  // b です。\n  b() {}\n}",
    "class A {\n  a() {}\n\n  // b です。\n  b() {}\n}",
    "class A {\n  a() {}\n  // b です。\n\n  b() {}\n}",
    "class A {\n  a() {}\n\n  // b です。\n\n  b() {}\n}",
    // 空でない case の間には空行を入れます。
    "switch (x) {\n  case 1:\n    a();\n\n  case 2:\n    b();\n}",
    "switch (x) {\n  case 1:\n  case 2:\n    a();\n}",
    "switch (x) {\n  case 1:\n    a();\n}",
    "switch (x) {\n  case 1:\n    a();\n\n  default:\n    b();\n}",
    "switch (x) {\n  case 1:\n    a();\n  // comment\n  case 2:\n    b();\n}",
    "switch (x) {\n  case 1:\n    a();\n\n  // comment\n  case 2:\n    b();\n}",
    "switch (x) {\n  case 1:\n    a();\n  // comment\n\n  case 2:\n    b();\n}",
    "switch (x) {\n  case 1:\n    a();\n\n  // comment\n\n  case 2:\n    b();\n}",
    // 対象外の文の境界には空行を要求しません。
    "a();\nb();",
    // JSDoc 形式のブロックコメントの 1 行上は空行にします。
    "const a = 1;\n\n/** 説明です。 */\nfoo();",
    "const a = 1;\n\n/**\n * 説明です。\n */\nfoo();",
    "const a = 1;\n\n/** 説明です。 */\n\nfoo();",
    "/** 説明です。 */\nfunction f() {}",
    "const a = 1;\n/* 通常のブロックコメントです。 */\nfoo();",
    "const ready = items;\n\n/** ソートします。 */\nready.sort(compare);",
    "const a = 1;\n\n/** b です。 */\nconst b = 2;\n\nfoo();",
    "function f() {\n  a();\n\n  /** 返します。 */\n  return 1;\n}",
    "class A {\n  a = 1;\n\n  /** b です。 */\n  b() {}\n}",
    "switch (x) {\n  case 1:\n    a();\n\n  /** コメントです。 */\n  case 2:\n    b();\n}",
    "interface A {\n  a: string;\n  b: string;\n}",
    "type A = {\n  a: string;\n  b: string;\n};",
    "interface A {\n  a: string;\n\n  /** b です。 */\n  b: string;\n}",
    "type A = {\n  a: string;\n\n  /** b です。 */\n  b: string;\n};",
    "interface A {\n  /** a です。 */\n  a: string;\n}",
    "interface A {\n  a: string;\n  // b です。\n  b: string;\n}",
    "interface A {\n  a: string;\n  /* b です。 */\n  b: string;\n}",
    "type A = {\n  a: string;\n\n  /**\n   * b です。\n   */\n  b: string;\n};",
  ],
  invalid: [
    {
      code: "if (a) {\n  b();\n}\nc();",
      errors: [{ messageId: "blankLine" }],
      output: "if (a) {\n  b();\n}\n\nc();",
    },
    {
      code: "if (a) b(); c();",
      errors: [{ messageId: "blankLine" }],
      output: "if (a) b();\n\n c();",
    },
    {
      code: "for (const x of xs) {\n  b(x);\n}\nc();",
      errors: [{ messageId: "blankLine" }],
      output: "for (const x of xs) {\n  b(x);\n}\n\nc();",
    },
    {
      code: "function a() {}\nconst b = 1;",
      errors: [{ messageId: "blankLine" }],
      output: "function a() {}\n\nconst b = 1;",
    },
    {
      code: "interface A {\n  a: string;\n}\nconst b = 1;",
      errors: [{ messageId: "blankLine" }],
      output: "interface A {\n  a: string;\n}\n\nconst b = 1;",
    },
    {
      code: "type A = string;\nconst b = 1;",
      errors: [{ messageId: "blankLine" }],
      output: "type A = string;\n\nconst b = 1;",
    },
    {
      code: "export function a() {}\nconst b = 1;",
      errors: [{ messageId: "blankLine" }],
      output: "export function a() {}\n\nconst b = 1;",
    },
    {
      code: "const ready = items;\n\nready.sort(compare);",
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: "const ready = items;\nready.sort(compare);",
    },
    {
      code: "const ready = items;\n\nready.sort(compare);\nconst sorted = [];",
      errors: [{ messageId: "unexpectedBlankLine" }, { messageId: "blankLine" }],
      output: "const ready = items;\nready.sort(compare);\n\nconst sorted = [];",
    },
    {
      code: "const ready = items;\nready.sort(compare);\n\nready.reverse();",
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: "const ready = items;\nready.sort(compare);\nready.reverse();",
    },
    {
      code: "function f() {\n  const ready = items;\n\n  ready.sort(compare);\n  const sorted = [];\n}",
      errors: [{ messageId: "unexpectedBlankLine" }, { messageId: "blankLine" }],
      output:
        "function f() {\n  const ready = items;\n  ready.sort(compare);\n\n  const sorted = [];\n}",
    },
    {
      code: "const ready = items;\nready.sort(compare);\nconst sorted = [];",
      errors: [{ messageId: "blankLine" }],
      output: "const ready = items;\nready.sort(compare);\n\nconst sorted = [];",
    },
    {
      code: "const ready = items;\nready.sort(compare);\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const ready = items;\nready.sort(compare);\n\nfoo();",
    },
    {
      code: "function f() {\n  const ready = items;\n  ready.sort(compare);\n  const sorted = [];\n}",
      errors: [{ messageId: "blankLine" }],
      output:
        "function f() {\n  const ready = items;\n  ready.sort(compare);\n\n  const sorted = [];\n}",
    },
    {
      code: "const a = 1;\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\nfoo();",
    },
    {
      code: "export const a = 1;\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "export const a = 1;\n\nfoo();",
    },
    {
      code: "const a = 1;\nconst b = 2;\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\nconst b = 2;\n\nfoo();",
    },
    {
      code: "const a = 1;\nfunction f() {}",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\nfunction f() {}",
    },
    {
      code: "function f() {\n  const a = 1;\n  foo();\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  const a = 1;\n\n  foo();\n}",
    },
    {
      code: "const a = 1; foo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\n foo();",
    },
    {
      code: "function f() {\n  a();\n  return 1;\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  a();\n\n  return 1;\n}",
    },
    {
      code: "function f() {\n  const a = 1;\n  return a;\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  const a = 1;\n\n  return a;\n}",
    },
    {
      code: "function f() {\n  const ready = items;\n  ready.sort(compare);\n  return ready;\n}",
      errors: [{ messageId: "blankLine" }],
      output:
        "function f() {\n  const ready = items;\n  ready.sort(compare);\n\n  return ready;\n}",
    },
    {
      code: "function f() {\n  if (a) {\n    b();\n  }\n  return 1;\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  if (a) {\n    b();\n  }\n\n  return 1;\n}",
    },
    {
      code: "function f() {\n  function g() {}\n  return 1;\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  function g() {}\n\n  return 1;\n}",
    },
    {
      code: "function f() {\n  switch (x) {\n    case 1:\n      a();\n      return a;\n  }\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  switch (x) {\n    case 1:\n      a();\n\n      return a;\n  }\n}",
    },
    {
      code: "class A {\n  a = 1;\n  b() {}\n}",
      errors: [{ messageId: "blankLine" }],
      output: "class A {\n  a = 1;\n\n  b() {}\n}",
    },
    {
      code: "class A {\n  a() {}\n  b() {}\n}",
      errors: [{ messageId: "blankLine" }],
      output: "class A {\n  a() {}\n\n  b() {}\n}",
    },
    {
      code: "class A { a() {} b() {} }",
      errors: [{ messageId: "blankLine" }],
      output: "class A { a() {}\n\n b() {} }",
    },
    {
      code: "switch (x) {\n  case 1:\n    a();\n  case 2:\n    b();\n}",
      errors: [{ messageId: "blankLine" }],
      output: "switch (x) {\n  case 1:\n    a();\n\n  case 2:\n    b();\n}",
    },
    {
      code: "switch (x) { case 1: a(); case 2: b(); }",
      errors: [{ messageId: "blankLine" }],
      output: "switch (x) { case 1: a();\n\n case 2: b(); }",
    },
    {
      code: "const a = 1;\n/** 説明です。 */\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\n/** 説明です。 */\nfoo();",
    },
    {
      code: "function a() {}\n/** 説明です。 */\nconst b = 1;",
      errors: [{ messageId: "blankLine" }],
      output: "function a() {}\n\n/** 説明です。 */\nconst b = 1;",
    },
    {
      code: "if (a) {\n  b();\n}\n/** 後処理です。 */\nc();",
      errors: [{ messageId: "blankLine" }],
      output: "if (a) {\n  b();\n}\n\n/** 後処理です。 */\nc();",
    },
    {
      code: "const ready = items;\n/** ソートします。 */\nready.sort(compare);",
      errors: [{ messageId: "blankLine" }],
      output: "const ready = items;\n\n/** ソートします。 */\nready.sort(compare);",
    },
    {
      code: "const a = 1;\n/** b です。 */\nconst b = 2;\n\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\n/** b です。 */\nconst b = 2;\n\nfoo();",
    },
    {
      code: "function f() {\n  a();\n  /** 返します。 */\n  return 1;\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  a();\n\n  /** 返します。 */\n  return 1;\n}",
    },
    {
      code: "class A {\n  a = 1;\n  /** b です。 */\n  b() {}\n}",
      errors: [{ messageId: "blankLine" }],
      output: "class A {\n  a = 1;\n\n  /** b です。 */\n  b() {}\n}",
    },
    {
      code: "switch (x) {\n  case 1:\n    a();\n  /** コメントです。 */\n  case 2:\n    b();\n}",
      errors: [{ messageId: "blankLine" }],
      output:
        "switch (x) {\n  case 1:\n    a();\n\n  /** コメントです。 */\n  case 2:\n    b();\n}",
    },
    {
      code: "interface A {\n  a: string;\n  /** b です。 */\n  b: string;\n}",
      errors: [{ messageId: "blankLine" }],
      output: "interface A {\n  a: string;\n\n  /** b です。 */\n  b: string;\n}",
    },
    {
      code: "type A = {\n  a: string;\n  /** b です。 */\n  b: string;\n};",
      errors: [{ messageId: "blankLine" }],
      output: "type A = {\n  a: string;\n\n  /** b です。 */\n  b: string;\n};",
    },
  ],
});
ruleTester.run("blank-line (afterControlBlock: false)", blankLine, {
  valid: [
    {
      code: "if (a) {\n  b();\n}\nc();",
      options: [{ afterControlBlock: false }],
    },
  ],
  invalid: [
    {
      code: "const a = 1;\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\nfoo();",
      options: [{ afterControlBlock: false }],
    },
  ],
});
ruleTester.run("blank-line (afterDeclaration: false)", blankLine, {
  valid: [
    {
      code: "function a() {}\nconst b = 1;",
      options: [{ afterDeclaration: false }],
    },
  ],
  invalid: [
    {
      code: "if (a) {\n  b();\n}\nc();",
      errors: [{ messageId: "blankLine" }],
      output: "if (a) {\n  b();\n}\n\nc();",
      options: [{ afterDeclaration: false }],
    },
  ],
});
ruleTester.run("blank-line (afterVariableDeclaration: false)", blankLine, {
  valid: [
    {
      code: "const a = 1;\nfoo();",
      options: [{ afterVariableDeclaration: false }],
    },
    {
      code: "const ready = items;\n\nready.sort(compare);",
      options: [{ afterVariableDeclaration: false }],
    },
    {
      code: "const a = 1;\n/** 説明です。 */\nfoo();",
      options: [{ afterVariableDeclaration: false }],
    },
  ],
  invalid: [
    {
      code: "function f() {\n  a();\n  return 1;\n}",
      errors: [{ messageId: "blankLine" }],
      output: "function f() {\n  a();\n\n  return 1;\n}",
      options: [{ afterVariableDeclaration: false }],
    },
  ],
});
ruleTester.run("blank-line (beforeReturn: false)", blankLine, {
  valid: [
    {
      code: "function f() {\n  a();\n  return 1;\n}",
      options: [{ beforeReturn: false }],
    },
    {
      code: "function f() {\n  const a = 1;\n  return a;\n}",
      options: [
        {
          beforeReturn: false,
          afterVariableDeclaration: false,
        },
      ],
    },
  ],
  invalid: [
    {
      code: "const a = 1;\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\nfoo();",
      options: [{ beforeReturn: false }],
    },
  ],
});
ruleTester.run("blank-line (betweenClassMembers: false)", blankLine, {
  valid: [
    {
      code: "class A {\n  a = 1;\n  b() {}\n}",
      options: [{ betweenClassMembers: false }],
    },
  ],
  invalid: [
    {
      code: "switch (x) {\n  case 1:\n    a();\n  case 2:\n    b();\n}",
      errors: [{ messageId: "blankLine" }],
      output: "switch (x) {\n  case 1:\n    a();\n\n  case 2:\n    b();\n}",
      options: [{ betweenClassMembers: false }],
    },
  ],
});
ruleTester.run("blank-line (betweenSwitchCases: false)", blankLine, {
  valid: [
    {
      code: "switch (x) {\n  case 1:\n    a();\n  case 2:\n    b();\n}",
      options: [{ betweenSwitchCases: false }],
    },
  ],
  invalid: [
    {
      code: "class A {\n  a = 1;\n  b() {}\n}",
      errors: [{ messageId: "blankLine" }],
      output: "class A {\n  a = 1;\n\n  b() {}\n}",
      options: [{ betweenSwitchCases: false }],
    },
  ],
});
ruleTester.run("blank-line (betweenTypeMembers: false)", blankLine, {
  valid: [
    {
      code: "interface A {\n  a: string;\n  /** b です。 */\n  b: string;\n}",
      options: [{ betweenTypeMembers: false }],
    },
  ],
  invalid: [
    {
      code: "const a = 1;\nfoo();",
      errors: [{ messageId: "blankLine" }],
      output: "const a = 1;\n\nfoo();",
      options: [{ betweenTypeMembers: false }],
    },
  ],
});
ruleTester.run("blank-line (all disabled)", blankLine, {
  valid: [
    {
      code: "if (a) {\n  b();\n}\nc();\nfunction a() {}\nconst b = 1;\nfunction f() {\n  a();\n  return 1;\n}\nclass A {\n  a = 1;\n  b() {}\n}\nswitch (x) {\n  case 1:\n    a();\n  case 2:\n    b();\n}",
      options: [
        {
          beforeReturn: false,
          afterDeclaration: false,
          afterControlBlock: false,
          betweenSwitchCases: false,
          betweenTypeMembers: false,
          betweenClassMembers: false,
          afterVariableDeclaration: false,
        },
      ],
    },
  ],
  invalid: [],
});
