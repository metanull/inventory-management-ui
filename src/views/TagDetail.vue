<template>
  <div>
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <RouterLink
            to="/tags"
            class="text-primary-600 hover:text-primary-900 text-sm font-medium mb-2 inline-flex items-center"
          >
            ← Back to Tags
          </RouterLink>
          <h1 class="text-3xl font-bold text-gray-900">Tag Details</h1>
        </div>
        <div class="flex space-x-3">
          <button class="btn-outline" @click="editTag">Edit Tag</button>
          <button
            class="text-red-600 hover:text-red-900 px-3 py-2 text-sm font-medium"
            @click="deleteTag"
          >
            Delete Tag
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-600 text-center py-8">
      {{ error }}
    </div>

    <div v-else-if="tag" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ tag.internal_name }}
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Tag information and details</p>
      </div>
      <div class="border-t border-gray-200">
        <dl>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Internal Name</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ tag.internal_name }}
            </dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Description</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ tag.description || 'No description provided' }}
            </dd>
          </div>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">ID</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
              {{ tag.id }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Tag</h3>
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
              <button type="button" class="btn-outline" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Saving...' : 'Update' }}
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
  import { useRoute, useRouter } from 'vue-router'
  import { apiClient, type TagResource } from '@/api/client'

  const route = useRoute()
  const router = useRouter()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const submitting = ref(false)
  const tag = ref<TagResource | null>(null)
  const showEditModal = ref(false)

  const form = reactive({
    internal_name: '',
    description: '',
  })

  const fetchTag = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getTag(route.params.id as string)
      tag.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load tag'
    } finally {
      loading.value = false
    }
  }

  const editTag = () => {
    if (tag.value) {
      form.internal_name = tag.value.internal_name
      form.description = tag.value.description || ''
      showEditModal.value = true
    }
  }

  const handleSubmit = async () => {
    if (!tag.value) return

    submitting.value = true

    try {
      const updateData: Partial<TagResource> = {
        internal_name: form.internal_name,
      }

      if (form.description.trim()) {
        updateData.description = form.description
      }

      await apiClient.updateTag(tag.value.id, updateData)

      await fetchTag()
      closeModal()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update tag'
    } finally {
      submitting.value = false
    }
  }

  const deleteTag = async () => {
    if (!tag.value) return

    if (!confirm('Are you sure you want to delete this tag?')) {
      return
    }

    try {
      await apiClient.deleteTag(tag.value.id)
      router.push('/tags')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete tag'
    }
  }

  const closeModal = () => {
    showEditModal.value = false
    form.internal_name = ''
    form.description = ''
  }

  onMounted(() => {
    fetchTag()
  })
</script>
