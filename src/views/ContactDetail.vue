<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <router-link
          to="/contacts"
          class="text-blue-600 hover:text-blue-800"
          title="Back to Contacts"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </router-link>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditing ? 'Edit Contact' : isCreating ? 'Create Contact' : 'Contact Details' }}
        </h1>
      </div>
      <div v-if="!isCreating && !isEditing" class="flex space-x-2">
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          @click="startEditing"
        >
          Edit
        </button>
        <button
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          @click="deleteContact"
        >
          Delete
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading...</p>
    </div>

    <!-- Error State -->
    <ErrorDisplay v-else-if="error" :error="error" @retry="fetchContact" />

    <!-- Form -->
    <div v-else-if="isEditing || isCreating" class="bg-white p-6 rounded-lg shadow">
      <form class="space-y-4" @submit.prevent="saveContact">
        <div>
          <label for="internal_name" class="block text-sm font-medium text-gray-700"
            >Internal Name *</label
          >
          <input
            id="internal_name"
            v-model="form.internal_name"
            type="text"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="phone_number" class="block text-sm font-medium text-gray-700"
            >Phone Number</label
          >
          <input
            id="phone_number"
            v-model="form.phone_number"
            type="tel"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="fax_number" class="block text-sm font-medium text-gray-700">Fax Number</label>
          <input
            id="fax_number"
            v-model="form.fax_number"
            type="tel"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="flex justify-end space-x-4">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            @click="cancelEditing"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>

    <!-- View Mode -->
    <div v-else class="bg-white p-6 rounded-lg shadow space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-500">Internal Name</label>
          <p class="mt-1 text-sm text-gray-900">{{ contact?.internal_name }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Email</label>
          <p class="mt-1 text-sm text-gray-900">
            <a
              v-if="contact?.email"
              :href="`mailto:${contact.email}`"
              class="text-blue-600 hover:underline"
            >
              {{ contact.email }}
            </a>
            <span v-else>N/A</span>
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Phone Number</label>
          <p class="mt-1 text-sm text-gray-900">
            {{ contact?.formatted_phone_number || contact?.phone_number || 'N/A' }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Fax Number</label>
          <p class="mt-1 text-sm text-gray-900">
            {{ contact?.formatted_fax_number || contact?.fax_number || 'N/A' }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Created</label>
          <p class="mt-1 text-sm text-gray-900">{{ formatDate(contact?.created_at) }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Updated</label>
          <p class="mt-1 text-sm text-gray-900">{{ formatDate(contact?.updated_at) }}</p>
        </div>
      </div>

      <!-- Translations -->
      <div v-if="contact?.translations && contact.translations.length > 0">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Translations</h3>
        <div class="space-y-4">
          <div
            v-for="translation in contact.translations"
            :key="translation.id"
            class="border rounded-lg p-4"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-500">Language ID</label>
                <p class="mt-1 text-sm text-gray-900">{{ translation.language_id }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500">Label</label>
                <p class="mt-1 text-sm text-gray-900">{{ translation.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { apiClient, type ContactResource } from '@/api/client'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'

  const route = useRoute()
  const router = useRouter()

  const contact = ref<ContactResource | null>(null)
  const loading = ref(true)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const isEditing = ref(false)

  const contactId = computed(() => route.params.id as string)
  const isCreating = computed(() => route.name === 'contact-create')

  const form = ref({
    internal_name: '',
    email: '',
    phone_number: '',
    fax_number: '',
  })

  const fetchContact = async () => {
    if (isCreating.value) {
      loading.value = false
      return
    }

    try {
      loading.value = true
      error.value = null
      const response = await apiClient.getContact(contactId.value)
      contact.value = response.data
      form.value = {
        internal_name: response.data.internal_name,
        email: response.data.email || '',
        phone_number: response.data.phone_number || '',
        fax_number: response.data.fax_number || '',
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch contact'
    } finally {
      loading.value = false
    }
  }

  const startEditing = () => {
    isEditing.value = true
  }

  const cancelEditing = () => {
    if (isCreating.value) {
      router.push('/contacts')
    } else {
      isEditing.value = false
      if (contact.value) {
        form.value = {
          internal_name: contact.value.internal_name,
          email: contact.value.email || '',
          phone_number: contact.value.phone_number || '',
          fax_number: contact.value.fax_number || '',
        }
      }
    }
  }

  const saveContact = async () => {
    try {
      saving.value = true
      error.value = null

      if (isCreating.value) {
        await apiClient.createContact(form.value)
        router.push('/contacts')
      } else {
        const response = await apiClient.updateContact(contactId.value, form.value)
        contact.value = response.data
        isEditing.value = false
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save contact'
    } finally {
      saving.value = false
    }
  }

  const deleteContact = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      await apiClient.deleteContact(contactId.value)
      router.push('/contacts')
    } catch (err: any) {
      error.value = err.message || 'Failed to delete contact'
    }
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  onMounted(fetchContact)
</script>
