<template>
  <div>
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Partners</h1>
        <p class="mt-2 text-sm text-gray-600">Manage partner organizations</p>
      </div>
      <button class="btn-primary" @click="showCreateModal = true">Add Partner</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-600 text-center py-8">
      {{ error }}
    </div>

    <div v-else-if="partners.length === 0" class="text-gray-500 text-center py-8">
      No partners found. Create your first partner to get started.
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="partner in partners" :key="partner.id">
          <div class="px-4 py-4 flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-600 font-medium text-sm">
                    {{ partner.type.charAt(0).toUpperCase() }}
                  </span>
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ partner.internal_name }}
                </div>
                <div class="text-sm text-gray-500">
                  Type: {{ partner.type }}
                  {{ partner.country ? ` | Country: ${partner.country.internal_name}` : '' }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <RouterLink
                :to="`/partners/${partner.id}`"
                class="text-primary-600 hover:text-primary-900 text-sm font-medium"
              >
                View
              </RouterLink>
              <button
                class="text-gray-600 hover:text-gray-900 text-sm font-medium"
                @click="editPartner(partner)"
              >
                Edit
              </button>
              <button
                class="text-red-600 hover:text-red-900 text-sm font-medium"
                @click.stop="deletePartner(partner.id)"
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
            {{ showCreateModal ? 'Create Partner' : 'Edit Partner' }}
          </h3>
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label class="label">Internal Name</label>
              <input
                v-model="form.internal_name"
                type="text"
                required
                class="input"
                placeholder="Enter partner name"
              />
            </div>

            <div>
              <label class="label">Type</label>
              <select v-model="form.type" required class="input">
                <option value="">Select type</option>
                <option value="museum">Museum</option>
                <option value="institution">Institution</option>
                <option value="individual">Individual</option>
              </select>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" class="btn-outline" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
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
  import { apiClient, type PartnerResource } from '@/api/client'

  const loading = ref(false)
  const error = ref<string | null>(null)
  const submitting = ref(false)
  const partners = ref<PartnerResource[]>([])
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const editingPartner = ref<PartnerResource | null>(null)

  const form = reactive({
    internal_name: '',
    type: '' as string,
  })

  const fetchPartners = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getPartners()
      partners.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load partners'
    } finally {
      loading.value = false
    }
  }

  const handleSubmit = async () => {
    submitting.value = true

    try {
      if (showCreateModal.value) {
        await apiClient.createPartner({
          internal_name: form.internal_name,
          type: form.type as 'museum' | 'institution' | 'individual',
        })
      } else if (editingPartner.value) {
        await apiClient.updatePartner(editingPartner.value.id, {
          internal_name: form.internal_name,
          type: form.type as 'museum' | 'institution' | 'individual',
        })
      }

      await fetchPartners()
      closeModal()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to save partner'
    } finally {
      submitting.value = false
    }
  }

  const editPartner = (partner: PartnerResource) => {
    editingPartner.value = partner
    form.internal_name = partner.internal_name
    form.type = partner.type
    showEditModal.value = true
  }

  const deletePartner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) {
      return
    }

    try {
      await apiClient.deletePartner(id)
      await fetchPartners()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete partner'
    }
  }

  const closeModal = () => {
    showCreateModal.value = false
    showEditModal.value = false
    editingPartner.value = null
    form.internal_name = ''
    form.type = ''
  }

  onMounted(() => {
    fetchPartners()
  })
</script>
