<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center">
          <RouterLink to="/" class="text-2xl font-bold text-gray-900">
            {{ appTitle }}
          </RouterLink>
        </div>

        <nav class="hidden md:flex space-x-8">
          <RouterLink
            to="/"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Dashboard
          </RouterLink>

          <!-- Core Entities -->
          <RouterLink
            to="/items"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Items
          </RouterLink>
          <RouterLink
            to="/projects"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Projects
          </RouterLink>
          <RouterLink
            to="/partners"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Partners
          </RouterLink>

          <!-- Content & Media -->
          <RouterLink
            to="/pictures"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Pictures
          </RouterLink>
          <RouterLink
            to="/available-images"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Available Images
          </RouterLink>
          <RouterLink
            to="/image-uploads"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Image Uploads
          </RouterLink>

          <!-- People -->
          <RouterLink
            to="/artists"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Artists
          </RouterLink>
          <RouterLink
            to="/authors"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Authors
          </RouterLink>
          <RouterLink
            to="/workshops"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Workshops
          </RouterLink>

          <!-- Metadata -->
          <RouterLink
            to="/tags"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Tags
          </RouterLink>
          <RouterLink
            to="/details"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Details
          </RouterLink>

          <!-- Geography & Location -->
          <RouterLink
            to="/countries"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Countries
          </RouterLink>
          <RouterLink
            to="/addresses"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Addresses
          </RouterLink>

          <!-- Contact & Language -->
          <RouterLink
            to="/contacts"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Contacts
          </RouterLink>
          <RouterLink
            to="/languages"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Languages
          </RouterLink>
          <RouterLink
            to="/contexts"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Contexts
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
