<script setup lang="ts">
import { z } from 'zod'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'

import { Input } from './ui/input'

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

const onSubmit = async () => {
  // await useFetch(endpoint, { method, body: event.data })
}
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <template v-for="(field, key) in props.fields" :key="key">
      <FormField v-slot="{ componentField }" :name="field.name">
        <FormItem>
          <FormLabel> {{ field.label }} </FormLabel>
          <FormControl>
            <template v-if="field.type === 'select'">
              <!-- <USelect :options="field.options" /> -->
            </template>
            <template v-else-if="field.type === 'checkbox'">
              <!-- <UCheckbox /> -->
            </template>
            <template v-else-if="field.type === 'radio'">
              <!-- <URadio /> -->
            </template>
            <template v-else-if="field.type === 'textarea'">
              <!-- <UTextarea autoresize resize /> -->
            </template>
            <template v-else>
              <Input :type="field.type" v-bind="componentField" />
            </template>
            <FormDescription> {{ field.description }} </FormDescription>
            <FormMessage />
          </FormControl>
        </FormItem>
      </FormField>
      <UFormGroup :name="field.name" :label="field.label" />
    </template>
    <div class="flex items-center gap-4">
      <UButton type="button" color="red" variant="soft" label="Delete" />
      <UButton :loading="pending" type="submit" label="Save" />
    </div>
  </form>
</template>
