<script setup lang="ts">
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
  <div class="flex items-center justify-between w-full pb-5">
    <div>
      <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." />
    </div>

    <div class="flex gap-1.5 items-center">
      <!-- <UDropdown v-if="selectedRows.length > 1" :items="actions" :ui="{ width: 'w-36' }">
        <UButton
          icon="i-heroicons-chevron-down"
          trailing
          color="gray"
          size="xs"
        >
          Mark as
        </UButton>
      </UDropdown> -->

      <!-- <USelectMenu v-model="selectedColumns" :options="columns" multiple>
        <UButton
          icon="i-heroicons-view-columns"
          color="gray"
          size="xs"
        >
          Columns
        </UButton>
      </USelectMenu>

      <UButton
        icon="i-heroicons-funnel"
        color="gray"
        size="xs"
        :disabled="search === '' && selectedStatus.length === 0"
        @click="resetFilters"
      >
        Reset
      </UButton> -->
    </div>
  </div>
  <UTable
    :rows="data.results"
    :loading="pending"
    sort-asc-icon="i-heroicons-arrow-up"
    sort-desc-icon="i-heroicons-arrow-down"
    class="w-full"
  />
  <div v-if="data && data.pagination" class="flex flex-wrap items-center justify-between pt-5">
    <div class="flex items-center gap-1.5">
      <span class="text-sm leading-5">Rows per page:</span>

      <USelect
        v-model="pageSize"
        :options="[10, 20, 50, 100, 200]"
        size="xs"
      />
    </div>

    <UPagination
      v-if="data.pagination.pages > 1"
      v-model="page"
      :page-count="data.pagination.size"
      :total="data.pagination.pages"
    />
  </div>
</template>
