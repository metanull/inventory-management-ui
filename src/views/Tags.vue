<template>
  <div>
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Tags</h1>
        <p class="mt-2 text-sm text-gray-600">Manage item tags and categories</p>
      </div>
      <button
        class="btn-primary"
        @click="showCreateModal = true"
      >
        Add Tag
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-600 text-center py-8">
      {{ error }}
    </div>

    <div v-else-if="tags.length === 0" class="text-gray-500 text-center py-8">
      No tags found. Create your first tag to get started.
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="tag in tags" :key="tag.id">
          <div class="px-4 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span class="text-orange-600 font-medium text-sm">T</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ tag.internal_name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ tag.description }}
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <RouterLink
                  :to="`/tags/${tag.id}`"
                  class="text-primary-600 hover:text-primary-900 text-sm font-medium"
                >
                  View
                </RouterLink>
                <button
                  class="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  @click="editTag(tag)"
                >
                  Edit
                </button>
                <button
                  class="text-red-600 hover:text-red-900 text-sm font-medium"
                  @click.stop="deleteTag(tag.id)"
                >
                  Delete
                </button>
              </div>
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
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showCreateModal ? 'Create Tag' : 'Edit Tag' }}
          </h3>
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label class="label">Internal Name</label>
              <input
                v-model="form.internal_name"
                type="text"
                required
                class="input"
                placeholder="Enter tag name"
              />
            </div>
            
            <div>
              <label class="label">Description</label>
              <textarea
                v-model="form.description"
                class="input"
                rows="3"
                placeholder="Enter tag description"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                class="btn-outline"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="submitting"
              >
                {{ submitting ? 'Saving...' : (showCreateModal ? 'Create' : 'Update') }}
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
  import { apiClient, type TagResource } from '@/api/client'

  const loading = ref(false)
  const error = ref<string | null>(null)
  const submitting = ref(false)
  const tags = ref<TagResource[]>([])
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const editingTag = ref<TagResource | null>(null)

  const form = reactive({
    internal_name: '',
    description: '',
  })

  const fetchTags = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getTags()
      tags.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load tags'
    } finally {
      loading.value = false
    }
  }

  const handleSubmit = async () => {
    submitting.value = true

    try {
      if (showCreateModal.value) {
        await apiClient.createTag({
          internal_name: form.internal_name,
          description: form.description || '',
        })
      } else if (editingTag.value) {
        await apiClient.updateTag(editingTag.value.id, {
          internal_name: form.internal_name,
          description: form.description || '',
        })
      }
      
      await fetchTags()
      closeModal()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to save tag'
    } finally {
      submitting.value = false
    }
  }

  const editTag = (tag: TagResource) => {
    editingTag.value = tag
    form.internal_name = tag.internal_name
    form.description = tag.description || ''
    showEditModal.value = true
  }

  const deleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) {
      return
    }

    try {
      await apiClient.deleteTag(id)
      await fetchTags()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete tag'
    }
  }

  const closeModal = () => {
    showCreateModal.value = false
    showEditModal.value = false
    editingTag.value = null
    form.internal_name = ''
    form.description = ''
  }

  onMounted(() => {
    fetchTags()
  })
</script>
