<script setup lang="ts">
import { cn } from '../../utils'

import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'

interface SidebarProps {
  links: Array<{
    to: string
    label: string
  }>
}

defineProps<SidebarProps>()
</script>

<template>
  <div :class="cn('pb-12', $attrs.class ?? '')">
    <div class="space-y-4 py-4">
      <div class="py-2">
        <ScrollArea class="h-full px-1">
          <div class="space-y-1 p-2">
            <Button
              v-for="(link, i) in links"
              :key="`${link}-${i}`"
              :as-child="true"
              variant="ghost"
              class="w-full justify-start font-normal"
            >
              <NuxtLink :to="link.to">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  class="mr-2 h-4 w-4"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                {{ link.label }}
              </NuxtLink>
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  </div>
</template>
