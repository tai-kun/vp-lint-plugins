import sortJsxProps from "../../src/rules/sort-jsx-props.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("sort-jsx-props", sortJsxProps, {
  valid: [
    {
      code: 'const element = <div a="1" b="2" />;',
      filename: "component.tsx",
    },
    {
      code: 'const element = <div a="1" onClick={f} aria-label="x" data-id="y" />;',
      filename: "component.tsx",
    },
    {
      code: 'const element = <div {...props} a="1" b="2" />;',
      filename: "component.tsx",
    },
    {
      code: 'const element = <div a="1" a="2" />;',
      filename: "component.tsx",
    },
    {
      code: 'const element = <div z="1" />;',
      filename: "component.tsx",
    },
  ],
  invalid: [
    {
      code: 'const element = <div z="1" a="2" />;',
      errors: [{ messageId: "sort" }],
      output: 'const element = <div a="2" z="1" />;',
      filename: "component.tsx",
    },
    {
      code: 'const element = <div data-id="y" aria-label="x" onClick={f} a="1" />;',
      errors: [{ messageId: "sort" }],
      output: 'const element = <div a="1" onClick={f} aria-label="x" data-id="y" />;',
      filename: "component.tsx",
    },
    {
      code: 'const element = <div foo="1" a="2" b="3" />;',
      errors: [{ messageId: "sort" }],
      output: 'const element = <div a="2" b="3" foo="1" />;',
      filename: "component.tsx",
    },
    {
      code: 'const element = (\n  <div\n    b="1"\n    a="2"\n  />\n);',
      errors: [{ messageId: "sort" }],
      output: 'const element = (\n  <div\n    a="2"\n    b="1"\n  />\n);',
      filename: "component.tsx",
    },
  ],
});
