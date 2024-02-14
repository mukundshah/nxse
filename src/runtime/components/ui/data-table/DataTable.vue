<script setup lang="ts" generic="TTable extends Record<string, any> = Record<string, any>">
import { upperFirst } from 'scule'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table'

import { computed } from '#imports'

// import DataTableToolbar from './DataTableToolbar.vue'

interface DataTableProps {
  rows: TTable[]
  pending?: boolean
}

const props = withDefaults(defineProps<DataTableProps>(), { pending: false })

const columns = computed(() => Object.keys(props.rows[0] ?? {}).map(key => ({ key, label: upperFirst(key) })))

// const sorting = ref<SortingState>([])
// const columnFilters = ref<ColumnFiltersState>([])
// const columnVisibility = ref<VisibilityState>({})
// const rowSelection = ref({})

// const table = useVueTable({
//   get data() { return props.data },
//   get columns() { return props.columns },
//   state: {
//     get sorting() { return sorting.value },
//     get columnFilters() { return columnFilters.value },
//     get columnVisibility() { return columnVisibility.value },
//     get rowSelection() { return rowSelection.value },
//   },
//   enableRowSelection: true,
//   onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
//   onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
//   onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
//   onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
//   getCoreRowModel: getCoreRowModel(),
//   getFilteredRowModel: getFilteredRowModel(),
//   getPaginationRowModel: getPaginationRowModel(),
//   getSortedRowModel: getSortedRowModel(),
//   getFacetedRowModel: getFacetedRowModel(),
//   getFacetedUniqueValues: getFacetedUniqueValues(),
// })
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="column in columns" :key="column.key">
              {{ column.label }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="rows.length">
            <TableRow
              v-for="(row, index) in rows"
              :key="index"
            >
              <TableCell v-for="(column, subIndex) in columns" :key="subIndex">
                {{ row[column.key] }}
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-else>
            <TableCell
              :col-span="columns.length"
              class="h-24 text-center"
            >
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- <DataTablePagination :table="table" /> -->
  </div>
</template>
