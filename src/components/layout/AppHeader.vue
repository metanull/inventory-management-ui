<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center">
          <RouterLink to="/" class="text-2xl font-bold text-gray-900">
            {{ appTitle }}
          </RouterLink>
        </div>

        <nav class="hidden md:flex space-x-8 items-center">
          <RouterLink
            to="/"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Dashboard
          </RouterLink>
        </nav>

        <div class="flex items-center space-x-4">
          <button
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { RouterLink, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()
  const appTitle = import.meta.env.VITE_APP_TITLE

  const handleLogout = async () => {
    await authStore.logout()
    router.push('/login')
  }
</script>

<style scoped>
  .router-link-active {
    @apply text-primary-600 border-primary-600;
  }
</style>
