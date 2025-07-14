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

          <!-- Reference Data Dropdown -->
          <div class="relative" @mouseleave="closeDropdown">
            <button
              class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
              @mouseenter="openDropdown"
              @click="toggleDropdown"
            >
              Reference Data
              <svg
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': isDropdownOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            <div
              v-if="isDropdownOpen"
              class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
              @mouseenter="keepDropdownOpen"
              @mouseleave="closeDropdown"
            >
              <RouterLink
                to="/languages"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeDropdown"
              >
                Languages
              </RouterLink>
              <RouterLink
                to="/countries"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeDropdown"
              >
                Countries
              </RouterLink>
              <RouterLink
                to="/contexts"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeDropdown"
              >
                Contexts
              </RouterLink>
              <RouterLink
                to="/projects"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeDropdown"
              >
                Projects
              </RouterLink>
            </div>
          </div>
        </nav>

        <!-- Desktop Actions -->
        <div class="hidden md:flex items-center space-x-4">
          <button
            v-if="authStore.isAuthenticated"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            class="text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2"
            @click="toggleMobileMenu"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                v-if="!isMobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="isMobileMenuOpen" class="md:hidden border-t border-gray-200 py-4">
        <div class="flex flex-col space-y-2">
          <RouterLink
            to="/"
            class="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            @click="closeMobileMenu"
          >
            Dashboard
          </RouterLink>

          <!-- Mobile Reference Data Section -->
          <div class="px-3">
            <button
              class="text-gray-500 hover:text-gray-900 w-full text-left py-2 text-base font-medium flex items-center justify-between"
              @click="toggleMobileDropdown"
            >
              Reference Data
              <svg
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': isMobileDropdownOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            <div v-if="isMobileDropdownOpen" class="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
              <RouterLink
                to="/languages"
                class="text-gray-500 hover:text-gray-900 block py-2 text-sm"
                @click="closeMobileMenu"
              >
                Languages
              </RouterLink>
              <RouterLink
                to="/countries"
                class="text-gray-500 hover:text-gray-900 block py-2 text-sm"
                @click="closeMobileMenu"
              >
                Countries
              </RouterLink>
              <RouterLink
                to="/contexts"
                class="text-gray-500 hover:text-gray-900 block py-2 text-sm"
                @click="closeMobileMenu"
              >
                Contexts
              </RouterLink>
              <RouterLink
                to="/projects"
                class="text-gray-500 hover:text-gray-900 block py-2 text-sm"
                @click="closeMobileMenu"
              >
                Projects
              </RouterLink>
            </div>
          </div>

          <!-- Mobile Logout -->
          <button
            v-if="authStore.isAuthenticated"
            class="text-gray-500 hover:text-gray-900 text-left px-3 py-2 rounded-md text-base font-medium"
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
  import { ref } from 'vue'
  import { RouterLink, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()
  const appTitle = import.meta.env.VITE_APP_TITLE

  // Desktop dropdown state
  const isDropdownOpen = ref(false)
  let dropdownTimeout: ReturnType<typeof setTimeout> | null = null

  // Mobile menu state
  const isMobileMenuOpen = ref(false)
  const isMobileDropdownOpen = ref(false)

  // Desktop dropdown functions
  const openDropdown = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout)
      dropdownTimeout = null
    }
    isDropdownOpen.value = true
  }

  const closeDropdown = () => {
    dropdownTimeout = setTimeout(() => {
      isDropdownOpen.value = false
    }, 150) // Small delay to allow mouse movement between elements
  }

  const keepDropdownOpen = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout)
      dropdownTimeout = null
    }
  }

  const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
  }

  // Mobile menu functions
  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
    if (!isMobileMenuOpen.value) {
      isMobileDropdownOpen.value = false
    }
  }

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
    isMobileDropdownOpen.value = false
  }

  const toggleMobileDropdown = () => {
    isMobileDropdownOpen.value = !isMobileDropdownOpen.value
  }

  const handleLogout = async () => {
    await authStore.logout()
    router.push('/login')
  }
</script>

<style scoped>
  .router-link-active {
    @apply text-blue-600 font-semibold;
  }
</style>
