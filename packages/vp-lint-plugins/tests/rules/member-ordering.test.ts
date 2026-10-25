import memberOrdering from "../../src/rules/member-ordering.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("member-ordering", memberOrdering, {
  valid: [
    `
class A {
  static a = 1;

  static {}

  b = 2;

  constructor() {}

  static c() {}

  d() {}
}
    `,
    `
class A {
  a() {}

  b() {}
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
  [key: string]: unknown;
  a = 1;
}
    `,
  ],
  invalid: [
    {
      code: `
class A {
  constructor() {}

  a = 1;
}
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
class A {
  a = 1;

  static b = 2;
}
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
class A {
  static a() {}

  b = 1;
}
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
class A {
  a() {}

  b = 1;
}
      `,
      errors: [{ messageId: "order" }],
    },
  ],
});
