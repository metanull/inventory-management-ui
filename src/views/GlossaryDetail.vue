<template>
  <!-- Unified Glossary Detail View -->
  <DetailView
    :store-loading="glossaryStore.loading"
    :resource="mode === 'create' ? null : glossaryEntry"
    :mode="mode"
    :save-disabled="!hasUnsavedChanges"
    :has-unsaved-changes="hasUnsavedChanges"
    :back-link="backLink"
    :create-title="'New Glossary Entry'"
    :create-subtitle="'(Creating)'"
    information-title="Glossary Entry Information"
    :information-description="informationDescription"
    :fetch-data="fetchGlossaryEntry"
    @edit="enterEditMode"
    @save="saveGlossaryEntry"
    @cancel="cancelAction"
    @delete="deleteGlossaryEntry"
  >
    <template #resource-icon>
      <GlossaryIcon class="h-6 w-6 text-blue-600" />
    </template>
    <template #information>
      <DescriptionList>
        <DescriptionRow variant="white">
          <DescriptionTerm>Glossary Reference</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.internal_name"
              type="text"
            />
            <DisplayText v-else>{{ glossaryEntry?.internal_name }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow variant="white">
          <DescriptionTerm>Available Languages</DescriptionTerm>
          <DescriptionDetail>
            <div class="mb-4 grid grid-cols-5 gap-2">
              <GenericButton
                v-if="mode === 'edit'"
                label="Add New Language"
                @click="createNewLanguage"
              >
              </GenericButton>
              <GenericButton
                v-for="language in glossaryEntryLanguages"
                :key="language.id"
                :label="language.internal_name"
                :class="{ 'bg-sky-300': currentLanguage.id === language.id }"
                @click="assignCurrentLanguage(language)"
              >
              </GenericButton>
            </div>
            <div v-if="mode === 'edit' && languageMode === 'create'">
              <FormInput
                v-model="newLanguage.id"
                type="select"
                :options="languages"
                placeholder="Select a language"
                class="mb-2"
                @change="assignNewLanguage($event.target.value)"
              />
              <FormInput
                v-model="createSpellingForm.spelling"
                type="text"
                :placeholder="`Create a new ${newLanguage.internal_name} spelling.`"
                class="mb-2"
              />
              <SaveButton class="mr-2" @click="saveGlossarySpellingEntry"></SaveButton>
              <CancelButton @click="cancelNewLanguage"></CancelButton>
            </div>
            <div v-if="mode === 'edit' && spellingMode === 'view' && currentLanguage.id">
              <FormInput
                v-model="createSpellingForm.spelling"
                type="text"
                :placeholder="`Create a new ${currentLanguage.internal_name} spelling.`"
                class="mb-2"
              />
              <SaveButton @click="saveGlossarySpellingEntry"></SaveButton>
            </div>
            <DisplayText>
              <ul class="mt-4 space-y-2">
                <li v-for="(spelling, index) in currentLanguageSpellings" :key="index">
                  <div v-if="spellingMode === 'view'">
                    {{ spelling.spelling }}
                    <EditButton
                      v-if="mode === 'edit'"
                      @click="handleEditGlossarySpelling(spelling)"
                    />
                    <DeleteButton
                      v-if="mode === 'edit'"
                      @click="handleDeleteGlossarySpelling(spelling)"
                    />
                  </div>
                  <div
                    v-else-if="spellingMode === 'edit' && glossarySpellingEntry?.id === spelling.id"
                  >
                    <FormInput
                      v-model="editSpellingForm.spelling"
                      type="text"
                      :placeholder="`Editing this spelling: ${spelling.spelling}`"
                      class="mb-2"
                    />
                    <SaveButton class="mr-2" @click="saveGlossarySpellingEntry"></SaveButton>
                    <CancelButton @click="spellingMode = 'view'"></CancelButton>
                  </div>
                </li>
              </ul>
            </DisplayText>
          </DescriptionDetail>
        </DescriptionRow>

        <DescriptionRow v-if="glossaryEntry?.created_at" variant="white">
          <DescriptionTerm>Creation Date</DescriptionTerm>
          <DescriptionDetail>
            <DateDisplay :date="glossaryEntry.created_at" />
          </DescriptionDetail>
        </DescriptionRow>
        <!-- <DescriptionRow v-if="glossaryEntry?.updated_at" variant="gray">
          <DescriptionTerm>Updated</DescriptionTerm>
          <DescriptionDetail>
            <DateDisplay :date="glossaryEntry.updated_at" />
          </DescriptionDetail>
        </DescriptionRow> -->
      </DescriptionList>
    </template>
  </DetailView>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import type {
    StoreGlossaryRequest,
    UpdateGlossaryRequest,
    StoreGlossarySpellingRequest,
    UpdateGlossarySpellingRequest,
  } from '@metanull/inventory-app-api-client'
  import type { GlossarySpellingResource } from '@metanull/inventory-app-api-client'
  import { useGlossaryStore } from '@/stores/glossary'
  import { useGlossarySpellingStore } from '@/stores/glossarySpelling'
  import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
  import { useCancelChangesConfirmationStore } from '@/stores/cancelChangesConfirmation'
  import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'
  import { useErrorDisplayStore } from '@/stores/errorDisplay'
  import { useLanguageStore } from '@/stores/language'
  import SaveButton from '@/components/layout/detail/SaveButton.vue'
  import CancelButton from '@/components/layout/detail/CancelButton.vue'
  import DetailView from '@/components/layout/detail/DetailView.vue'
  import DescriptionList from '@/components/format/description/DescriptionList.vue'
  import DescriptionRow from '@/components/format/description/DescriptionRow.vue'
  import DescriptionTerm from '@/components/format/description/DescriptionTerm.vue'
  import DescriptionDetail from '@/components/format/description/DescriptionDetail.vue'
  import FormInput from '@/components/format/FormInput.vue'
  import DisplayText from '@/components/format/DisplayText.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import { BookOpenIcon as GlossaryIcon } from '@heroicons/vue/24/solid'
  import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
  import EditButton from '@/components/layout/list/EditButton.vue'
  import DeleteButton from '@/components/layout/list/DeleteButton.vue'
  import GenericButton from '@/components/layout/detail/GenericButton.vue'

  // Types
  type Mode = 'view' | 'edit' | 'create'
  type SpellingMode = 'view' | 'edit' | 'create'
  type LanguageMode = 'view' | 'create'

  interface GlossaryFormData {
    id: string
    internal_name: string
    backward_compatibility: string
  }

  interface GlossarySpellingFormData {
    id: string
    glossary_id: string
    language_id: string
    spelling: string
  }

  interface LanguageSelection {
    id: string
    internal_name: string
  }

  const route = useRoute()
  const router = useRouter()
  const glossaryStore = useGlossaryStore()
  const glossarySpellingStore = useGlossarySpellingStore()
  const loadingStore = useLoadingOverlayStore()
  const cancelChangesStore = useCancelChangesConfirmationStore()
  const deleteConfirmationStore = useDeleteConfirmationStore()
  const errorStore = useErrorDisplayStore()
  const languageStore = useLanguageStore()
  const deleteStore = useDeleteConfirmationStore()

  // Route params
  const glossaryEntryId = computed(() => {
    const id = route.params.id
    return Array.isArray(id) ? id[0] : id
  })

  // Mode determination
  const mode = ref<Mode>('view')
  const spellingMode = ref<SpellingMode>('view')
  const languageMode = ref<LanguageMode>('view')

  const currentLanguage = ref<LanguageSelection>({
    id: '',
    internal_name: '',
  })
  const newLanguage = ref<LanguageSelection>({
    id: '',
    internal_name: '',
  })

  // Determine mode from route
  if (glossaryEntryId.value === 'new') {
    mode.value = 'create'
  }

  // Resource data
  const glossaryEntry = computed(() => glossaryStore.currentGlossaryEntry)
  const glossarySpellingEntry = computed(() => glossarySpellingStore.currentGlossarySpellingEntry)
  const languages = computed(() => languageStore.languages)

  const glossaryEntryLanguages = computed(() => {
    if (glossaryEntry.value && glossaryEntry.value.spellings) {
      const ids = glossaryEntry.value.spellings.map(spelling => spelling.language_id)
      const languages = Array.from(new Set(ids))
      let available = languages.sort((a, b) => a.localeCompare(b))
      let list = []
      for (let i = 0; i < available.length; i++) {
        const lang = languageStore.languages.find(l => l.id === available[i])
        if (lang) {
          list.push({ id: lang.id, internal_name: lang.internal_name })
        }
      }
      return list
    } else {
      return []
    }
  })

  const currentLanguageSpellings = computed(() => {
    if (glossaryEntry.value && glossaryEntry.value.spellings) {
      return glossaryEntry.value.spellings.filter(
        spelling => spelling.language_id === currentLanguage.value.id
      )
    } else {
      return []
    }
  })

  // Edit form state
  const editForm = ref<GlossaryFormData>({
    id: '',
    internal_name: '',
    backward_compatibility: '',
  })

  const createSpellingForm = ref<GlossarySpellingFormData>({
    id: '',
    glossary_id: '',
    language_id: '',
    spelling: '',
  })

  const editSpellingForm = ref<GlossarySpellingFormData>({
    id: '',
    glossary_id: '',
    language_id: '',
    spelling: '',
  })

  // Navigation
  const backLink = computed(() => ({
    title: 'Back to Glossary Entries',
    route: '/glossary',
    icon: ArrowLeftIcon,
    color: 'blue',
  }))

  // Information description
  const informationDescription = computed(() => {
    if (mode.value === 'create') {
      return 'Enter the glossary word below, and click Save. Spellings and translations can be added after the entry is created.'
    }
    return 'Glossary entry with entered spellings and translations.'
  })

  // Unsaved changes tracking
  const hasUnsavedChanges = computed(() => {
    if (mode.value === 'view') return false
    if (mode.value === 'create') {
      return editForm.value.internal_name.trim() !== ''
    }
    if (!glossaryEntry.value) return false
    return (
      editForm.value.internal_name !== glossaryEntry.value.internal_name ||
      editSpellingForm.value.language_id !== '' ||
      editSpellingForm.value.spelling !== ''
      // ???
    )
  })

  // Methods
  const fetchGlossaryEntry = async (): Promise<void> => {
    if (mode.value === 'create') return
    if (!glossaryEntryId.value || glossaryEntryId.value === 'new') return
    await glossaryStore.fetchGlossaryEntry(glossaryEntryId.value, 'spellings')
  }

  // const fetchGlossarySpellingEntry = async (): Promise<void> => {
  //   if (mode.value === 'create') return
  //   if (!glossarySpellingEntryId.value || glossarySpellingEntryId.value === 'new') return
  //   await glossarySpellingStore.fetchGlossarySpellingEntry(glossarySpellingEntryId.value)
  // }

  const enterEditMode = (): void => {
    if (!glossaryEntry.value) return
    editForm.value = {
      id: glossaryEntry.value.id,
      internal_name: glossaryEntry.value.internal_name,
      backward_compatibility: glossaryEntry.value.backward_compatibility || '',
    }
    editSpellingForm.value = {
      id: glossarySpellingEntry.value?.id || '',
      glossary_id: glossaryEntry.value.id,
      language_id: glossarySpellingEntry.value?.language_id || '',
      spelling: glossarySpellingEntry.value?.spelling || '',
    }
    mode.value = 'edit'
  }

  const saveGlossaryEntry = async (): Promise<void> => {
    try {
      loadingStore.show('Saving...')
      if (mode.value === 'create') {
        const createData: StoreGlossaryRequest = {
          id: editForm.value.id,
          internal_name: editForm.value.internal_name,
          backward_compatibility: editForm.value.backward_compatibility || undefined,
        }
        const newGlossaryEntry = await glossaryStore.createGlossaryEntry(createData)
        if (newGlossaryEntry) {
          errorStore.addMessage('info', 'Glossary entry created successfully.')
          await router.push(`/glossary/${newGlossaryEntry.id}`)
          mode.value = 'view'
        }
      } else if (mode.value === 'edit' && glossaryEntry.value) {
        const updateData: UpdateGlossaryRequest = {
          internal_name: editForm.value.internal_name,
          backward_compatibility: editForm.value.backward_compatibility || undefined,
        }
        const updatedGlossaryEntry = await glossaryStore.updateGlossaryEntry(
          glossaryEntry.value.id,
          updateData
        )
        if (updatedGlossaryEntry) {
          errorStore.addMessage('info', 'Glossary entry updated successfully.')
          // Refresh the glossary entry so UI reflects any server-side changes
          await fetchGlossaryEntry()
          mode.value = 'view'
        }
      }
    } catch {
      errorStore.addMessage('error', 'Failed to save glossary entry. Please try again.')
    } finally {
      loadingStore.hide()
    }
  }

  const assignCurrentLanguage = (language: LanguageSelection): void => {
    createSpellingForm.value.spelling = ''
    currentLanguage.value = language
    spellingMode.value = 'view'
    newLanguage.value = { id: '', internal_name: '' }
    languageMode.value = 'view'
  }

  const createNewLanguage = (): void => {
    languageMode.value = 'create'
    currentLanguage.value = { id: '', internal_name: '' }
  }

  const assignNewLanguage = (id: string): void => {
    const match = languages.value.find(l => l.id === id)

    if (match) {
      newLanguage.value = {
        id: match.id,
        internal_name: match.internal_name,
      }
    } else {
      // Reset to empty state if not found
      newLanguage.value = { id: '', internal_name: '' }
    }
  }

  const cancelNewLanguage = (): void => {
    newLanguage.value = { id: '', internal_name: '' }
    languageMode.value = 'view'
  }

  const handleEditGlossarySpelling = async (spellingToEdit: GlossarySpellingResource) => {
    await glossarySpellingStore.fetchGlossarySpellingEntry(spellingToEdit.id)
    if (glossaryEntry.value) {
      editSpellingForm.value = {
        id: spellingToEdit.id,
        glossary_id: glossaryEntry.value.id,
        language_id: spellingToEdit.language_id,
        spelling: spellingToEdit.spelling,
      }
    }
    spellingMode.value = 'edit'
  }

  const saveGlossarySpellingEntry = async (): Promise<void> => {
    // if (editSpellingForm.value.language_id.trim() === "") {
    //   errorStore.addMessage('error', 'Please select a language.')
    //   return
    // }
    // if (editSpellingForm.value.spelling.trim() ==="") {
    //   errorStore.addMessage('error', 'Please enter a spelling.')
    //   return
    // }
    try {
      loadingStore.show('Saving...')
      if (languageMode.value === 'create') {
        if (newLanguage.value.id) {
          currentLanguage.value = {
            id: newLanguage.value.id,
            internal_name: newLanguage.value.internal_name,
          }
        }
      }
      if (spellingMode.value === 'edit' && glossarySpellingEntry.value) {
        const updateData: UpdateGlossarySpellingRequest = {
          language_id: currentLanguage.value.id,
          spelling: editSpellingForm.value.spelling,
        }
        const updatedGlossarySpellingEntry =
          await glossarySpellingStore.updateGlossarySpellingEntry(
            glossarySpellingEntry.value.id,
            updateData
          )
        if (updatedGlossarySpellingEntry) {
          errorStore.addMessage('info', 'Glossary spelling entry updated successfully.')
          await fetchGlossaryEntry()
          spellingMode.value = 'view'
        }
      } else if (mode.value === 'edit' && glossaryEntry.value && !glossarySpellingEntry.value) {
        // Creating new spelling entry
        const createData: StoreGlossarySpellingRequest = {
          glossary_id: glossaryEntry.value.id,
          language_id: currentLanguage.value.id,
          spelling: createSpellingForm.value.spelling,
        }
        const newGlossarySpellingEntry =
          await glossarySpellingStore.createGlossarySpellingEntry(createData)
        if (newGlossarySpellingEntry) {
          errorStore.addMessage('info', 'Glossary spelling entry created successfully.')
          // createSpellingForm.value.language_id = "";
          createSpellingForm.value.spelling = ''
          newLanguage.value = { id: '', internal_name: '' }
          languageMode.value = 'view'
          await fetchGlossaryEntry()
          // mode.value = 'view'
        }
      }
    } catch {
      errorStore.addMessage('error', 'Failed to save glossary spelling entry. Please try again.')
    } finally {
      loadingStore.hide()
    }
  }

  // Delete spelling with confirmation
  const handleDeleteGlossarySpelling = async (spellingToDelete: GlossarySpellingResource) => {
    const result = await deleteStore.trigger(
      'Delete Spelling',
      `Are you sure you want to delete "${spellingToDelete.spelling}"? This action cannot be undone.`
    )

    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await glossarySpellingStore.deleteGlossarySpellingEntry(spellingToDelete.id)
        errorStore.addMessage('info', 'Spelling deleted successfully.')
      } catch {
        errorStore.addMessage('error', 'Failed to delete spelling. Please try again.')
      } finally {
        await fetchGlossaryEntry()
        loadingStore.hide()
      }
    }
  }

  const cancelAction = async (): Promise<void> => {
    if (hasUnsavedChanges.value) {
      const result = await cancelChangesStore.trigger(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?'
      )
      if (result === 'leave') {
        if (mode.value === 'create') {
          router.push('/glossary')
        } else {
          mode.value = 'view'
          currentLanguage.value = { id: '', internal_name: '' }
        }
      }
    } else if (mode.value === 'create') {
      router.push('/glossary')
    } else {
      mode.value = 'view'
      currentLanguage.value = { id: '', internal_name: '' }
    }
  }

  const deleteGlossaryEntry = async (): Promise<void> => {
    if (!glossaryEntry.value) return
    const result = await deleteConfirmationStore.trigger(
      'Delete Glossary Entry',
      `Are you sure you want to delete "${glossaryEntry.value.internal_name}"? This action cannot be undone.`
    )
    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await glossaryStore.deleteGlossaryEntry(glossaryEntry.value.id)
        errorStore.addMessage('info', 'Glossary entry deleted successfully.')
        await router.push('/glossary')
      } catch {
        errorStore.addMessage('error', 'Failed to delete glossary entry. Please try again.')
      } finally {
        loadingStore.hide()
      }
    }
  }

  // Initialize data on mount
  onMounted(async () => {
    if (mode.value === 'create') {
      editForm.value = {
        id: '',
        internal_name: '',
        backward_compatibility: '',
      }
    } else {
      await fetchGlossaryEntry()
    }
    // Load languages for spelling selection
    try {
      await languageStore.fetchLanguages()
    } catch {
      // swallow - errorStore will display via the language store error handling
    }
  })

  // Watch for route changes
  watch(
    () => route.params.id,
    async newId => {
      if (newId === 'new') {
        mode.value = 'create'
        editForm.value = {
          id: '',
          internal_name: '',
          backward_compatibility: '',
        }
      } else if (typeof newId === 'string') {
        mode.value = 'view'
        await fetchGlossaryEntry()
      }
    }
  )

  // Update edit form when glossaryEntry data changes
  watch(
    glossaryEntry,
    newGlossaryEntry => {
      if (newGlossaryEntry && mode.value === 'view') {
        editForm.value = {
          id: newGlossaryEntry.id,
          internal_name: newGlossaryEntry.internal_name,
          backward_compatibility: newGlossaryEntry.backward_compatibility || '',
        }
      }
    },
    { immediate: true }
  )
</script>
