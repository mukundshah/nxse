# Nuxt Server Extension 🚧

<!-- [![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href] -->
[![Nuxt][nuxt-src]][nuxt-href]

My new Nuxt module integrated with the [Nuxt Devtools](https://github.com/nuxt/devtools).

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- Database utilities
- REST API Utilities
- Admin panel

## Quick Setup

1. Add `nuxt-server-extension` dependency to your project

```bash
# Using pnpm
pnpm add nuxt-server-extension

# Using yarn
yarn add nuxt-server-extension

# Using npm
npm install nuxt-server-extension
```

2. Add `nuxt-server-extension` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-server-extension'
  ]
})
```

That's it! You can now use My Module in your Nuxt app ✨

## Documentation

Visit [nxse.vercel.app](https://nxse.vercel.app) for more information.


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

<!-- Badges -->
<!-- [npm-version-src]: https://img.shields.io/npm/v/nuxt-server-extension/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-server-extension

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-server-extension.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-server-extension

[license-src]: https://img.shields.io/npm/l/nuxt-server-extension.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-server-extension
-->
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
