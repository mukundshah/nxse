<script lang="ts" setup>
import { provide } from 'vue'
import { useId } from 'radix-vue'
import type { HTMLAttributes, InjectionKey } from 'vue'
import { cn } from '../../../../utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<script lang="ts">
export const FORM_ITEM_INJECTION_KEY = Symbol('formItemInjectionKey') as InjectionKey<string>
const id = useId()
provide(FORM_ITEM_INJECTION_KEY, id)
</script>

<template>
  <div :class="cn('space-y-2', props.class)">
    <slot></slot>
  </div>
</template>
