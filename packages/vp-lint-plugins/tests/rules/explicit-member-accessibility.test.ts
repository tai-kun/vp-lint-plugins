import explicitMemberAccessibility from "../../src/rules/explicit-member-accessibility.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("explicit-member-accessibility", explicitMemberAccessibility, {
  valid: [
    `
class A {
  public a = 1;
  protected b = 2;
  private c = 3;
  #d = 4;

  public static e = 1;
  static #f = 2;

  static {}

  public constructor() {}

  public g() {}
  protected h() {}
  private i() {}
  #j() {}

  public static k() {}
  static #l() {}

  public get value(): number { return 1; }
  public set value(value: number) {}
  public accessor m = 1;
}
    `,
    `
class A {
  [key: string]: unknown;
  public a = 1;
}
    `,
    `
class A {
  public constructor(public a: string, protected b: number, private readonly c: boolean) {}
}
    `,
    `
class A {
  public constructor(foo: string) {}
}
    `,
  ],
  invalid: [
    {
      code: `
class A {
  a = 1;
}
      `,
      errors: [{ messageId: "missing" }],
    },
    {
      code: `
class A {
  public a = 1;

  b() {}
}
      `,
      errors: [{ messageId: "missing" }],
    },
    {
      code: `
class A {
  constructor() {}
}
      `,
      errors: [{ messageId: "missing" }],
    },
    {
      code: `
class A {
  public constructor() {}

  static a = 1;
}
      `,
      errors: [{ messageId: "missing" }],
    },
    {
      code: `
class A {
  public a = 1;

  get value(): number { return 1; }
}
      `,
      errors: [{ messageId: "missing" }],
    },
    {
      code: `
class A {
  public constructor(readonly a: string) {}
}
      `,
      errors: [{ messageId: "missing" }],
    },
  ],
});
