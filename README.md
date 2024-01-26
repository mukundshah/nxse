<p align="center">
<img src="./docs/public/logo.svg" height="175">
</p>

<h1 align="center">Nuxt Server Extension (NXSE)</h1>

<p align="center"> 🚧 Work in progress 🚧 </p>

<p align="center">
<a href="https://nxse.vercel.app"> Why NXSE? </a> |
<a href="https://nxse.vercel.app"> Documentation </a> |
<a href="https://nxse.vercel.app"> Release Notes </a>
</p>

<p align="center">
<a href="https://npmjs.com/package/nxse"><img src="https://img.shields.io/npm/v/nxse?style=flat&colorA=1B3C4A&colorB=10B981" alt="npm version"></a>
<a href="https://npmjs.com/package/nxse"><img src="https://img.shields.io/npm/dm/nxse?style=flat&colorA=1B3C4A&colorB=10B981" alt="npm downloads"></a>
<a href=""><img alt="Nuxt" src="https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js"></a>
</p>

## Features

<!-- Highlight some of the features your module provide here -->
- Database utilities
- REST API Utilities (coming soon)
- Admin panel

## Quick Setup

1. Add `nxse` and `@nuxt/ui` dependency to your project (`nxse` does not ship with `@nuxt/ui`, but depends on it)

```bash
# Using pnpm
pnpm add nxse @nuxt/ui

# Using yarn
yarn add nxse @nuxt/ui

# Using npm
npm install nxse @nuxt/ui
```

2. Add `nxse` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    'nxse'
  ]
})
```

That's it! You can now use the utilities provided by `nxse` in your Nuxt project.

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm dev:prepare

# Playground
pnpm dev

# Documentation
pnpm docs:dev

# Run ESLint
pnpm lint

# Release new version
pnpm release
```

## Special Thanks

- [Awecode](https://awecode.com) for sponsoring this project
- [Nuxt](https://nuxt.com) for creating the best framework for Vue
- [Nuxt UI](https://ui.nuxt.com) for creating the best UI Library for Nuxt
- [Drizzle](https://orm.drizzle.com) for creating the best type-safe ORM

## License

[MIT License](./LICENSE) © 2023 [Mukund Shah](https://github.com/mukundshah) and contributors
