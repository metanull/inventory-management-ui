<template>
  <div>
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <RouterLink
            to="/pictures"
            class="text-primary-600 hover:text-primary-900 text-sm font-medium mb-2 inline-flex items-center"
          >
            ← Back to Pictures
          </RouterLink>
          <h1 class="text-3xl font-bold text-gray-900">Picture Details</h1>
        </div>
        <div class="flex space-x-3">
          <button class="btn-outline" @click="editPicture">Edit Picture</button>
          <button
            class="text-red-600 hover:text-red-900 px-3 py-2 text-sm font-medium"
            @click="deletePicture"
          >
            Delete Picture
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

    <div v-else-if="picture" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ picture.internal_name }}
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Picture information and details</p>
      </div>

      <!-- Picture Preview -->
      <div v-if="picture.path" class="px-4 py-5 sm:px-6">
        <img
          :src="picture.path"
          :alt="picture.internal_name"
          class="max-w-md max-h-96 object-contain rounded-lg shadow-sm"
          @error="handleImageError"
        />
      </div>

      <div class="border-t border-gray-200">
        <dl>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Internal Name</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ picture.internal_name }}
            </dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Upload Name</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ picture.upload_name || 'Not specified' }}
            </dd>
          </div>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">File Path</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
              {{ picture.path || 'Not specified' }}
            </dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Copyright</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ picture.copyright_text || 'Not specified' }}
            </dd>
          </div>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">File Size</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ picture.upload_size ? formatFileSize(picture.upload_size) : 'Not specified' }}
            </dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">ID</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
              {{ picture.id }}
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
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Picture</h3>
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label class="label">Internal Name</label>
              <input
                v-model="form.internal_name"
                type="text"
                required
                class="input"
                placeholder="Enter picture name"
              />
            </div>

            <div>
              <label class="label">Upload Name</label>
              <input
                v-model="form.upload_name"
                type="text"
                class="input"
                placeholder="Original file name"
              />
            </div>

            <div>
              <label class="label">File Path</label>
              <input
                v-model="form.path"
                type="text"
                class="input"
                placeholder="Image file path or URL"
              />
            </div>

            <div>
              <label class="label">Copyright Text</label>
              <input
                v-model="form.copyright_text"
                type="text"
                class="input"
                placeholder="Copyright information"
              />
            </div>

            <div>
              <label class="label">Upload Size (bytes)</label>
              <input
                v-model.number="form.upload_size"
                type="number"
                class="input"
                placeholder="File size in bytes"
              />
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
  import { apiClient, type PictureResource } from '@/api/client'

  const route = useRoute()
  const router = useRouter()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const submitting = ref(false)
  const picture = ref<PictureResource | null>(null)
  const showEditModal = ref(false)

  const form = reactive({
    internal_name: '',
    upload_name: '',
    path: '',
    copyright_text: '',
    upload_size: 0,
  })

  const fetchPicture = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getPicture(route.params.id as string)
      picture.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load picture'
    } finally {
      loading.value = false
    }
  }

  const editPicture = () => {
    if (picture.value) {
      form.internal_name = picture.value.internal_name
      form.upload_name = picture.value.upload_name || ''
      form.path = picture.value.path || ''
      form.copyright_text = picture.value.copyright_text || ''
      form.upload_size = picture.value.upload_size || 0
      showEditModal.value = true
    }
  }

  const handleSubmit = async () => {
    if (!picture.value) return

    submitting.value = true

    try {
      const pictureData = {
        internal_name: form.internal_name,
        upload_name: form.upload_name || null,
        path: form.path || null,
        copyright_text: form.copyright_text || null,
        upload_size: form.upload_size || null,
      }

      await apiClient.updatePicture(picture.value.id, pictureData)

      await fetchPicture()
      closeModal()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update picture'
    } finally {
      submitting.value = false
    }
  }

  const deletePicture = async () => {
    if (!picture.value) return

    if (!confirm('Are you sure you want to delete this picture?')) {
      return
    }

    try {
      await apiClient.deletePicture(picture.value.id)
      router.push('/pictures')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete picture'
    }
  }

  const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent) {
      parent.innerHTML =
        '<div class="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center"><span class="text-gray-400">Image not found</span></div>'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const closeModal = () => {
    showEditModal.value = false
    form.internal_name = ''
    form.upload_name = ''
    form.path = ''
    form.copyright_text = ''
    form.upload_size = 0
  }

  onMounted(() => {
    fetchPicture()
  })
</script>
