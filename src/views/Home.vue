<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-sm text-gray-600">
        Welcome to the Inventory Management System
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">I</span>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-500">Total Items</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.items || 0 }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">P</span>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-500">Total Partners</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.partners || 0 }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">R</span>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-500">Active Projects</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.projects || 0 }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">T</span>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-500">Total Tags</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.tags || 0 }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Items</h2>
        <div v-if="loading" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
        <div v-else-if="error" class="text-red-600 text-center py-4">
          {{ error }}
        </div>
        <div v-else-if="recentItems.length === 0" class="text-gray-500 text-center py-4">
          No items found
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="item in recentItems"
            :key="item.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="font-medium text-gray-900">{{ item.internal_name }}</div>
              <div class="text-sm text-gray-500">Type: {{ item.type }}</div>
            </div>
            <RouterLink
              :to="`/items/${item.id}`"
              class="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div class="space-y-3">
          <RouterLink
            to="/items"
            class="block w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <div class="font-medium text-primary-900">Manage Items</div>
            <div class="text-sm text-primary-600">View and edit inventory items</div>
          </RouterLink>
          <RouterLink
            to="/partners"
            class="block w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div class="font-medium text-green-900">Manage Partners</div>
            <div class="text-sm text-green-600">View and edit partner organizations</div>
          </RouterLink>
          <RouterLink
            to="/projects"
            class="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div class="font-medium text-purple-900">Manage Projects</div>
            <div class="text-sm text-purple-600">View and edit active projects</div>
          </RouterLink>
          <RouterLink
            to="/tags"
            class="block w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <div class="font-medium text-orange-900">Manage Tags</div>
            <div class="text-sm text-orange-600">View and edit item tags</div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { RouterLink } from 'vue-router'
  import { apiClient, type ItemResource } from '@/api/client'

  const loading = ref(false)
  const error = ref<string | null>(null)
  const recentItems = ref<ItemResource[]>([])
  const stats = ref({
    items: 0,
    partners: 0,
    projects: 0,
    tags: 0,
  })

  const fetchDashboardData = async () => {
    loading.value = true
    error.value = null

    try {
      const [itemsResponse, partnersResponse, projectsResponse, tagsResponse] = await Promise.all([
        apiClient.getItems(),
        apiClient.getPartners(),
        apiClient.getEnabledProjects(),
        apiClient.getTags(),
      ])

      stats.value = {
        items: itemsResponse.data.length,
        partners: partnersResponse.data.length,
        projects: projectsResponse.data.length,
        tags: tagsResponse.data.length,
      }

      // Show most recent 5 items
      recentItems.value = itemsResponse.data.slice(0, 5)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load dashboard data'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchDashboardData()
  })
</script>
