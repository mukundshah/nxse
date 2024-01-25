<script setup lang="ts">
import type { Ref } from 'vue'
import { inject, ref } from 'vue'

// @ts-expect-error auto-generated
import { navigationTree } from '#build/server-extension/admin/navigation-tree'

const to = '/'
const title = 'Admin'

const header = {
  wrapper: 'bg-background/75 backdrop-blur border-b border-gray-200 dark:border-gray-800 -mb-px sticky top-0 z-50',
  container: 'flex items-center justify-between gap-3 h-[--header-height]',
  left: 'lg:flex-1 flex items-center gap-1.5',
  center: 'hidden lg:flex',
  right: 'flex items-center justify-end lg:flex-1 gap-1.5',
  logo: 'flex-shrink-0 font-bold text-xl text-gray-900 dark:text-white flex items-end gap-1.5',
  panel: {
    wrapper: 'fixed inset-0 z-50 overflow-y-auto bg-background lg:hidden',
    header: 'px-4 sm:px-6',
    body: 'px-4 sm:px-6 pt-3 pb-6',
  },
  button: {
    base: 'lg:hidden',
    icon: {
      open: 'i-heroicons-bars-3',
      close: 'i-heroicons-x-mark-20-solid',
    },
  },
}

const ui = {
  wrapper: 'flex flex-col lg:grid lg:grid-cols-10 lg:gap-8',
  body: { wrapper: 'mt-8 pb-24' },
  left: 'lg:col-span-2',
  center: {
    narrow: 'lg:col-span-6',
    full: 'lg:col-span-8',
  },
  right: 'lg:col-span-2 order-first lg:order-last',
  header: {
    wrapper: 'relative border-b border-gray-200 dark:border-gray-800 py-8',
    container: 'flex flex-col lg:flex-row lg:items-center lg:justify-between',
    headline: 'mb-4 text-sm/6 font-semibold text-primary flex items-center gap-1.5',
    title: 'text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight',
    description: 'mt-4 text-lg text-gray-500 dark:text-gray-400',
    icon: {
      wrapper: 'flex',
      base: 'w-10 h-10 flex-shrink-0 text-primary',
    },
    links: 'flex flex-wrap items-center gap-1.5 mt-4 lg:mt-0',
  },
}

const aside = {
  wrapper: 'hidden overflow-y-auto lg:block lg:max-h-[calc(100vh-var(--header-height))] lg:sticky lg:top-[--header-height] py-8 lg:px-4 lg:-mx-4',
  top: {
    wrapper: 'sticky -top-8 -mt-8 pointer-events-none z-[1]',
    header: 'h-8 bg-background -mx-4 px-4',
    body: 'bg-background relative pointer-events-auto flex -mx-4 px-4',
    footer: 'h-8 bg-gradient-to-b from-background -mx-4 px-4',
  },
}

const items = [
  [{
    label: 'Profile',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/739984?v=4',
    },
  }],
  [{
    label: 'Edit',
    icon: 'i-heroicons-pencil-square-20-solid',
    shortcuts: ['E'],
    click: () => {
      // eslint-disable-next-line no-console
      console.log('Edit')
    },
  }, {
    label: 'Duplicate',
    icon: 'i-heroicons-document-duplicate-20-solid',
    shortcuts: ['D'],
    disabled: true,
  }],
  [{
    label: 'Archive',
    icon: 'i-heroicons-archive-box-20-solid',
  }, {
    label: 'Move',
    icon: 'i-heroicons-arrow-right-circle-20-solid',
  }],
  [{
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid',
    shortcuts: ['⌘', 'D'],
  }],
]

const hasAdminFilters = inject<Ref<boolean>>('hasAdminFilters', ref(false))
</script>

<template>
  <NuxtLoadingIndicator />
  <Body class="min-h-screen font-sans antialiased">
    <header :class="header.wrapper">
      <UContainer :class="header.container">
        <div :class="header.left">
          <NuxtLink :to="to" :aria-label="title ?? 'Admin'" :class="header.logo">
            {{ title ?? 'Admin' }}
          </NuxtLink>
        </div>
        <div :class="header.right">
          <UDropdown :items="items">
            <UAvatar size="xs" src="https://avatars.githubusercontent.com/u/739984?v=4" />
          </UDropdown>
        </div>
      </UContainer>
    </header>
    <main class="min-h-[calc(100vh-4rem)]">
      <UContainer>
        <div :class="ui.wrapper">
          <div :class="ui.left">
            <aside :class="aside.wrapper">
              <div class="relative">
                <UNavigationTree :links="navigationTree" />
              <!-- <nav v-if="links.length" :class="ui.wrapper">
                <template v-for="(group, index) in links" :key="index">
                  <UNavigationAccordion
                    v-if="group.type === 'accordion'"
                    :links="group.children"
                    :level="level"
                    :multiple="multiple"
                    :default-open="defaultOpen"
                  />
                  <UNavigationLinks v-else :links="group.children" :level="level" />
                </template>
              </nav> -->
              </div>
            </aside>
          </div>
          <div :class="hasAdminFilters ? ui.center.narrow : ui.center.full">
            <slot></slot>
          </div>
          <div v-if="hasAdminFilters" :class="ui.right">
          </div>
        </div>
      </UContainer>
    </main>
  </Body>
</template>
