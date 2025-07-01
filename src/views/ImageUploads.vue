<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Image Uploads</h1>
        <p class="mt-2 text-sm text-gray-700">Upload and manage image files.</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          type="button"
          class="btn btn-primary"
          data-testid="add-image-upload"
          @click="showUploadModal = true"
        >
          Upload Image
        </button>
      </div>
    </div>

    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Extension
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Size
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    MIME Type
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Uploaded
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="upload in uploads" :key="upload.id">
                  <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {{ upload.name || 'Unnamed' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {{ upload.extension || 'N/A' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {{ formatFileSize(upload.size) }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {{ upload.mime_type || 'N/A' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {{ formatDate(upload.created_at) }}
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      class="text-indigo-600 hover:text-indigo-900 mr-4"
                      @click="viewUpload(upload.id)"
                    >
                      View
                    </button>
                    <button
                      class="text-red-600 hover:text-red-900"
                      data-testid="delete-image-upload"
                      @click="deleteUploadConfirm(upload)"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" data-testid="create-image-upload-modal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Upload Image</h3>
          <form @submit.prevent="uploadFile">
            <div class="mb-4">
              <label for="file" class="label">Select File</label>
              <input
                id="file"
                ref="fileInput"
                type="file"
                accept="image/*"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
                @change="handleFileSelect"
              />
              <p class="mt-1 text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF, WebP. Max size: 10MB
              </p>
            </div>

            <!-- File Preview -->
            <div v-if="previewUrl" class="mb-4">
              <label class="label">Preview</label>
              <div class="mt-1 border rounded-lg p-4 bg-gray-50">
                <img 
                  :src="previewUrl" 
                  :alt="selectedFile?.name || 'Preview'"
                  class="max-w-full h-48 object-contain mx-auto rounded"
                />
                <div class="mt-2 text-sm text-gray-600 text-center">
                  <p><strong>Name:</strong> {{ selectedFile?.name }}</p>
                  <p><strong>Size:</strong> {{ formatFileSize(selectedFile?.size || 0) }}</p>
                  <p><strong>Type:</strong> {{ selectedFile?.type }}</p>
                </div>
              </div>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mb-4">
              <label class="label">Upload Progress</label>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  :style="`width: ${uploadProgress}%`"
                ></div>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ uploadProgress }}% uploaded</p>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                class="btn btn-outline"
                @click="closeUploadModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="uploading"
                class="btn btn-primary"
              >
                {{ uploading ? 'Uploading...' : 'Upload' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
          <p class="text-sm text-gray-500 mb-4">
            Are you sure you want to delete "{{ uploadToDelete?.name }}"? This action cannot be undone.
          </p>
          <div class="flex justify-center space-x-3">
            <button
              class="btn btn-outline"
              @click="showDeleteModal = false"
            >
              Cancel
            </button>
            <button
              :disabled="loading"
              class="btn bg-red-600 hover:bg-red-700 text-white"
              @click="deleteUpload()"
            >
              {{ loading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient, type ImageUploadResource } from '@/api/client'

const router = useRouter()

const uploads = ref<ImageUploadResource[]>([])
const loading = ref(false)
const uploading = ref(false)
const showUploadModal = ref(false)
const showDeleteModal = ref(false)
const uploadToDelete = ref<ImageUploadResource | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const uploadProgress = ref(0)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, GIF, or WebP)')
      target.value = ''
      return
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      target.value = ''
      return
    }
    
    selectedFile.value = file
    
    // Create preview URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = URL.createObjectURL(file)
  } else {
    selectedFile.value = null
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
  selectedFile.value = null
  uploadProgress.value = 0
  
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const fetchUploads = async () => {
  try {
    loading.value = true
    const response = await apiClient.getImageUploads()
    uploads.value = response.data
  } catch (error) {
    console.error('Error fetching uploads:', error)
  } finally {
    loading.value = false
  }
}

const viewUpload = (id: string) => {
  router.push(`/image-uploads/${id}`)
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    uploading.value = true
    uploadProgress.value = 0
    
    // Simulate upload progress for demo (replace with actual progress if API supports it)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 10
      }
    }, 100)

    await apiClient.createImageUpload(formData)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // Small delay to show 100% progress
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await fetchUploads()
    closeUploadModal()
  } catch (error) {
    console.error('Error uploading file:', error)
    alert('Error uploading file. Please try again.')
  } finally {
    uploading.value = false
  }
}

const deleteUploadConfirm = (upload: ImageUploadResource) => {
  uploadToDelete.value = upload
  showDeleteModal.value = true
}

const deleteUpload = async () => {
  if (!uploadToDelete.value) return
  
  try {
    loading.value = true
    await apiClient.deleteImageUpload(uploadToDelete.value.id)
    await fetchUploads()
    showDeleteModal.value = false
    uploadToDelete.value = null
  } catch (error) {
    console.error('Error deleting upload:', error)
  } finally {
    loading.value = false
  }
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'N/A'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchUploads()
})
</script>
