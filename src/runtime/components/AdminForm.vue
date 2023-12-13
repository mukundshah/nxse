<script setup lang="ts">
import { computed, ref, useLazyFetch, useRoute } from '#imports'

const props = withDefaults(defineProps<{
  endpoint: string
  edit: boolean
  fields: Record<string, any>
}>(), {
  edit: false,
})

const form = ref()
const method = props.edit ? 'patch' : 'post'
const endpoint = props.edit ? `${props.endpoint}/${useRoute().params.pk}` : props.endpoint

const { data, pending } = await useLazyFetch(endpoint, { method })
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
  </UForm>
</template>
