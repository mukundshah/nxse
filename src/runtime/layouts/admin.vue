<script setup lang="ts">
// import type { Ref } from 'vue'
// import { inject, ref } from 'vue'

// @ts-expect-error auto-generated
import { navigationTree } from '#build/nxse/admin/navigation-tree'

// @ts-expect-error auto-generated
import { ADMIN_ROUTE, ADMIN_TITLE } from '#build/nxse/admin/constants'

import '#build/nxse/admin/stylesheets'

// const hasAdminFilters = inject<Ref<boolean>>('hasAdminFilters', ref(false))
</script>

<template>
  <NuxtLoadingIndicator :height="2" color="var(--primary)" />
  <div class="flex min-h-screen flex-col bg-background">
    <header class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border px-4">
      <div class="flex justify-between h-14 items-center">
        <!-- <MobileNav /> -->

        <div class="mr-4 hidden md:flex">
          <NuxtLink :to="ADMIN_ROUTE" :aria-label="ADMIN_TITLE">
            <h1 class="px-2 text-lg font-semibold tracking-tight">
              {{ ADMIN_TITLE }}
            </h1>
          </NuxtLink>
        </div>
        <div class=" flex items-center justify-end space-x-4 ">
          <AdminUserNav />
        </div>
      </div>
    </header>
    <main class="flex-1 bg-background">
      <div class="grid lg:grid-cols-5">
        <AdminSidebar :links="navigationTree" class="hidden lg:block" />
        <div class="col-span-3 lg:col-span-4 lg:border-l p-4">
          <slot></slot>
        </div>
      </div>
    </main>
  </div>
</template>
