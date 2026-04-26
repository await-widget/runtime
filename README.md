# Await Widget Types

TypeScript declarations for Await widgets.

This package replaces the local `paths` setup used by widget templates. It provides:

- the `await` module for components such as `Text`, `Image`, `VStack`, and `Button`
- the `await/jsx-runtime` module for `jsxImportSource`
- global Await bridge APIs such as `Await`, `AwaitStore`, and `AwaitNetwork`
- the Await JSX constraints, including no native HTML intrinsic elements

## Install

```sh
npm install -D @await-widget/runtime
```

## tsconfig

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "await",
    "types": ["@await-widget/runtime"]
  }
}
```

After that, widget source can keep importing components from `await`:

```tsx
import { Text, VStack } from "await";

function widget() {
  return (
    <VStack>
      <Text value="Hello, Await" />
    </VStack>
  );
}

Await.define({
  widget,
});
```

## Why `types` Is Still Needed

Ordinary npm packages are not automatically loaded as global type packages. TypeScript only auto-loads packages under `node_modules/@types/*`, unless the project restricts `compilerOptions.types`.

This package keeps the real module name as `await` while publishing under `@await-widget/runtime`, so projects should add `"types": ["@await-widget/runtime"]`.

If this is later published as a true `@types/await` package, the global declarations can be auto-loaded in projects that do not override `compilerOptions.types`. `jsxImportSource` still has to be configured as `await`.
