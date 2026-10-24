import mergeImports from "../../src/rules/merge-imports.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("merge-imports", mergeImports, {
  valid: [
    'import { a } from "module";',
    'import { a } from "module";\nimport { b } from "other";',
    'import { a } from "module";\nimport { b } from "other";\nimport { c } from "module";',
    'import "module";\nimport "module";',
    'import "module";\nimport { a } from "module";',
    'import { a } from "module";\nimport "other";\nimport { b } from "module";',
    'import * as namespace from "module";\nimport { a } from "module";',
    'import { a } from "module";\n// comment\nimport { b } from "module";',
    'import { a } from "module";\nimport { b /* comment */ } from "module";',
    'import { a } from "module";\nimport { b } from "module" with { type: "json" };',
    'import a from "module";\nimport b from "module";',
    'import { a /* comment */ } from "module";\nimport { b } from "module";',
    'import defer * as namespace from "module";\nimport { a } from "module";',
  ],
  invalid: [
    {
      code: 'import { a } from "module";\nimport { b } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import { a, b } from "module";',
    },
    {
      code: 'import { a } from "module";\n\nimport { b } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import { a, b } from "module";',
    },
    {
      code: 'import value from "module";\nimport { a } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import value, { a } from "module";',
    },
    {
      code: 'import value, { a } from "module";\nimport { b } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import value, { a, b } from "module";',
    },
    {
      code: 'import { a } from "module";\nimport value from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import value, { a } from "module";',
    },
    {
      code: 'import { a } from "module";\nimport { b } from "module";\nimport { c } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import { a, b, c } from "module";',
    },
    {
      code: 'import { a } from "module";\nimport { b } from "other";\nimport { c } from "other";',
      errors: [{ messageId: "merge" }],
      output: 'import { a } from "module";\nimport { b, c } from "other";',
    },
    {
      code: 'import {\n  a,\n} from "module";\nimport { b } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import {\n  a,\n  b,\n} from "module";',
    },
    {
      code: 'import {\n  a\n} from "module";\nimport {\n  b\n} from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import {\n  a,\n  b\n} from "module";',
    },
    {
      code: 'import { a } from "module";\nimport value from "module";\nimport { b } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import value, { a, b } from "module";',
    },
    {
      code: 'import type { A } from "module";\nimport type { B } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import type { A, B } from "module";',
    },
    {
      code: 'import type { A } from "module";\nimport { b } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import { type A, b } from "module";',
    },
    {
      code: 'import { b } from "module";\nimport type { A } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import { b, type A } from "module";',
    },
    {
      code: 'import value from "module";\nimport type { A } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import value, { type A } from "module";',
    },
    {
      code: 'import type Foo from "module";\nimport type { A } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import { type default as Foo, type A } from "module";',
    },
    {
      code: 'import type Foo from "module";\nimport { a } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import { type default as Foo, a } from "module";',
    },
    {
      code: 'import { a } from "module" with { type: "json" };\nimport { b } from "module" with { type: "json" };',
      errors: [{ messageId: "merge" }],
      output: 'import { a, b } from "module" with { type: "json" };',
    },
    {
      code: "import { a } from \"module\";\nimport { b } from 'module';",
      errors: [{ messageId: "merge" }],
      output: 'import { a, b } from "module";',
    },
    {
      code: 'import { a } from "module"\nimport { b } from "module"',
      errors: [{ messageId: "merge" }],
      output: 'import { a, b } from "module"',
    },
    {
      code: 'import type {\n  A,\n} from "module";\nimport { b } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import {\n  type A,\n  b,\n} from "module";',
    },
    {
      code: 'import value from "module";\nimport {\n  a,\n  b,\n} from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import value, {\n  a,\n  b,\n} from "module";',
    },
    {
      code: 'import { a /* comment */ as b } from "module";\nimport { c } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import { a /* comment */ as b, c } from "module";',
    },
    {
      code: 'import "side-effect";\nimport { a } from "module";\nimport { b } from "module";',
      errors: [{ messageId: "merge" }],
      output: 'import "side-effect";\nimport { a, b } from "module";',
    },
  ],
});
