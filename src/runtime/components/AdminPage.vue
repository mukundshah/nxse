<script setup lang="ts">
import { upperFirst } from 'scule'
import { Button } from './ui/button'

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
</script>

<template>
  <div class="space-y-8 p-8">
    <div class="flex items-center justify-between">
      <!-- BreadCrumb -->
      <h2 class="text-2xl font-semibold">
        {{ upperFirst(title) }}
      </h2>
      <div class="flex items-center space-x-2">
        <Button
          v-for="(action, index) in props.actions"
          :key="index"
          :as-child="true"
        >
          <NuxtLink :to="action.to">
            {{ action.label }}
          </NuxtLink>
        </Button>
      </div>
    </div>

    <slot></slot>
  </div>
</template>
