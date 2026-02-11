<template>
  <!-- Unified Partner Detail View -->
  <DetailView
    :store-loading="partnerStore.loading"
    :resource="mode === 'create' ? null : partner"
    :mode="mode"
    :save-disabled="!hasUnsavedChanges"
    :has-unsaved-changes="hasUnsavedChanges"
    :back-link="backLink"
    :create-title="'New Partner'"
    :create-subtitle="'(Creating)'"
    information-title="Partner Information"
    :information-description="informationDescription"
    :fetch-data="fetchPartner"
    @edit="enterEditMode"
    @save="savePartner"
    @cancel="cancelAction"
    @delete="deletePartner"
  >
    <template #resource-icon>
      <PartnerIcon class="h-6 w-6 text-blue-600" />
    </template>
    <template #information>
      <DescriptionList>
        <DescriptionRow>
          <DescriptionTerm>Partner ID</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.id"
              type="text"
              placeholder="ISO partner code (e.g., GBR)"
              :disabled="mode === 'edit'"
            />
            <DisplayText v-else>{{ partner?.id }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow>
          <DescriptionTerm>Internal Name</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.internal_name"
              type="text"
            />
            <DisplayText v-else>{{ partner?.internal_name }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow
          v-if="partner?.backward_compatibility || mode === 'edit' || mode === 'create'"
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
            <DisplayText v-else>{{ partner?.backward_compatibility }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow v-if="partner?.created_at" variant="white">
          <DescriptionTerm>Created</DescriptionTerm>
          <DescriptionDetail>
            <DateDisplay :date="partner.created_at" />
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow v-if="partner?.updated_at" variant="gray">
          <DescriptionTerm>Updated</DescriptionTerm>
          <DescriptionDetail>
            <DateDisplay :date="partner.updated_at" />
          </DescriptionDetail>
        </DescriptionRow>
      </DescriptionList>
    </template>
  </DetailView>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import type {
    StorePartnerRequest,
    UpdatePartnerRequest,
  } from '@metanull/inventory-app-api-client'
  import { StorePartnerRequestTypeEnum } from '@metanull/inventory-app-api-client'
  import { usePartnerStore } from '@/stores/partner'
  import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
  import { useCancelChangesConfirmationStore } from '@/stores/cancelChangesConfirmation'
  import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'
  import { useErrorDisplayStore } from '@/stores/errorDisplay'
  import DetailView from '@/components/layout/detail/DetailView.vue'
  import DescriptionList from '@/components/format/description/DescriptionList.vue'
  import DescriptionRow from '@/components/format/description/DescriptionRow.vue'
  import DescriptionTerm from '@/components/format/description/DescriptionTerm.vue'
  import DescriptionDetail from '@/components/format/description/DescriptionDetail.vue'
  import FormInput from '@/components/format/FormInput.vue'
  import DisplayText from '@/components/format/DisplayText.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import { BuildingLibraryIcon as PartnerIcon } from '@heroicons/vue/24/solid'
  import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

  // Types
  type Mode = 'view' | 'edit' | 'create'

  interface PartnerFormData {
    id: string
    internal_name: string
    type: string
    backward_compatibility: string
  }

  const route = useRoute()
  const router = useRouter()
  const partnerStore = usePartnerStore()
  const loadingStore = useLoadingOverlayStore()
  const cancelChangesStore = useCancelChangesConfirmationStore()
  const deleteConfirmationStore = useDeleteConfirmationStore()
  const errorStore = useErrorDisplayStore()

  // Route params
  const partnerId = computed(() => {
    const id = route.params.id
    return Array.isArray(id) ? id[0] : id
  })

  // Mode determination
  const mode = ref<Mode>('view')

  // Determine mode from route
  if (partnerId.value === 'new') {
    mode.value = 'create'
  }

  // Resource data
  const partner = computed(() => partnerStore.currentPartner)

  // Edit form state
  const editForm = ref<PartnerFormData>({
    id: '',
    internal_name: '',
    type: '',
    backward_compatibility: '',
  })

  // Navigation
  const backLink = computed(() => ({
    title: 'Back to Partners',
    route: '/partners',
    icon: ArrowLeftIcon,
    color: 'blue',
  }))

  // Information description
  const informationDescription = computed(() => {
    if (mode.value === 'create') {
      return 'Enter the partner details below.'
    }
    return 'Partner details and metadata.'
  })

  // Unsaved changes tracking
  const hasUnsavedChanges = computed(() => {
    if (mode.value === 'view') return false
    if (mode.value === 'create') {
      return editForm.value.internal_name.trim() !== ''
    }
    if (!partner.value) return false
    return (
      editForm.value.internal_name !== partner.value.internal_name ||
      editForm.value.backward_compatibility !== (partner.value.backward_compatibility || '')
    )
  })

  // Methods
  const fetchPartner = async (): Promise<void> => {
    if (mode.value === 'create') return
    if (!partnerId.value || partnerId.value === 'new') return
    await partnerStore.fetchPartner(partnerId.value)
  }

  const enterEditMode = (): void => {
    if (!partner.value) return
    editForm.value = {
      id: partner.value.id,
      internal_name: partner.value.internal_name,
      type: partner.value.type,
      backward_compatibility: partner.value.backward_compatibility || '',
    }
    mode.value = 'edit'
  }

  const savePartner = async (): Promise<void> => {
    try {
      loadingStore.show('Saving...')
      if (mode.value === 'create') {
        const createData: StorePartnerRequest = {
          id: editForm.value.id,
          internal_name: editForm.value.internal_name,
          type: editForm.value.type as StorePartnerRequestTypeEnum,
          backward_compatibility: editForm.value.backward_compatibility || undefined,
        }
        const newPartner = await partnerStore.createPartner(createData)
        if (newPartner) {
          errorStore.addMessage('info', 'Partner created successfully.')
          await router.push(`/partners/${newPartner.id}`)
          mode.value = 'view'
        }
      } else if (mode.value === 'edit' && partner.value) {
        const updateData: UpdatePartnerRequest = {
          internal_name: editForm.value.internal_name,
          type: editForm.value.type as StorePartnerRequestTypeEnum,
          backward_compatibility: editForm.value.backward_compatibility || undefined,
        }
        const updatedCountry = await partnerStore.updatePartner(partner.value.id, updateData)
        if (updatedCountry) {
          errorStore.addMessage('info', 'Partner updated successfully.')
          mode.value = 'view'
        }
      }
    } catch {
      errorStore.addMessage('error', 'Failed to save partner. Please try again.')
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
          router.push('/partners')
        } else {
          mode.value = 'view'
        }
      }
    } else if (mode.value === 'create') {
      router.push('/partners')
    } else {
      mode.value = 'view'
    }
  }

  const deletePartner = async (): Promise<void> => {
    if (!partner.value) return
    const result = await deleteConfirmationStore.trigger(
      'Delete Partner',
      `Are you sure you want to delete "${partner.value.internal_name}"? This action cannot be undone.`
    )
    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await partnerStore.deletePartner(partner.value.id)
        errorStore.addMessage('info', 'Partner deleted successfully.')
        await router.push('/partners')
      } catch {
        errorStore.addMessage('error', 'Failed to delete partner. Please try again.')
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
        type: '',
        backward_compatibility: '',
      }
    } else {
      await fetchPartner()
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
          type: '',
          backward_compatibility: '',
        }
      } else if (typeof newId === 'string') {
        mode.value = 'view'
        await fetchPartner()
      }
    }
  )

  // Update edit form when partner data changes
  watch(
    partner,
    newPartner => {
      if (newPartner && mode.value === 'view') {
        editForm.value = {
          id: newPartner.id,
          internal_name: newPartner.internal_name,
          type: newPartner.type,
          backward_compatibility: newPartner.backward_compatibility || '',
        }
      }
    },
    { immediate: true }
  )
</script>
