import noUseEffect from "../../src/rules/no-use-effect.js";
import { createRuleTester } from "../support/rule-tester.js";

const ruleTester = createRuleTester();
ruleTester.run("no-use-effect", noUseEffect, {
  valid: [
    `
    import { useState } from "react";

    function useCounter() {
      return useState(0);
    }
    `,
    `
    import { useEffect } from "react";
    `,
    `
    import { useEffect as useReactEffect } from "react";
    `,
    `
    import type { useEffect } from "react";
    `,
    `
    import { useEffect } from "my-react";

    useEffect(() => {}, []);
    `,
    `
    import React from "react";

    function App() {
      return React.createElement("div");
    }
    `,
    `
    import * as React from "react";

    function useCounter() {
      return React.useState(0);
    }
    `,
    `
    import { useEffect } from "react";

    function run(effect: typeof useEffect) {
      effect();
    }
    `,
    `
    import * as React from "react";

    type Effect = typeof React.useEffect;
    `,
    `
    import { useEffect } from "react";

    function run() {
      const useEffect = () => {};
      useEffect();
    }
    `,
    `
    const React = { useEffect() {} };

    React.useEffect();
    `,
    `
    const foo = { useEffect() {} };

    foo.useEffect();
    `,
  ],
  invalid: [
    {
      code: `
      import { useEffect } from "react";

      useEffect(() => {}, []);
      `,
      errors: [{ messageId: "noUseEffect" }],
    },
    {
      code: `
      import { useEffect as useReactEffect } from "react";

      useReactEffect(() => {}, []);
      `,
      errors: [{ messageId: "noUseEffect" }],
    },
    {
      code: `
      import React from "react";

      React.useEffect(() => {}, []);
      `,
      errors: [{ messageId: "noUseEffect" }],
    },
    {
      code: `
      import * as React from "react";

      React.useEffect(() => {}, []);
      `,
      errors: [{ messageId: "noUseEffect" }],
    },
    {
      code: `
      import { default as React } from "react";

      React.useEffect(() => {}, []);
      `,
      errors: [{ messageId: "noUseEffect" }],
    },
    {
      code: `
      import React from "react";

      React["useEffect"](() => {}, []);
      `,
      errors: [{ messageId: "noUseEffect" }],
    },
    {
      code: `
      import { useEffect } from "react";

      const hook = useEffect;
      `,
      errors: [{ messageId: "noUseEffect" }],
    },
  ],
});
