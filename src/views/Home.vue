<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-sm text-gray-600">Welcome to the Inventory Management System</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Languages Management Card -->
      <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <div class="flex items-center mb-4">
          <svg
            class="h-8 w-8 text-blue-600 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            ></path>
          </svg>
          <h2 class="text-xl font-semibold text-gray-900">Languages</h2>
        </div>
        <p class="text-gray-600 mb-4">Manage system languages and localization settings</p>
        <router-link
          to="/languages"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Manage Languages
          <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </router-link>
      </div>

      <!-- System Status Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-4">
          <svg
            class="h-8 w-8 text-green-600 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 class="text-xl font-semibold text-gray-900">System Status</h2>
        </div>
        <p class="text-gray-600 mb-4">
          You are successfully authenticated and connected to the system.
        </p>
        <div
          class="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"
        >
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            ></path>
          </svg>
          Connected
        </div>
      </div>

      <!-- More Features Coming Soon Card -->
      <div class="bg-gray-50 rounded-lg shadow-md p-6">
        <div class="flex items-center mb-4">
          <svg
            class="h-8 w-8 text-gray-400 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
            ></path>
          </svg>
          <h2 class="text-xl font-semibold text-gray-500">More Features</h2>
        </div>
        <p class="text-gray-500 mb-4">
          Additional inventory management features will be implemented in future iterations.
        </p>
        <div
          class="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-600 text-sm font-medium rounded-full"
        >
          Coming Soon
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // Empty for now - will be populated with features later
</script>
