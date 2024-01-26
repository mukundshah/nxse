import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress'

const sidebarDocs: DefaultTheme.SidebarItem[] = [
  {
    text: 'Getting Started',
    base: '/getting-started/',
    items: [
      { text: 'What is NXSE?', link: 'what-is-nxse' },
      { text: 'Installation & Setup', link: 'installation' },
    ],
  },
  {
    text: 'Guide',
    base: '/guide/',
    items: [
      { text: 'Database', link: 'database' },
      { text: 'Admin Panel', link: 'admin-panel' },
    ],
  },
  {
    text: 'API Reference',
    base: '/api/',
    items: [
      { text: 'Nuxt Config', link: 'nuxt-config' },
    ],
  },
]

export default defineConfig({
  title: 'NXSE',
  titleTemplate: ':title - NXSE',
  description: 'Database utilities, API views, admin UI, and more for Nuxt',

  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'NXSE - Nuxt Server Extension' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/mukundshah/nxse/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    nav: [
      {
        text: 'Docs',
        link: '/getting-started/installation',
        activeMatch: '^/(getting-started|guide|api)/',
      },
    ],

    sidebar: {
      '/': { base: '/', items: sidebarDocs },
    },

    socialLinks: [
      { icon: 'npm', link: 'https://npmjs.com/package/nxse' },
      { icon: 'github', link: 'https://github.com/mukundshah/nxse' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © ${new Date().getFullYear()} mukundshah & contributors`,
    },
  },
})
