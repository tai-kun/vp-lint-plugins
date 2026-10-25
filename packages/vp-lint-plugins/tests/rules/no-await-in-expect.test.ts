import noAwaitInExpect from "../../src/rules/no-await-in-expect.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("no-await-in-expect", noAwaitInExpect, {
  valid: [
    `
    test("resolves", async () => {
      await expect(run()).resolves.toBe(1);
    });
    `,
    `
    test("rejects", async () => {
      await expect(run()).rejects.toThrow();
    });
    `,
    `
    test("sync", () => {
      expect(run()).toBe(1);
    });
    `,
    `
    test("not expect", async () => {
      foo(await run());
    });
    `,
    `
    test("member", async () => {
      foo.expect(await run());
    });
    `,
    `
    test("array", async () => {
      expect([await run()]).toHaveLength(1);
    });
    `,
    `
    test("matcher", async () => {
      expect(foo).toBe(await run());
    });
    `,
  ],
  invalid: [
    {
      code: `
      test("basic", async () => {
        expect(await run()).toBe(1);
      });
      `,
      errors: [{ messageId: "noAwaitInExpect" }],
      output: `
      test("basic", async () => {
        await expect(run()).resolves.toBe(1);
      });
      `,
    },
    {
      code: `
      test("awaited", async () => {
        await expect(await run()).toBe(1);
      });
      `,
      errors: [{ messageId: "noAwaitInExpect" }],
      output: `
      test("awaited", async () => {
        await expect(run()).resolves.toBe(1);
      });
      `,
    },
    {
      code: `
      test("resolves", async () => {
        expect(await run()).resolves.toBe(1);
      });
      `,
      errors: [{ messageId: "noAwaitInExpect" }],
      output: `
      test("resolves", async () => {
        expect(run()).resolves.toBe(1);
      });
      `,
    },
    {
      code: `
      test("rejects", async () => {
        expect(await run()).rejects.toThrow();
      });
      `,
      errors: [{ messageId: "noAwaitInExpect" }],
      output: `
      test("rejects", async () => {
        expect(run()).rejects.toThrow();
      });
      `,
    },
    {
      code: `
      test("not", async () => {
        expect(await run()).not.toBe(1);
      });
      `,
      errors: [{ messageId: "noAwaitInExpect" }],
      output: `
      test("not", async () => {
        await expect(run()).resolves.not.toBe(1);
      });
      `,
    },
    {
      code: `
      test("nested", async () => {
        expect(await (await run())).toBe(1);
      });
      `,
      errors: [{ messageId: "noAwaitInExpect" }],
      output: `
      test("nested", async () => {
        await expect(run()).resolves.toBe(1);
      });
      `,
    },
    {
      code: `
      test("parenthesized", async () => {
        expect((await run())).toBe(1);
      });
      `,
      errors: [{ messageId: "noAwaitInExpect" }],
      output: `
      test("parenthesized", async () => {
        await expect((run())).resolves.toBe(1);
      });
      `,
    },
  ],
});
