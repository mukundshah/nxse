<script setup lang="ts">
import { computed, ref } from '#imports'

const _props = defineProps<{
  endpoint: string
}>()

// const selectedColumns = ref([])
// const selectedRows = ref([])
// const actions = []

const search = ref('')
const pageSize = ref(20)
const page = ref(1)

const _params = computed(() => ({
  q: search.value,
  page: page.value,
  size: pageSize.value,
  sort: '',
}))

// const { data, pending } = await useLazyFetch(props.endpoint, { params })
</script>

<template>
  <div class="flex items-center justify-between w-full pb-5">
    <div class="flex items-center gap-2">
      <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
        <i class="i-heroicons-trash-2"></i>
      </div>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        Delete
      </h2>
    </div>
    <div class="flex items-center gap-2">
      <button class="btn btn-primary">
        Delete
      </button>
      <button class="btn btn-white">
        Cancel
      </button>
    </div>
  </div>
</template>
