<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <AppHeader />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
    <!-- Global Error Display -->
    <ErrorDisplay />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import AppHeader from '@/components/layout/AppHeader.vue'
  import AppFooter from '@/components/layout/AppFooter.vue'
  import ErrorDisplay from '@/components/layout/ErrorDisplay.vue'
</script>
