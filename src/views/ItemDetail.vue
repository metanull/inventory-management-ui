<template>
  <div v-if="loading" class="text-center py-8">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
  </div>

  <div v-else-if="error" class="text-red-600 text-center py-8">
    {{ error }}
  </div>

  <div v-else-if="item">
    <div class="mb-8">
      <RouterLink to="/items" class="text-primary-600 hover:text-primary-800 text-sm font-medium">
        ← Back to Items
      </RouterLink>
      <h1 class="mt-2 text-3xl font-bold text-gray-900">{{ item.internal_name }}</h1>
      <p class="mt-2 text-sm text-gray-600">Item Details</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="card">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Internal Name</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ item.internal_name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Type</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="
                    item.type === 'object'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  "
                >
                  {{ item.type }}
                </span>
              </dd>
            </div>
            <div v-if="item.backward_compatibility">
              <dt class="text-sm font-medium text-gray-500">Legacy ID</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ item.backward_compatibility }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Created</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A' }}
              </dd>
            </div>
          </dl>
        </div>

        <div v-if="item.partner" class="card mt-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Partner Information</h2>
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Partner Name</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ item.partner.internal_name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Partner Type</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ item.partner.type }}</dd>
            </div>
            <div v-if="item.partner.country">
              <dt class="text-sm font-medium text-gray-500">Country</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ item.partner.country.internal_name }}</dd>
            </div>
          </dl>
        </div>

        <div v-if="item.project" class="card mt-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Project Information</h2>
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Project Name</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ item.project.internal_name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Status</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="
                    item.project.is_enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                >
                  {{ item.project.is_enabled ? 'Active' : 'Inactive' }}
                </span>
              </dd>
            </div>
            <div v-if="item.project.launch_date">
              <dt class="text-sm font-medium text-gray-500">Launch Date</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ new Date(item.project.launch_date).toLocaleDateString() }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <div class="card">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Actions</h2>
          <div class="space-y-3">
            <button class="block w-full text-center btn-primary" @click="editItem">
              Edit Item
            </button>
            <button
              class="block w-full text-center btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              @click="deleteItem"
            >
              Delete Item
            </button>
          </div>
        </div>

        <div class="card mt-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium text-gray-900">Tags</h2>
            <button class="btn-outline text-sm" @click="showTagModal = true">Manage Tags</button>
          </div>
          <div v-if="tags.length === 0" class="text-gray-500 text-sm">No tags assigned</div>
          <div v-else class="flex flex-wrap gap-2">
            <span
              v-for="tag in tags"
              :key="tag.id"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {{ tag.internal_name }}
              <button
                class="ml-1 h-4 w-4 rounded-full hover:bg-gray-200 flex items-center justify-center"
                title="Remove tag"
                @click="removeTag(tag.id)"
              >
                <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tag Management Modal -->
    <div
      v-if="showTagModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeTagModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-96 overflow-y-auto"
        @click.stop
      >
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Manage Tags</h3>

          <div class="mb-4">
            <label class="label">Add Tag</label>
            <select v-model="selectedTagId" class="input">
              <option value="">Select a tag to add</option>
              <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">
                {{ tag.internal_name }}
              </option>
            </select>
            <button
              class="btn-primary mt-2 w-full"
              :disabled="!selectedTagId || addingTag"
              @click="addTag"
            >
              {{ addingTag ? 'Adding...' : 'Add Tag' }}
            </button>
          </div>

          <div v-if="tags.length > 0" class="mb-4">
            <label class="label">Current Tags</label>
            <div class="space-y-2">
              <div
                v-for="tag in tags"
                :key="tag.id"
                class="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span class="text-sm text-gray-900">{{ tag.internal_name }}</span>
                <button
                  class="text-red-600 hover:text-red-800 text-sm"
                  :disabled="removingTagId === tag.id"
                  @click="removeTag(tag.id)"
                >
                  {{ removingTagId === tag.id ? 'Removing...' : 'Remove' }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="button" class="btn-outline" @click="closeTagModal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter, RouterLink } from 'vue-router'
  import { apiClient, type ItemResource, type TagResource } from '@/api/client'

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const item = ref<ItemResource | null>(null)
  const tags = ref<TagResource[]>([])
  const allTags = ref<TagResource[]>([])
  const showTagModal = ref(false)
  const selectedTagId = ref('')
  const addingTag = ref(false)
  const removingTagId = ref<string | null>(null)

  // Available tags are those not already assigned to the item
  const availableTags = computed(() => {
    return allTags.value.filter(
      (tag: TagResource) => !tags.value.some((itemTag: TagResource) => itemTag.id === tag.id)
    )
  })

  const fetchItem = async () => {
    loading.value = true
    error.value = null

    try {
      const itemId = route.params.id as string
      const response = await apiClient.getItem(itemId)
      item.value = response.data

      // Fetch tags for this item
      await fetchItemTags()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load item'
    } finally {
      loading.value = false
    }
  }

  const fetchItemTags = async () => {
    try {
      const itemId = route.params.id as string
      const response = await apiClient.getItemTags(itemId)
      tags.value = response.data
    } catch (err: any) {
      // If item has tags in the response, use those instead
      if (item.value?.tags) {
        tags.value = item.value.tags
      } else {
        console.warn('Failed to fetch item tags:', err.response?.data?.message)
      }
    }
  }

  const fetchAllTags = async () => {
    try {
      const response = await apiClient.getTags()
      allTags.value = response.data
    } catch (err: any) {
      console.warn('Failed to fetch all tags:', err.response?.data?.message)
    }
  }

  const addTag = async () => {
    if (!selectedTagId.value || !item.value) return

    addingTag.value = true
    try {
      await apiClient.addTagToItem(item.value.id, selectedTagId.value)

      // Add the tag to the local list
      const tagToAdd = allTags.value.find((tag: TagResource) => tag.id === selectedTagId.value)
      if (tagToAdd) {
        tags.value.push(tagToAdd)
      }

      selectedTagId.value = ''
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add tag'
    } finally {
      addingTag.value = false
    }
  }

  const removeTag = async (tagId: string) => {
    if (!item.value) return

    removingTagId.value = tagId
    try {
      await apiClient.removeTagFromItem(item.value.id, tagId)

      // Remove the tag from the local list
      tags.value = tags.value.filter((tag: TagResource) => tag.id !== tagId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove tag'
    } finally {
      removingTagId.value = null
    }
  }

  const closeTagModal = () => {
    showTagModal.value = false
    selectedTagId.value = ''
    error.value = null
  }

  const deleteItem = async () => {
    if (!item.value || !confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      await apiClient.deleteItem(item.value.id)
      router.push('/items')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete item'
    }
  }

  const editItem = () => {
    // For now, redirect to items page where user can edit via the existing modal
    router.push('/items')
  }

  onMounted(async () => {
    await fetchItem()
    await fetchAllTags()
  })
</script>
