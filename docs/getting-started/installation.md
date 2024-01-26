---
outline: deep
---

# Installation and Setup

### Prerequisites

- [Nuxt](https://nuxt.com) `^3.8.0`
- [Nuxt UI](https://ui.nuxt.com) `^2.12.0`

### Installation

::: code-group

```sh [pnpm]
$ pnpm i -D nxse
```

```sh [yarn]
$ yarn add -D nxse
```

```sh [npm]
$ npm install -D nxse
```

:::

### Setup

Add `nxse` to the `modules` of `nuxt.config.ts`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    'nxse'
  ]
})
```

### Configuration

You can configure `nxse` in the `nxse` section of `nuxt.config.ts`:

```ts
// nuxt.config.ts

export default defineNuxtConfig({
  nxse: {
    // Options
  }
})
```

Available options are described in [configuration reference](/api/nuxt-config).
