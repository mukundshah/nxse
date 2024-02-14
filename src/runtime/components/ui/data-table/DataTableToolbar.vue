<script setup lang="ts" generic="TTable">
import type { Table } from '@tanstack/vue-table'

import { Input } from '../input'

interface DataTableToolbarProps {
  table: Table<TTable>
}

defineProps<DataTableToolbarProps>()
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-1 items-center space-x-2">
      <Input
        placeholder="Filter tasks..."
        :model-value="(table.getColumn('title')?.getFilterValue() as string) ?? ''"
        class="h-8 w-[150px] lg:w-[250px]"
        @input="table.getColumn('title')?.setFilterValue($event.target.value)"
      />
    </div>
    <!-- Replace this with actions -->
    <!-- <DataTableViewOptions :table="table" /> -->
  </div>
</template>
