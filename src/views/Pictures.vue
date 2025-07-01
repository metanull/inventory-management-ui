<template>
  <div>
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Pictures</h1>
        <p class="mt-2 text-sm text-gray-600">Manage item pictures and images</p>
      </div>
      <button
        class="btn-primary"
        @click="showCreateModal = true"
      >
        Add Picture
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-600 text-center py-8">
      {{ error }}
    </div>

    <div v-else-if="pictures.length === 0" class="text-gray-500 text-center py-8">
      No pictures found. Add your first picture to get started.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="picture in pictures" :key="picture.id" class="card">
        <div class="aspect-w-16 aspect-h-9 mb-4">
          <div
            v-if="!picture.path"
            class="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center"
          >
            <span class="text-gray-400">No Image</span>
          </div>
          <img
            v-else
            :src="picture.path"
            :alt="picture.internal_name"
            class="w-full h-32 object-cover rounded-lg"
            @error="handleImageError"
          />
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-1">
            {{ picture.internal_name }}
          </h3>
          
          <div class="text-xs text-gray-500 space-y-1">
            <div v-if="picture.upload_name">
              Original: {{ picture.upload_name }}
            </div>
            <div v-if="picture.upload_size">
              Size: {{ formatFileSize(picture.upload_size) }}
            </div>
            <div v-if="picture.copyright_text">
              © {{ picture.copyright_text }}
            </div>
          </div>

          <div class="flex items-center space-x-2 mt-3">
            <button
              class="text-gray-600 hover:text-gray-900 text-xs font-medium"
              @click="editPicture(picture)"
            >
              Edit
            </button>
            <button
              class="text-red-600 hover:text-red-900 text-xs font-medium"
              @click.stop="deletePicture(picture.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
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
            {{ showCreateModal ? 'Add Picture' : 'Edit Picture' }}
          </h3>
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
                {{ submitting ? 'Saving...' : (showCreateModal ? 'Add' : 'Update') }}
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
  import { apiClient, type PictureResource } from '@/api/client'

  const loading = ref(false)
  const error = ref<string | null>(null)
  const submitting = ref(false)
  const pictures = ref<PictureResource[]>([])
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const editingPicture = ref<PictureResource | null>(null)

  const form = reactive({
    internal_name: '',
    upload_name: '',
    path: '',
    backward_compatibility: '',
    copyright_text: '',
    copyright_url: '',
    upload_size: 0,
  })

  const fetchPictures = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getPictures()
      pictures.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load pictures'
    } finally {
      loading.value = false
    }
  }

  const handleSubmit = async () => {
    submitting.value = true

    try {
      if (showCreateModal.value) {
        // For creating pictures, we need FormData
        const formData = new FormData()
        formData.append('internal_name', form.internal_name)
        if (form.upload_name) formData.append('upload_name', form.upload_name)
        if (form.path) formData.append('path', form.path)
        if (form.copyright_text) formData.append('copyright_text', form.copyright_text)
        if (form.upload_size) formData.append('upload_size', form.upload_size.toString())
        
        await apiClient.createPicture(formData)
      } else if (editingPicture.value) {
        // For updating pictures, only send allowed fields according to API spec
        const pictureData = {
          internal_name: form.internal_name,
          backward_compatibility: form.backward_compatibility || null,
          copyright_text: form.copyright_text || null,
          copyright_url: form.copyright_url || null,
        }
        await apiClient.updatePicture(editingPicture.value.id, pictureData)
      }
      
      await fetchPictures()
      closeModal()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to save picture'
    } finally {
      submitting.value = false
    }
  }

  const editPicture = (picture: PictureResource) => {
    editingPicture.value = picture
    form.internal_name = picture.internal_name
    form.upload_name = picture.upload_name || ''
    form.path = picture.path || ''
    form.backward_compatibility = picture.backward_compatibility || ''
    form.copyright_text = picture.copyright_text || ''
    form.copyright_url = picture.copyright_url || ''
    form.upload_size = picture.upload_size || 0
    showEditModal.value = true
  }

  const deletePicture = async (id: string) => {
    if (!confirm('Are you sure you want to delete this picture?')) {
      return
    }

    try {
      await apiClient.deletePicture(id)
      await fetchPictures()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete picture'
    }
  }

  const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent) {
      parent.innerHTML = '<div class="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center"><span class="text-gray-400">Image not found</span></div>'
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
    showCreateModal.value = false
    showEditModal.value = false
    editingPicture.value = null
    form.internal_name = ''
    form.upload_name = ''
    form.path = ''
    form.copyright_text = ''
    form.upload_size = 0
  }

  onMounted(() => {
    fetchPictures()
  })
</script>
