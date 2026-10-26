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
    `
class A {
  public static a = 1;
  protected static b = 2;
  private static c = 3;
  static #d = 4;

  static {}

  public e = 1;
  protected f = 2;
  private g = 3;
  #h = 4;

  constructor() {}

  public static i() {}
  protected static j() {}
  private static k() {}
  static #l() {}

  public m() {}
  protected n() {}
  private o() {}
  #p() {}
}
    `,
    `
class A {
  public accessor a = 1;
  protected accessor b = 2;
  private accessor c = 3;
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
    {
      code: `
class A {
  private a = 1;

  public b = 2;
}
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
class A {
  #a = 1;

  public b = 2;
}
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
class A {
  protected a = 1;

  public b = 2;
}
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
class A {
  private a() {}

  public b() {}
}
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
class A {
  static #a = 1;

  static b = 2;
}
      `,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
class A {
  static {}

  static a = 1;
}
      `,
      errors: [{ messageId: "order" }],
    },
  ],
});
