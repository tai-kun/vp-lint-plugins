import sortImportExportSpecifiers from "../../src/rules/sort-import-export-specifiers.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("sort-import-export-specifiers", sortImportExportSpecifiers, {
  valid: [
    'import { a, b } from "module";',
    'import { a } from "module";',
    'import value, { a } from "module";',
    'import * as namespace from "module";',
    'import { /* comment */ b, a } from "module";',
    "export { a, b };",
    "export type { a, b };",
    'export * from "module";',
  ],
  invalid: [
    {
      code: 'import { b, a } from "module";',
      errors: [{ messageId: "sort" }],
      output: 'import { a, b } from "module";',
    },
    {
      code: 'import { b, type a } from "module";',
      errors: [{ messageId: "sort" }],
      output: 'import { type a, b } from "module";',
    },
    {
      code: 'import type { b, a } from "module";',
      errors: [{ messageId: "sort" }],
      output: 'import type { a, b } from "module";',
    },
    {
      code: 'import { default as z, a } from "module";',
      errors: [{ messageId: "sort" }],
      output: 'import { a, default as z } from "module";',
    },
    {
      code: 'import {\n  b,\n  a,\n} from "module";',
      errors: [{ messageId: "sort" }],
      output: 'import {\n  a,\n  b,\n} from "module";',
    },
    {
      code: "export { b, a };",
      errors: [{ messageId: "sort" }],
      output: "export { a, b };",
    },
    {
      code: "export { b, type a };",
      errors: [{ messageId: "sort" }],
      output: "export { type a, b };",
    },
    {
      code: 'export { default as z, a } from "module";',
      errors: [{ messageId: "sort" }],
      output: 'export { a, default as z } from "module";',
    },
  ],
});
