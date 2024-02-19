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
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'
import { Button } from './ui/button'

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
      <FormField v-slot="{ componentField }" :name="field.name" class="py-2">
        <FormItem>
          <FormLabel>
            {{ field.label }}
            <span v-if="field.required" class="text-destructive"> *</span>
          </FormLabel>
          <FormControl>
            <template v-if="field.type === 'select'">
              <!-- <USelect :options="field.options" /> -->
            </template>
            <template v-else-if="field.type === 'checkbox'">
              <Checkbox v-bind="componentField" />
            </template>
            <template v-else-if="field.type === 'radio'">
              <!-- <URadio /> -->
            </template>
            <template v-else-if="field.type === 'textarea'">
              <Textarea v-bind="componentField" />
            </template>
            <template v-else>
              <Input :type="field.type" v-bind="componentField" />
            </template>
            <FormDescription> {{ field.description }} </FormDescription>
            <FormMessage />
          </FormControl>
        </FormItem>
      </FormField>
    </template>
  </form>
  <div class="flex flex-row-reverse items-center w-full rounded-md  border-input justify-between gap-4">
    <div class="flex flex-row-reverse justify-end gap-4">
      <Button type="submit" :disabled="pending">
        Save
      </Button>
      <Button type="submit" :disabled="pending" variant="secondary">
        Save and continue editing
      </Button>
      <Button type="button" :disabled="pending" variant="secondary">
        Save and add another
      </Button>
    </div>
    <div class="flex flex-row-reverse justify-end gap-4">
      <Button v-if="props.edit" type="submit" :disabled="pending" variant="destructive">
        Delete
      </Button>
      <Button v-else type="submit" :disabled="pending" variant="destructive">
        Cancel
      </Button>
    </div>
  </div>
</template>
