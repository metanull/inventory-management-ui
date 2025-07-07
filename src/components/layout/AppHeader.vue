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
          <RouterLink
            to="/tags"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Tags
          </RouterLink>
          <!-- More Dropdown -->
          <Menu as="div" class="relative inline-block text-left">
            <MenuButton
              class="inline-flex justify-center w-full px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-md"
            >
              More
              <svg
                class="ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </MenuButton>
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems
                class="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              >
                <div class="py-1">
                  <div class="px-4 py-2 text-xs text-gray-400 uppercase tracking-wider">Images</div>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/pictures"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Pictures</RouterLink
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/available-images"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Available Images</RouterLink
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/image-uploads"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Image Uploads</RouterLink
                    >
                  </MenuItem>
                  <div class="border-t my-2" />
                  <div class="px-4 py-2 text-xs text-gray-400 uppercase tracking-wider">
                    Properties
                  </div>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/details"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Details</RouterLink
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/authors"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Authors</RouterLink
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/artists"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Artists</RouterLink
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/workshops"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Workshops</RouterLink
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/addresses"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Addresses</RouterLink
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/contacts"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Contacts</RouterLink
                    >
                  </MenuItem>
                  <div class="border-t my-2" />
                  <div class="px-4 py-2 text-xs text-gray-400 uppercase tracking-wider">Common</div>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/languages"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Languages</RouterLink
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/countries"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Countries</RouterLink
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/contexts"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >Contexts</RouterLink
                    >
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
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
  import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

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
