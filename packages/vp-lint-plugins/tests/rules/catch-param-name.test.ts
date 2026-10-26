import catchParamName from "../../src/rules/catch-param-name.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("catch-param-name", catchParamName, {
  valid: [
    `
    try {
      run();
    } catch {
      handle();
    }
    `,
    `
    try {
      run();
    } catch (ex) {
      handle(ex);
    }
    `,
    `
    try {
      run();
    } catch (exception) {
      handle(exception);
    }
    `,
    `
    try {
      run();
    } catch (cause) {
      handle(cause);
    }
    `,
    `
    try {
      run();
    } catch (myError) {
      handle(myError);
    }
    `,
    `
    try {
      run();
    } catch ({ message }) {
      handle(message);
    }
    `,
  ],
  invalid: [
    {
      code: `
      try {
        run();
      } catch (error) {
        handle(error);
      }
      `,
      errors: [
        {
          messageId: "catchParamName",
          suggestions: [
            {
              output: `
      try {
        run();
      } catch (ex) {
        handle(ex);
      }
      `,
              messageId: "renameToEx",
            },
            {
              output: `
      try {
        run();
      } catch (exception) {
        handle(exception);
      }
      `,
              messageId: "renameToException",
            },
          ],
        },
      ],
    },
    {
      code: `
      try {
        run();
      } catch (reason) {
        handle(reason);
      }
      `,
      errors: [
        {
          messageId: "catchParamName",
          suggestions: [
            {
              output: `
      try {
        run();
      } catch (ex) {
        handle(ex);
      }
      `,
              messageId: "renameToEx",
            },
            {
              output: `
      try {
        run();
      } catch (exception) {
        handle(exception);
      }
      `,
              messageId: "renameToException",
            },
          ],
        },
      ],
    },
    {
      code: `
      try {
        run();
      } catch (e) {
        handle(e);
      }
      `,
      errors: [
        {
          messageId: "catchParamName",
          suggestions: [
            {
              output: `
      try {
        run();
      } catch (ex) {
        handle(ex);
      }
      `,
              messageId: "renameToEx",
            },
            {
              output: `
      try {
        run();
      } catch (exception) {
        handle(exception);
      }
      `,
              messageId: "renameToException",
            },
          ],
        },
      ],
    },
    {
      code: `
      try {
        run();
      } catch (err) {
        handle(err);
      }
      `,
      errors: [
        {
          messageId: "catchParamName",
          suggestions: [
            {
              output: `
      try {
        run();
      } catch (ex) {
        handle(ex);
      }
      `,
              messageId: "renameToEx",
            },
            {
              output: `
      try {
        run();
      } catch (exception) {
        handle(exception);
      }
      `,
              messageId: "renameToException",
            },
          ],
        },
      ],
    },
    {
      code: `
      try {
        run();
      } catch (Error) {
        handle(Error);
      }
      `,
      errors: [
        {
          messageId: "catchParamName",
          suggestions: [
            {
              output: `
      try {
        run();
      } catch (ex) {
        handle(ex);
      }
      `,
              messageId: "renameToEx",
            },
            {
              output: `
      try {
        run();
      } catch (exception) {
        handle(exception);
      }
      `,
              messageId: "renameToException",
            },
          ],
        },
      ],
    },
    {
      code: `
      try {
        run();
      } catch (error: unknown) {
        handle(error);
      }
      `,
      errors: [
        {
          messageId: "catchParamName",
          suggestions: [
            {
              output: `
      try {
        run();
      } catch (ex: unknown) {
        handle(ex);
      }
      `,
              messageId: "renameToEx",
            },
            {
              output: `
      try {
        run();
      } catch (exception: unknown) {
        handle(exception);
      }
      `,
              messageId: "renameToException",
            },
          ],
        },
      ],
    },
  ],
});
