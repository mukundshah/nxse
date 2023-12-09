<script setup lang="ts">
import { upperFirst } from 'scule'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  actions?: {
    label: string
    icon: string
    to: string
  }[]
}>(), {
  actions: () => [],
})

const ui = {
  wrapper: 'flex flex-col lg:grid lg:grid-cols-10 lg:gap-8',
  body: { wrapper: 'mt-8 pb-24' },
  left: 'lg:col-span-2',
  center: {
    base: 'lg:col-span-8',
    full: 'lg:col-span-10',
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
</script>

<template>
  <div :class="ui.header.wrapper">
    <div class="flex flex-col items-start gap-6 lg:flex-row">
      <div class="flex-1">
        <div :class="ui.header.container">
          <h1 :class="ui.header.title">
            {{ upperFirst(title) }}
          </h1>
          <div :class="ui.header.links">
            <UButton
              v-for="(action, index) in props.actions"
              :key="index"
              :to="action.to"
              :label="action.label"
              :icon="action.icon"
              color="white"
              class="flex-shrink-0"
            />
          </div>
        </div>

        <p v-if="description" :class="ui.header.description">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
  <div :class="ui.body.wrapper">
    <slot></slot>
  </div>
</template>
