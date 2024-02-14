<script setup lang="ts">
import DataTable from './ui/data-table/DataTable.vue'
import { Input } from './ui/input'

import { computed, provide, ref, useFetch, watch } from '#imports'

const props = defineProps<{
  endpoint: string
}>()

// const selectedColumns = ref([])
// const selectedRows = ref([])
// const actions = []

const search = ref('')
const pageSize = ref(20)
const page = ref(1)

const params = computed(() => ({
  q: search.value,
  page: page.value,
  size: pageSize.value,
  sort: '',
}))

const { data, pending } = await useFetch<any>(props.endpoint, { params, default: () => ({ pagination: null, results: [] }) })

watch(data, () => {
  if (data.value && data.value.filters) {
    provide('adminFilters', data.value.filters)
    provide('hasAdminFilters', ref(true))
  }
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex flex-1 items-center space-x-2">
        <Input
          v-model="search"
          placeholder="Search"
          class="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
    <!-- Replace this with actions -->
    <!-- <DataTableViewOptions :table="table" /> -->
    </div>
    <DataTable :rows="data.results" :pending="pending" />
  </div>
</template>
