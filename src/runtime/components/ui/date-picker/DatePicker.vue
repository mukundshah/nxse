<script setup lang="ts">
import { format } from 'date-fns'
import { CalendarIcon } from '@radix-icons/vue'

import { ref } from 'vue'
import { cn } from '../../../../utils'
import { Button } from '../button'
import { Calendar } from '../calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../popover'

const date = ref<Date>()
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="cn(
          'w-[280px] justify-start text-left font-normal',
          !date && 'text-muted-foreground',
        )"
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        <span>{{ date ? format(date, "PPP") : "Pick a date" }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar v-model="date" />
    </PopoverContent>
  </Popover>
</template>
