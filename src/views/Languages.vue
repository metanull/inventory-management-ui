<template>
  <div>
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Languages</h1>
        <p class="mt-2 text-sm text-gray-700">
          Manage languages available in the inventory system inventory system
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          @click="openCreateModal"
        >
          Add Language
        </button>
      </div>
    </div>

    <!-- Filter Buttons -->
    <div class="mt-6 flex space-x-1">
      <button
        :class="[
          filterMode === 'all'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-500 hover:text-gray-700',
          'px-3 py-2 font-medium text-sm rounded-md',
        ]"
        @click="filterMode = 'all'"
      >
        All Languages ({{ languageStore.languages.length }})
      </button>
      <button
        :class="[
          filterMode === 'default'
            ? 'bg-green-100 text-green-700'
            : 'text-gray-500 hover:text-gray-700',
          'px-3 py-2 font-medium text-sm rounded-md',
        ]"
        @click="filterMode = 'default'"
      >
        Default ({{ languageStore.defaultLanguages.length }})
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="languageStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredLanguages.length === 0" class="text-center py-12">
      <LanguageIcon class="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No languages found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{
          filterMode === 'all'
            ? 'Get started by creating a new language.'
            : `No ${filterMode} languages found.`
        }}
      </p>
      <div v-if="filterMode === 'all'" class="mt-6">
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="openCreateModal"
        >
          <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Language
        </button>
      </div>
    </div>

    <!-- Languages Table -->
    <div v-else class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    Language
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    Created
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr
                  v-for="language in filteredLanguages"
                  :key="language.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <ResourceNameDisplay
                      :internal-name="language.internal_name"
                      :backward-compatibility="language.backward_compatibility"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        language.is_default
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ language.is_default ? 'Default' : 'Not Default' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <DateDisplay :date="language.created_at" />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <ViewButton @click="router.push(`/languages/${language.id}`)" />
                      <EditButton @click="openEditModal(language)" />
                      <SetDefaultButton
                        v-if="!language.is_default"
                        :disabled="languageStore.loading"
                        @click="setAsDefault(language)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Language Form Modal -->
    <LanguageForm
      :is-visible="showModal"
      :language="currentEditLanguage"
      @close="closeModal"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useLanguageStore } from '@/stores/language'
  import LanguageForm from '@/components/_obsolete/LanguageForm.vue'
  import type { LanguageResource } from '@metanull/inventory-app-api-client'
  import ViewButton from '@/components/layout/list/ViewButton.vue'
  import EditButton from '@/components/layout/list/EditButton.vue'
  import SetDefaultButton from '@/components/_obsolete/SetDefaultButton.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import ResourceNameDisplay from '@/components/format/InternalName.vue'
  import { LanguageIcon, PlusIcon } from '@heroicons/vue/24/outline'

  const router = useRouter()
  const languageStore = useLanguageStore()

  const showModal = ref(false)
  const currentEditLanguage = ref<LanguageResource | null>(null)

  // Filter state
  const filterMode = ref<'all' | 'default'>('all')

  // Computed filtered languages
  const filteredLanguages = computed(() => {
    switch (filterMode.value) {
      case 'default':
        return languageStore.defaultLanguages
      default:
        return languageStore.languages
    }
  })

  const openCreateModal = () => {
    currentEditLanguage.value = null
    showModal.value = true
  }

  const openEditModal = (language: LanguageResource) => {
    currentEditLanguage.value = language
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    currentEditLanguage.value = null
    languageStore.clearError()
  }

  const handleFormSuccess = () => {
    // Refresh the languages list after successful create/update
    refreshLanguages()
  }

  const setAsDefault = async (language: LanguageResource) => {
    try {
      await languageStore.setDefaultLanguage(language.id, true)
    } catch (error) {
      // Error is handled by the store
      console.error('Set default error:', error)
    }
  }

  const refreshLanguages = async () => {
    try {
      await languageStore.fetchLanguages()
    } catch (error) {
      // Error is handled by the store
      console.error('Refresh error:', error)
    }
  }

  onMounted(() => {
    refreshLanguages()
  })
</script>
