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
        <!-- <DescriptionRow variant="gray">
          <DescriptionTerm>Glossary Entry ID</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.id"
              type="text"
              placeholder="ISO glossary entry code"
              :disabled="mode === 'edit'"
            />
            <DisplayText v-else>{{ glossaryEntry?.id }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow> -->
        <DescriptionRow variant="white">
          <DescriptionTerm>Glossary Entry (Word)</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.internal_name"
              type="text"
            />
            <DisplayText v-else>{{ glossaryEntry?.internal_name }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <!-- <DescriptionRow
          v-if="glossaryEntry?.backward_compatibility || mode === 'edit' || mode === 'create'"
          variant="gray"
        >
          <DescriptionTerm>Legacy ID</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.backward_compatibility"
              type="text"
              placeholder="Optional legacy identifier"
            />
            <DisplayText v-else>{{ glossaryEntry?.backward_compatibility }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow> -->

        <DescriptionRow variant="white">
          <DescriptionTerm>Alternate Spellings</DescriptionTerm>
          <DescriptionDetail>
            <div v-if="mode === 'edit'">
              <FormInput
                v-model="editSpellingForm.spelling"
                type="text"
                placeholder="Enter one spelling at a time."
              />
              <SaveButton @click="saveGlossarySpellingEntry"></SaveButton>
            </div>
            <DisplayText v-else>
              <!-- {{ glossaryEntry?.spellings }} -->
              <ul>
                <li v-for="(spelling, index) in glossaryEntry?.spellings" :key="index">
                  {{ spelling.spelling }}
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
    // StoreGlossarySpellingRequest,
    UpdateGlossarySpellingRequest,
  } from '@metanull/inventory-app-api-client'
  import { useGlossaryStore } from '@/stores/glossary'
  import { useGlossarySpellingStore } from '@/stores/glossarySpelling'
  import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
  import { useCancelChangesConfirmationStore } from '@/stores/cancelChangesConfirmation'
  import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'
  import { useErrorDisplayStore } from '@/stores/errorDisplay'
  import SaveButton from '@/components/layout/detail/SaveButton.vue'
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

  // Types
  type Mode = 'view' | 'edit' | 'create'

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

  const route = useRoute()
  const router = useRouter()
  const glossaryStore = useGlossaryStore()
  const glossarySpellingStore = useGlossarySpellingStore()
  const loadingStore = useLoadingOverlayStore()
  const cancelChangesStore = useCancelChangesConfirmationStore()
  const deleteConfirmationStore = useDeleteConfirmationStore()
  const errorStore = useErrorDisplayStore()

  // Route params
  const glossaryEntryId = computed(() => {
    const id = route.params.id
    return Array.isArray(id) ? id[0] : id
  })

  // Mode determination
  const mode = ref<Mode>('view')

  // Determine mode from route
  if (glossaryEntryId.value === 'new') {
    mode.value = 'create'
  }

  // Resource data
  const glossaryEntry = computed(() => glossaryStore.currentGlossaryEntry)
  const glossarySpellingEntries = computed(() => glossarySpellingStore.currentGlossarySpellingEntry)

  // Edit form state
  const editForm = ref<GlossaryFormData>({
    id: '',
    internal_name: '',
    backward_compatibility: '',
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
      editForm.value.backward_compatibility !==
        (glossaryEntry.value.backward_compatibility || '') ||
      editSpellingForm.value.spelling !== (glossaryEntry.value.spellings || '')
      // ???
    )
  })

  // Methods
  const fetchGlossaryEntry = async (): Promise<void> => {
    if (mode.value === 'create') return
    if (!glossaryEntryId.value || glossaryEntryId.value === 'new') return
    await glossaryStore.fetchGlossaryEntry(glossaryEntryId.value)
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
      id: glossarySpellingEntries.value?.id || '',
      glossary_id: glossaryEntry.value.id,
      language_id: glossarySpellingEntries.value?.language_id || '',
      spelling: glossarySpellingEntries.value?.spelling || '',
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
          mode.value = 'view'
        }
      }
    } catch {
      errorStore.addMessage('error', 'Failed to save glossary entry. Please try again.')
    } finally {
      loadingStore.hide()
    }
  }

  const saveGlossarySpellingEntry = async (): Promise<void> => {
    try {
      loadingStore.show('Saving...')
      console.log('Saving glossary spelling entry:', editSpellingForm.value)
      // fix here
      if (mode.value === 'edit' && glossarySpellingEntries.value) {
        const updateData: UpdateGlossarySpellingRequest = {
          language_id: editSpellingForm.value.language_id,
          spelling: editSpellingForm.value.spelling,
        }
        const updatedGlossarySpellingEntry =
          await glossarySpellingStore.updateGlossarySpellingEntry(
            glossarySpellingEntries.value.id,
            updateData
          )
        if (updatedGlossarySpellingEntry) {
          errorStore.addMessage('info', 'Glossary spelling entry updated successfully.')
          mode.value = 'view'
        }
      }
    } catch {
      errorStore.addMessage('error', 'Failed to save glossary spelling entry. Please try again.')
    } finally {
      loadingStore.hide()
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
        }
      }
    } else if (mode.value === 'create') {
      router.push('/glossary')
    } else {
      mode.value = 'view'
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
