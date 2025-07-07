<template>
  <div>
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Items</h1>
        <p class="mt-2 text-sm text-gray-600">Manage your inventory items</p>
      </div>
      <button class="btn-primary" @click="showCreateModal = true">Add Item</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-600 text-center py-8">
      {{ error }}
    </div>

    <div v-else-if="items.length === 0" class="text-gray-500 text-center py-8">
      No items found. Create your first item to get started.
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="item in items" :key="item.id">
          <div class="px-4 py-4 flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary-600 font-medium text-sm">
                    {{ item.type === 'object' ? 'O' : 'M' }}
                  </span>
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ item.internal_name }}
                </div>
                <div class="text-sm text-gray-500">
                  Type: {{ item.type }} |
                  {{ item.partner ? `Partner: ${item.partner.internal_name}` : 'No partner' }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <RouterLink
                :to="`/items/${item.id}`"
                class="text-primary-600 hover:text-primary-900 text-sm font-medium"
              >
                View
              </RouterLink>
              <button
                class="text-gray-600 hover:text-gray-900 text-sm font-medium"
                @click="editItem(item)"
              >
                Edit
              </button>
              <button
                class="text-red-600 hover:text-red-900 text-sm font-medium"
                @click.stop="deleteItem(item.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showCreateModal ? 'Create Item' : 'Edit Item' }}
          </h3>
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label class="label">Internal Name</label>
              <input
                v-model="form.internal_name"
                type="text"
                required
                class="input"
                placeholder="Enter internal name"
              />
            </div>

            <div>
              <label class="label">Type</label>
              <select v-model="form.type" required class="input">
                <option value="">Select type</option>
                <option value="object">Object</option>
                <option value="monument">Monument</option>
              </select>
            </div>

            <div>
              <label class="label">Backward Compatibility (Optional)</label>
              <input
                v-model="form.backward_compatibility"
                type="text"
                class="input"
                placeholder="Enter backward compatibility ID"
              />
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" class="btn-outline" @click="closeModal">Cancel</button>
              <button type="submit" :disabled="submitting" class="btn-primary">
                {{ submitting ? 'Saving...' : showCreateModal ? 'Create' : 'Update' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { RouterLink } from 'vue-router'
  import { apiClient, type ItemResource } from '@/api/client'

  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)
  const items = ref<ItemResource[]>([])
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const editingItem = ref<ItemResource | null>(null)

  const form = reactive({
    internal_name: '',
    type: '' as string,
    backward_compatibility: '',
  })

  const fetchItems = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getItems()
      items.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load items'
    } finally {
      loading.value = false
    }
  }

  const handleSubmit = async () => {
    submitting.value = true

    try {
      if (showCreateModal.value) {
        await apiClient.createItem({
          internal_name: form.internal_name,
          type: form.type as 'object' | 'monument',
          backward_compatibility: form.backward_compatibility || null,
        })
      } else if (editingItem.value) {
        await apiClient.updateItem(editingItem.value.id, {
          internal_name: form.internal_name,
          type: form.type as 'object' | 'monument',
          backward_compatibility: form.backward_compatibility || null,
        })
      }

      await fetchItems()
      closeModal()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to save item'
    } finally {
      submitting.value = false
    }
  }

  const editItem = (item: ItemResource) => {
    editingItem.value = item
    form.internal_name = item.internal_name
    form.type = item.type
    form.backward_compatibility = item.backward_compatibility || ''
    showEditModal.value = true
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      await apiClient.deleteItem(id)
      await fetchItems()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete item'
    }
  }

  const closeModal = () => {
    showCreateModal.value = false
    showEditModal.value = false
    editingItem.value = null
    form.internal_name = ''
    form.type = ''
    form.backward_compatibility = ''
  }

  onMounted(() => {
    fetchItems()
  })
</script>
