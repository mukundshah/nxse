<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui/dist/runtime/types'

import { reactive, ref, useFetch, useLazyFetch, useRoute } from '#imports'

const props = withDefaults(defineProps<{
  endpoint: string
  edit: boolean
  fields: Record<string, any>
}>(), {
  edit: false,
})

const form = ref()
const schema = z.object(props.fields)
const state = reactive({})

const method = props.edit ? 'patch' : 'post'
const endpoint = props.edit ? `${props.endpoint}/${useRoute().params.pk}` : props.endpoint

const { pending } = await useLazyFetch(endpoint, { method })

const onSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  await useFetch(endpoint, { method, body: event.data })
}
</script>

<template>
  <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <template v-for="(field, key) in props.fields" :key="key">
      <UFormGroup :name="field.name" :label="field.label">
        <template v-if="field.type === 'select'">
          <USelect :options="field.options" />
        </template>
        <template v-else-if="field.type === 'checkbox'">
          <UCheckbox />
        </template>
        <template v-else-if="field.type === 'radio'">
          <URadio />
        </template>
        <template v-else-if="field.type === 'textarea'">
          <UTextarea autoresize resize />
        </template>
        <template v-else>
          <UInput :type="field.type" />
        </template>
      </UFormGroup>
    </template>
    <div class="flex items-center gap-4">
      <UButton type="button" color="red" variant="soft" label="Delete" />
      <UButton :loading="pending" type="submit" label="Save" />
    </div>
  </UForm>
</template>
