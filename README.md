<p align="center"><img width="128" src="https://raw.githubusercontent.com/await-widget/.github/refs/heads/main/assets/app-icon.webp" /></p>

<h1 align="center">Await Widget Types</h1>

<p align="center">TypeScript declarations for Await widgets.</p>

<p align="center"><a href="https://apps.apple.com/app/id6755678187"><img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" /></a></p>

## What's Included

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

## License

MIT
