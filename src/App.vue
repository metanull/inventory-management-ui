<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <AppHeader />
    <ErrorDisplay />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
    <AppFooter />

    <!-- Global Components -->
    <LoadingOverlay />
    <DeleteConfirmation />
    <CancelChangesConfirmation />
  </div>
</template>

<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import AppHeader from '@/components/layout/app/AppHeader.vue'
  import AppFooter from '@/components/layout/app/AppFooter.vue'
  import LoadingOverlay from '@/components/global/LoadingOverlay.vue'
  import ErrorDisplay from '@/components/global/ErrorDisplay.vue'
  import DeleteConfirmation from '@/components/global/DeleteConfirmation.vue'
  import CancelChangesConfirmation from '@/components/global/CancelChangesConfirmation.vue'
</script>
