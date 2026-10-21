import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Next registers jsx-a11y but enables only a handful of its rules (as
    // warnings); turn on the full recommended set as errors.
    files: ["**/*.{jsx,tsx}"],
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  {
    rules: {
      // Hard ceiling: files must be split by responsibility, not grown.
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],

      // Correctness & hygiene.
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "object-shorthand": "error",
      "no-nested-ternary": "error",
      "react/prefer-read-only-props": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", disallowTypeAnnotations: false },
      ],

      // Deterministic import layout (auto-fixable).
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
          ],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // Bundle size: named imports that defeat tree-shaking on the client.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportDeclaration[source.value='zod'] > ImportSpecifier[imported.name='z']",
          message:
            'Use `import * as z from "zod"`: the named `z` keeps every Zod locale (~200KB) in the client bundle.',
        },
        {
          selector:
            "ImportDeclaration[source.value='framer-motion'] > ImportSpecifier[imported.name='motion']",
          message:
            "Use `m` from framer-motion: MotionProvider loads animation features lazily.",
        },
      ],

      // Domain boundaries: consume lib domains through their public API.
      // The two negated patterns are the documented server-only entry points.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/*/*", "!@/lib/trip/service", "!@/lib/ai/generate"],
              message:
                "Import via the domain's public API (e.g. @/lib/trip). Deep imports are limited to documented server entry points.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.*", "e2e/**"],
    rules: {
      "max-lines": "off",
    },
  },
  {
    // Vendored shadcn primitives follow upstream shape; skip on regenerable files.
    files: ["src/components/ui/**"],
    rules: {
      "react/prefer-read-only-props": "off",
      // Headings get their text through spread `children`.
      "jsx-a11y/heading-has-content": "off",
    },
  },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**"]),
]);

export default eslintConfig;
