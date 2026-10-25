import blankLine from "../../src/rules/blank-line.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("blank-line", blankLine, {
  valid: [
    // 制御ブロックの後には空行を入れます。
    `
if (a) {
  b();
}

c();
    `,
    `
if (a) {
  b();
}
    `,
    `
if (a) {
  b();
};
c();
    `,
    `
if (a) {
  b();
}
// comment
    `,
    `
if (a) {
  b();
}
// comment
c();
    `,
    `
if (a) {
  b();
}

// comment
c();
    `,
    `
if (a) {
  b();
}
// comment

c();
    `,
    `
if (a) {
  b();
}

// comment

c();
    `,
    // 宣言の後には空行を入れます。
    `
function a() {}

const b = 1;
    `,
    `
function a(): void;
function a() {}

const b = 1;
    `,
    `
const a = 1;
const b = 2;
    `,
    "function a() {}",
    `
interface A {
  a: string;
}
    `,
    `
function a() {}
// comment
const b = 1;
    `,
    `
function a() {}

// comment
const b = 1;
    `,
    `
function a() {}
// comment

const b = 1;
    `,
    `
function a() {}

// comment

const b = 1;
    `,
    // 変数宣言グループの後には空行を入れます。
    `
const a = 1;
const b = 2;

foo();
    `,
    `
export const a = 1;
export const b = 2;

foo();
    `,
    `
export const a = 1;
const b = 2;

foo();
    `,
    `
const a = 1;

foo();
    `,
    "const a = 1;",
    `
for (const x of xs) {
  foo(x);
}
    `,
    `
const ready = items;
ready.sort(compare);

const sorted = [];
    `,
    `
const ready = items;
ready.sort(compare);
    `,
    `
const ready = items;
ready.sort(compare);
ready.reverse();

const sorted = [];
    `,
    `
const { ready } = state;
ready.sort(compare);

const sorted = [];
    `,
    `
export const ready = items;
ready.sort(compare);

const sorted = [];
    `,
    `
const ready = items;

// sort
ready.sort(compare);
    `,
    `
const ready = items;
// sort
ready.sort(compare);
    `,
    `
const ready = items;
// sort

ready.sort(compare);
    `,
    `
const ready = items;

// sort

ready.sort(compare);
    `,
    `
const ready = items;
ready.sort(compare);
// comment
const sorted = [];
    `,
    `
const ready = items;
ready.sort(compare);

// comment
const sorted = [];
    `,
    `
const ready = items;
ready.sort(compare);
// comment

const sorted = [];
    `,
    `
const ready = items;
ready.sort(compare);

// comment

const sorted = [];
    `,
    `
const a = 1;
// comment
foo();
    `,
    `
const a = 1;

// comment
foo();
    `,
    `
const a = 1;
// comment

foo();
    `,
    `
const a = 1;

// comment

foo();
    `,
    `
const actual = add(a, b);
// 検証します。
expect(actual).toBe(expected);
    `,
    `
const actual = add(a, b);

// 検証します。
expect(actual).toBe(expected);
    `,
    `
const actual = add(a, b);
// 検証します。

expect(actual).toBe(expected);
    `,
    `
const actual = add(a, b);

// 検証します。

expect(actual).toBe(expected);
    `,
    // return の直前には空行を入れます。
    `
function f() {
  return 1;
}
    `,
    `
function f() {
  const a = 1;

  return a;
}
    `,
    `
function f() {
  "use strict";
  return 1;
}
    `,
    `
function f() {
  throw new Error();
  return 1;
}
    `,
    `
function f() {
  switch (x) {
    case 1:
      return a;
  }
}
    `,
    `
function f() {
  const a = 1;
  // comment
  return a;
}
    `,
    `
function f() {
  const a = 1;

  // comment
  return a;
}
    `,
    `
function f() {
  const a = 1;
  // comment

  return a;
}
    `,
    `
function f() {
  const a = 1;

  // comment

  return a;
}
    `,
    // クラスメンバーの間には空行を入れます。
    `
class A {
  a = 1;

  b() {}
}
    `,
    `
class A {
  f(a: string): void;
  f(a: number): void;
  f(a: string | number): void {}
}
    `,
    `
class A {
  get value(): number { return 1; }
  set value(value: number) {}
}
    `,
    `
class A {
  a = 1;
}
    `,
    `
class A {
  static {}

  a = 1;
}
    `,
    `
class A {
  a() {}
  // b です。
  b() {}
}
    `,
    `
class A {
  a() {}

  // b です。
  b() {}
}
    `,
    `
class A {
  a() {}
  // b です。

  b() {}
}
    `,
    `
class A {
  a() {}

  // b です。

  b() {}
}
    `,
    // 空でない case の間には空行を入れます。
    `
switch (x) {
  case 1:
    a();

  case 2:
    b();
}
    `,
    `
switch (x) {
  case 1:
  case 2:
    a();
}
    `,
    `
switch (x) {
  case 1:
    a();
}
    `,
    `
switch (x) {
  case 1:
    a();

  default:
    b();
}
    `,
    `
switch (x) {
  case 1:
    a();
  // comment
  case 2:
    b();
}
    `,
    `
switch (x) {
  case 1:
    a();

  // comment
  case 2:
    b();
}
    `,
    `
switch (x) {
  case 1:
    a();
  // comment

  case 2:
    b();
}
    `,
    `
switch (x) {
  case 1:
    a();

  // comment

  case 2:
    b();
}
    `,
    // 対象外の文の境界には空行を要求しません。
    `
a();
b();
    `,
    // JSDoc 形式のブロックコメントの 1 行上は空行にします。
    `
const a = 1;

/** 説明です。 */
foo();
    `,
    `
const a = 1;

/**
 * 説明です。
 */
foo();
    `,
    `
const a = 1;

/** 説明です。 */

foo();
    `,
    `
/** 説明です。 */
function f() {}
    `,
    `
const a = 1;
/* 通常のブロックコメントです。 */
foo();
    `,
    `
const ready = items;

/** ソートします。 */
ready.sort(compare);
    `,
    `
const a = 1;

/** b です。 */
const b = 2;

foo();
    `,
    `
function f() {
  a();

  /** 返します。 */
  return 1;
}
    `,
    `
class A {
  a = 1;

  /** b です。 */
  b() {}
}
    `,
    `
switch (x) {
  case 1:
    a();

  /** コメントです。 */
  case 2:
    b();
}
    `,
    `
interface A {
  a: string;
  b: string;
}
    `,
    `
type A = {
  a: string;
  b: string;
};
    `,
    `
interface A {
  a: string;

  /** b です。 */
  b: string;
}
    `,
    `
type A = {
  a: string;

  /** b です。 */
  b: string;
};
    `,
    `
interface A {
  /** a です。 */
  a: string;
}
    `,
    `
interface A {
  a: string;
  // b です。
  b: string;
}
    `,
    `
interface A {
  a: string;
  /* b です。 */
  b: string;
}
    `,
    `
type A = {
  a: string;

  /**
   * b です。
   */
  b: string;
};
    `,
  ],
  invalid: [
    {
      code: `
if (a) {
  b();
}
c();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
if (a) {
  b();
}

c();
      `,
    },
    {
      code: `
if (a) b(); c();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
if (a) b();

 c();
      `,
    },
    {
      code: `
for (const x of xs) {
  b(x);
}
c();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
for (const x of xs) {
  b(x);
}

c();
      `,
    },
    {
      code: `
function a() {}
const b = 1;
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function a() {}

const b = 1;
      `,
    },
    {
      code: `
interface A {
  a: string;
}
const b = 1;
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
interface A {
  a: string;
}

const b = 1;
      `,
    },
    {
      code: `
type A = string;
const b = 1;
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
type A = string;

const b = 1;
      `,
    },
    {
      code: `
export function a() {}
const b = 1;
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
export function a() {}

const b = 1;
      `,
    },
    {
      code: `
const ready = items;

ready.sort(compare);
      `,
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: `
const ready = items;
ready.sort(compare);
      `,
    },
    {
      code: `
const ready = items;

ready.sort(compare);
const sorted = [];
      `,
      errors: [{ messageId: "unexpectedBlankLine" }, { messageId: "blankLine" }],
      output: `
const ready = items;
ready.sort(compare);

const sorted = [];
      `,
    },
    {
      code: `
const ready = items;
ready.sort(compare);

ready.reverse();
      `,
      errors: [{ messageId: "unexpectedBlankLine" }],
      output: `
const ready = items;
ready.sort(compare);
ready.reverse();
      `,
    },
    {
      code: `
function f() {
  const ready = items;

  ready.sort(compare);
  const sorted = [];
}
      `,
      errors: [{ messageId: "unexpectedBlankLine" }, { messageId: "blankLine" }],
      output: `
function f() {
  const ready = items;
  ready.sort(compare);

  const sorted = [];
}
      `,
    },
    {
      code: `
const ready = items;
ready.sort(compare);
const sorted = [];
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const ready = items;
ready.sort(compare);

const sorted = [];
      `,
    },
    {
      code: `
const ready = items;
ready.sort(compare);
foo();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const ready = items;
ready.sort(compare);

foo();
      `,
    },
    {
      code: `
function f() {
  const ready = items;
  ready.sort(compare);
  const sorted = [];
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function f() {
  const ready = items;
  ready.sort(compare);

  const sorted = [];
}
      `,
    },
    {
      code: `
const a = 1;
foo();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const a = 1;

foo();
      `,
    },
    {
      code: `
export const a = 1;
foo();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
export const a = 1;

foo();
      `,
    },
    {
      code: `
const a = 1;
const b = 2;
foo();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const a = 1;
const b = 2;

foo();
      `,
    },
    {
      code: `
const a = 1;
function f() {}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const a = 1;

function f() {}
      `,
    },
    {
      code: `
function f() {
  const a = 1;
  foo();
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function f() {
  const a = 1;

  foo();
}
      `,
    },
    {
      code: `
const a = 1; foo();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const a = 1;

 foo();
      `,
    },
    {
      code: `
function f() {
  a();
  return 1;
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function f() {
  a();

  return 1;
}
      `,
    },
    {
      code: `
function f() {
  const a = 1;
  return a;
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function f() {
  const a = 1;

  return a;
}
      `,
    },
    {
      code: `
function f() {
  const ready = items;
  ready.sort(compare);
  return ready;
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function f() {
  const ready = items;
  ready.sort(compare);

  return ready;
}
      `,
    },
    {
      code: `
function f() {
  if (a) {
    b();
  }
  return 1;
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function f() {
  if (a) {
    b();
  }

  return 1;
}
      `,
    },
    {
      code: `
function f() {
  function g() {}
  return 1;
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function f() {
  function g() {}

  return 1;
}
      `,
    },
    {
      code: `
function f() {
  switch (x) {
    case 1:
      a();
      return a;
  }
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function f() {
  switch (x) {
    case 1:
      a();

      return a;
  }
}
      `,
    },
    {
      code: `
class A {
  a = 1;
  b() {}
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
class A {
  a = 1;

  b() {}
}
      `,
    },
    {
      code: `
class A {
  a() {}
  b() {}
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
class A {
  a() {}

  b() {}
}
      `,
    },
    {
      code: `
class A { a() {} b() {} }
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
class A { a() {}

 b() {} }
      `,
    },
    {
      code: `
switch (x) {
  case 1:
    a();
  case 2:
    b();
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
switch (x) {
  case 1:
    a();

  case 2:
    b();
}
      `,
    },
    {
      code: `
switch (x) { case 1: a(); case 2: b(); }
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
switch (x) { case 1: a();

 case 2: b(); }
      `,
    },
    {
      code: `
const a = 1;
/** 説明です。 */
foo();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const a = 1;

/** 説明です。 */
foo();
      `,
    },
    {
      code: `
function a() {}
/** 説明です。 */
const b = 1;
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function a() {}

/** 説明です。 */
const b = 1;
      `,
    },
    {
      code: `
if (a) {
  b();
}
/** 後処理です。 */
c();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
if (a) {
  b();
}

/** 後処理です。 */
c();
      `,
    },
    {
      code: `
const ready = items;
/** ソートします。 */
ready.sort(compare);
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const ready = items;

/** ソートします。 */
ready.sort(compare);
      `,
    },
    {
      code: `
const a = 1;
/** b です。 */
const b = 2;

foo();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const a = 1;

/** b です。 */
const b = 2;

foo();
      `,
    },
    {
      code: `
function f() {
  a();
  /** 返します。 */
  return 1;
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function f() {
  a();

  /** 返します。 */
  return 1;
}
      `,
    },
    {
      code: `
class A {
  a = 1;
  /** b です。 */
  b() {}
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
class A {
  a = 1;

  /** b です。 */
  b() {}
}
      `,
    },
    {
      code: `
switch (x) {
  case 1:
    a();
  /** コメントです。 */
  case 2:
    b();
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
switch (x) {
  case 1:
    a();

  /** コメントです。 */
  case 2:
    b();
}
      `,
    },
    {
      code: `
interface A {
  a: string;
  /** b です。 */
  b: string;
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
interface A {
  a: string;

  /** b です。 */
  b: string;
}
      `,
    },
    {
      code: `
type A = {
  a: string;
  /** b です。 */
  b: string;
};
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
type A = {
  a: string;

  /** b です。 */
  b: string;
};
      `,
    },
  ],
});
ruleTester.run("blank-line (afterControlBlock: false)", blankLine, {
  valid: [
    {
      code: `
if (a) {
  b();
}
c();
      `,
      options: [{ afterControlBlock: false }],
    },
  ],
  invalid: [
    {
      code: `
const a = 1;
foo();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const a = 1;

foo();
      `,
      options: [{ afterControlBlock: false }],
    },
  ],
});
ruleTester.run("blank-line (afterDeclaration: false)", blankLine, {
  valid: [
    {
      code: `
function a() {}
const b = 1;
      `,
      options: [{ afterDeclaration: false }],
    },
  ],
  invalid: [
    {
      code: `
if (a) {
  b();
}
c();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
if (a) {
  b();
}

c();
      `,
      options: [{ afterDeclaration: false }],
    },
  ],
});
ruleTester.run("blank-line (afterVariableDeclaration: false)", blankLine, {
  valid: [
    {
      code: `
const a = 1;
foo();
      `,
      options: [{ afterVariableDeclaration: false }],
    },
    {
      code: `
const ready = items;

ready.sort(compare);
      `,
      options: [{ afterVariableDeclaration: false }],
    },
    {
      code: `
const a = 1;
/** 説明です。 */
foo();
      `,
      options: [{ afterVariableDeclaration: false }],
    },
  ],
  invalid: [
    {
      code: `
function f() {
  a();
  return 1;
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
function f() {
  a();

  return 1;
}
      `,
      options: [{ afterVariableDeclaration: false }],
    },
  ],
});
ruleTester.run("blank-line (beforeReturn: false)", blankLine, {
  valid: [
    {
      code: `
function f() {
  a();
  return 1;
}
      `,
      options: [{ beforeReturn: false }],
    },
    {
      code: `
function f() {
  const a = 1;
  return a;
}
      `,
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
      code: `
const a = 1;
foo();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const a = 1;

foo();
      `,
      options: [{ beforeReturn: false }],
    },
  ],
});
ruleTester.run("blank-line (betweenClassMembers: false)", blankLine, {
  valid: [
    {
      code: `
class A {
  a = 1;
  b() {}
}
      `,
      options: [{ betweenClassMembers: false }],
    },
  ],
  invalid: [
    {
      code: `
switch (x) {
  case 1:
    a();
  case 2:
    b();
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
switch (x) {
  case 1:
    a();

  case 2:
    b();
}
      `,
      options: [{ betweenClassMembers: false }],
    },
  ],
});
ruleTester.run("blank-line (betweenSwitchCases: false)", blankLine, {
  valid: [
    {
      code: `
switch (x) {
  case 1:
    a();
  case 2:
    b();
}
      `,
      options: [{ betweenSwitchCases: false }],
    },
  ],
  invalid: [
    {
      code: `
class A {
  a = 1;
  b() {}
}
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
class A {
  a = 1;

  b() {}
}
      `,
      options: [{ betweenSwitchCases: false }],
    },
  ],
});
ruleTester.run("blank-line (betweenTypeMembers: false)", blankLine, {
  valid: [
    {
      code: `
interface A {
  a: string;
  /** b です。 */
  b: string;
}
      `,
      options: [{ betweenTypeMembers: false }],
    },
  ],
  invalid: [
    {
      code: `
const a = 1;
foo();
      `,
      errors: [{ messageId: "blankLine" }],
      output: `
const a = 1;

foo();
      `,
      options: [{ betweenTypeMembers: false }],
    },
  ],
});
ruleTester.run("blank-line (all disabled)", blankLine, {
  valid: [
    {
      code: `
if (a) {
  b();
}
c();
function a() {}
const b = 1;
function f() {
  a();
  return 1;
}
class A {
  a = 1;
  b() {}
}
switch (x) {
  case 1:
    a();
  case 2:
    b();
}
      `,
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
