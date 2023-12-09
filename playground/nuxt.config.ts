import { defineNuxtModule } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'
import { resolve } from 'path'

export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools',
    /**
     * My module
     */
    '../src/module',
  ],
  serverExtension: {},
})
