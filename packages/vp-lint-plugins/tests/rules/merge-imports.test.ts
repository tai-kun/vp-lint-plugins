import mergeImports from "../../src/rules/merge-imports.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("merge-imports", mergeImports, {
  valid: [
    'import { a } from "module";',
    `
import { a } from "module";
import { b } from "other";
    `,
    `
import { a } from "module";
import { b } from "other";
import { c } from "module";
    `,
    `
import "module";
import "module";
    `,
    `
import "module";
import { a } from "module";
    `,
    `
import { a } from "module";
import "other";
import { b } from "module";
    `,
    `
import * as namespace from "module";
import { a } from "module";
    `,
    `
import { a } from "module";
// comment
import { b } from "module";
    `,
    `
import { a } from "module";
import { b /* comment */ } from "module";
    `,
    `
import { a } from "module";
import { b } from "module" with { type: "json" };
    `,
    `
import a from "module";
import b from "module";
    `,
    `
import { a /* comment */ } from "module";
import { b } from "module";
    `,
    `
import defer * as namespace from "module";
import { a } from "module";
    `,
  ],
  invalid: [
    {
      code: `
import { a } from "module";
import { b } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { a, b } from "module";
      `,
    },
    {
      code: `
import { a } from "module";

import { b } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { a, b } from "module";
      `,
    },
    {
      code: `
import value from "module";
import { a } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import value, { a } from "module";
      `,
    },
    {
      code: `
import value, { a } from "module";
import { b } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import value, { a, b } from "module";
      `,
    },
    {
      code: `
import { a } from "module";
import value from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import value, { a } from "module";
      `,
    },
    {
      code: `
import { a } from "module";
import { b } from "module";
import { c } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { a, b, c } from "module";
      `,
    },
    {
      code: `
import { a } from "module";
import { b } from "other";
import { c } from "other";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { a } from "module";
import { b, c } from "other";
      `,
    },
    {
      code: `
import {
  a,
} from "module";
import { b } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import {
  a,
  b,
} from "module";
      `,
    },
    {
      code: `
import {
  a
} from "module";
import {
  b
} from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import {
  a,
  b
} from "module";
      `,
    },
    {
      code: `
import { a } from "module";
import value from "module";
import { b } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import value, { a, b } from "module";
      `,
    },
    {
      code: `
import type { A } from "module";
import type { B } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import type { A, B } from "module";
      `,
    },
    {
      code: `
import type { A } from "module";
import { b } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { type A, b } from "module";
      `,
    },
    {
      code: `
import { b } from "module";
import type { A } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { b, type A } from "module";
      `,
    },
    {
      code: `
import value from "module";
import type { A } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import value, { type A } from "module";
      `,
    },
    {
      code: `
import type Foo from "module";
import type { A } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { type default as Foo, type A } from "module";
      `,
    },
    {
      code: `
import type Foo from "module";
import { a } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { type default as Foo, a } from "module";
      `,
    },
    {
      code: `
import { a } from "module" with { type: "json" };
import { b } from "module" with { type: "json" };
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { a, b } from "module" with { type: "json" };
      `,
    },
    {
      code: `
import { a } from "module";
import { b } from 'module';
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { a, b } from "module";
      `,
    },
    {
      code: `
import { a } from "module"
import { b } from "module"
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { a, b } from "module"
      `,
    },
    {
      code: `
import type {
  A,
} from "module";
import { b } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import {
  type A,
  b,
} from "module";
      `,
    },
    {
      code: `
import value from "module";
import {
  a,
  b,
} from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import value, {
  a,
  b,
} from "module";
      `,
    },
    {
      code: `
import { a /* comment */ as b } from "module";
import { c } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import { a /* comment */ as b, c } from "module";
      `,
    },
    {
      code: `
import "side-effect";
import { a } from "module";
import { b } from "module";
      `,
      errors: [{ messageId: "merge" }],
      output: `
import "side-effect";
import { a, b } from "module";
      `,
    },
  ],
});
