<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Contacts</h1>
      <router-link
        to="/contacts/new"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Add Contact
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading contacts...</p>
    </div>

    <!-- Error State -->
    <ErrorDisplay v-else-if="error" :error="error" @retry="fetchContacts" />

    <!-- Empty State -->
    <div v-else-if="contacts.length === 0" class="text-center py-8">
      <p class="text-gray-500">No contacts found.</p>
    </div>

    <!-- Contacts Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="contact in contacts"
        :key="contact.id"
        class="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ contact.internal_name }}</h3>
          <div class="flex space-x-2">
            <router-link
              :to="`/contacts/${contact.id}`"
              class="text-blue-600 hover:text-blue-800"
              title="View Details"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </router-link>
            <router-link
              :to="`/contacts/${contact.id}/edit`"
              class="text-green-600 hover:text-green-800"
              title="Edit"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </router-link>
          </div>
        </div>

        <div class="space-y-2 text-sm">
          <p v-if="contact.email">
            <span class="font-medium">Email:</span>
            <a :href="`mailto:${contact.email}`" class="text-blue-600 hover:underline">
              {{ contact.email }}
            </a>
          </p>
          <p v-if="contact.phone_number">
            <span class="font-medium">Phone:</span>
            {{ contact.formatted_phone_number || contact.phone_number }}
          </p>
          <p v-if="contact.fax_number">
            <span class="font-medium">Fax:</span>
            {{ contact.formatted_fax_number || contact.fax_number }}
          </p>
          <p v-if="contact.translations && contact.translations.length > 0">
            <span class="font-medium">Translations:</span> {{ contact.translations.length }}
          </p>
          <p><span class="font-medium">Created:</span> {{ formatDate(contact.created_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { apiClient, type ContactResource } from '@/api/client'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'

  const contacts = ref<ContactResource[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchContacts = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.getContacts()
      contacts.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch contacts'
    } finally {
      loading.value = false
    }
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  onMounted(fetchContacts)
</script>
