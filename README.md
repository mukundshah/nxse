<p align="center">
<img src="./docs/public/logo.png" height="175">
</p>

<h1 align="center">Nuxt Server Extension (NXSE)</h1>

<p align="center"> 🚧 Work in progress 🚧 </p>

<p align="center">
<a href="https://nxse.vercel.app"> Why NXSE? </a> |
<a href="https://nxse.vercel.app"> Documentation </a> |
<a href="https://nxse.vercel.app"> Release Notes </a>
</p>

<p align="center">
<!-- <a href="https://npmjs.com/package/@stylistic/eslint-plugin-js"><img src="https://img.shields.io/npm/v/@stylistic/eslint-plugin-js?style=flat&colorA=1B3C4A&colorB=32A9C3" alt="npm version"></a>
<a href="https://npmjs.com/package/@stylistic/eslint-plugin-js"><img src="https://img.shields.io/npm/dm/@stylistic/eslint-plugin-js?style=flat&colorA=1B3C4A&colorB=32A9C3" alt="npm downloads"></a>
<a href="https://app.codecov.io/gh/eslint-stylistic/eslint-stylistic"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/eslint-stylistic/eslint-stylistic?token=B85J0E2I7I&style=flat&labelColor=1B3C4A&color=32A9C3&precision=1"></a> -->
<a href=""><img alt="Nuxt" src="https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js"></a>
</p>

My new Nuxt module integrated with the [Nuxt Devtools](https://github.com/nuxt/devtools).

## Features

<!-- Highlight some of the features your module provide here -->
- Database utilities
- REST API Utilities (coming soon)
- Admin panel

## Quick Setup

1. Add `nxse` dependency to your project

```bash
# Using pnpm
pnpm add nxse

# Using yarn
yarn add nxse

# Using npm
npm install nxse
```

2. Add `nxse` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    'nxse'
  ]
})
```

That's it! You can now use My Module in your Nuxt app ✨

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with playground, with devtools client ui
npm run dev

# Develop with playground, with bundled client ui
npm run play:prod

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

## Special Thanks

- [Awecode](https://awecode.com) for sponsoring this project
- [Nuxt](https://nuxt.com) for creating the best framework for Vue
- [Nuxt UI](https://ui.nuxt.com) for creating the best UI Library for Nuxt
- [Drizzle](https://orm.drizzle.com) for creating the best type-safe ORM

## License

[MIT License](./LICENSE) © 2023 [Mukund Shah](https://github.com/mukundshah)

<!-- Badges -->
<!-- [npm-version-src]: https://img.shields.io/npm/v/nxse/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nxse

[npm-downloads-src]: https://img.shields.io/npm/dm/nxse.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nxse

[license-src]: https://img.shields.io/npm/l/nxse.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nxse
-->
