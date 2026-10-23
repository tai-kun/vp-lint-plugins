import overloadSignaturesAdjacent from "../../src/rules/overload-signatures-adjacent.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("overload-signatures-adjacent", overloadSignaturesAdjacent, {
  valid: [
    "function f(a: string): void;\nfunction f(a: number): void;\nfunction f(a: string | number): void {}",
    "function f(a: string): void;\nfunction f(a: string): void {}\n\nfunction g() {}",
    "function f(a: string): void;\nfunction f(a: string): void {}",
    "function f(a: string): void;\n// comment\nfunction f(a: string): void {}",
    "class A {\n  f(a: string): void;\n  f(a: number): void;\n  f(a: string | number): void {}\n}",
  ],
  invalid: [
    {
      code: "function f(a: string): void;\n\nfunction f(a: number): void;\nfunction f(a: string | number): void {}",
      errors: [{ messageId: "adjacent" }],
      output:
        "function f(a: string): void;\nfunction f(a: number): void;\nfunction f(a: string | number): void {}",
    },
    {
      code: "function f(a: string): void;\n\nfunction f(a: string): void {}",
      errors: [{ messageId: "adjacent" }],
      output: "function f(a: string): void;\nfunction f(a: string): void {}",
    },
    {
      code: "class A {\n  f(a: string): void;\n\n  f(a: number): void;\n  f(a: string | number): void {}\n}",
      errors: [{ messageId: "adjacent" }],
      output:
        "class A {\n  f(a: string): void;\n  f(a: number): void;\n  f(a: string | number): void {}\n}",
    },
    {
      code: "export function f(a: string): void;\n\nexport function f(a: string): void {}",
      errors: [{ messageId: "adjacent" }],
      output: "export function f(a: string): void;\nexport function f(a: string): void {}",
    },
  ],
});
