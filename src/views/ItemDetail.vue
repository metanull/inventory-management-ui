<template>
  <!-- Unified Item Detail View -->
  <DetailView
    :store-loading="itemStore.loading"
    :resource="mode === 'create' ? null : item"
    :mode="mode"
    :save-disabled="!hasUnsavedChanges"
    :has-unsaved-changes="hasUnsavedChanges"
    :back-link="backLink"
    :create-title="'New Item'"
    :create-subtitle="'(Creating)'"
    information-title="Item Information"
    :information-description="informationDescription"
    :fetch-data="fetchItem"
    @edit="enterEditMode"
    @save="saveItem"
    @cancel="cancelAction"
    @delete="deleteItem"
  >
    <template #resource-icon>
      <ItemIcon class="h-6 w-6 text-blue-600" />
    </template>
    <template #information>
      <DescriptionList>
        <DescriptionRow>
          <DescriptionTerm>Item ID</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.id"
              type="text"
              placeholder="ISO item code (e.g., GBR)"
              :disabled="mode === 'edit'"
            />
            <DisplayText v-else>{{ item?.id }}</DisplayText>
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
            <DisplayText v-else>{{ item?.internal_name }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow>
          <DescriptionTerm>Images</DescriptionTerm>
          <DescriptionDetail>
            <div v-if="item?.itemImages">
              <DescriptionImage
                v-for="image in item?.itemImages"
                :key="image.id"
                :image-url="image.path"
                :alt-text="image.alt_text"
              >
              </DescriptionImage>
            </div>
            <DisplayText v-else>No images available for this item.</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow>
          <DescriptionTerm>Type</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.type"
              type="select"
              :options="types"
              placeholder="Select a type"
              class="mb-2"
            />
            <DisplayText v-else>{{ item?.type }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow>
          <DescriptionTerm>Partner</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.partner_id"
              type="select"
              :options="partnersList"
              placeholder="Select a partner"
              class="mb-2"
            />
            <DisplayText v-else>{{ item?.partner?.internal_name }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow>
          <DescriptionTerm>Project</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.project_id"
              type="select"
              :options="projects"
              placeholder="Select a project"
              class="mb-2"
            />
            <DisplayText v-else>{{ item?.project?.internal_name }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow v-if="item?.backward_compatibility || mode === 'edit' || mode === 'create'">
          <DescriptionTerm>Legacy ID</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.backward_compatibility"
              type="text"
              placeholder="Optional legacy identifier"
            />
            <DisplayText v-else>{{ item?.backward_compatibility }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow v-if="item?.created_at">
          <DescriptionTerm>Created</DescriptionTerm>
          <DescriptionDetail>
            <DateDisplay :date="item.created_at" />
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow v-if="item?.updated_at">
          <DescriptionTerm>Updated</DescriptionTerm>
          <DescriptionDetail>
            <DateDisplay :date="item.updated_at" />
          </DescriptionDetail>
        </DescriptionRow>
      </DescriptionList>
    </template>
  </DetailView>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import type { StoreItemRequest, UpdateItemRequest } from '@metanull/inventory-app-api-client'
  import {
    StoreItemRequestTypeEnum,
    StorePartnerRequestTypeEnum,
  } from '@metanull/inventory-app-api-client'
  import { useItemStore } from '@/stores/item'
  import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
  import { useCancelChangesConfirmationStore } from '@/stores/cancelChangesConfirmation'
  import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'
  import { useErrorDisplayStore } from '@/stores/errorDisplay'
  import { usePartnerStore } from '@/stores/partner'
  import { useProjectStore } from '@/stores/project'
  import DetailView from '@/components/layout/detail/DetailView.vue'
  import DescriptionList from '@/components/format/description/DescriptionList.vue'
  import DescriptionRow from '@/components/format/description/DescriptionRow.vue'
  import DescriptionTerm from '@/components/format/description/DescriptionTerm.vue'
  import DescriptionDetail from '@/components/format/description/DescriptionDetail.vue'
  import DescriptionImage from '@/components/format/description/DescriptionImage.vue'
  import FormInput from '@/components/format/FormInput.vue'
  import DisplayText from '@/components/format/DisplayText.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import { PuzzlePieceIcon as ItemIcon } from '@heroicons/vue/24/solid'
  import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

  // Types
  type Mode = 'view' | 'edit' | 'create'

  interface ItemFormData {
    id: string
    internal_name: string
    type: string
    partner_id: string
    project_id: string
    backward_compatibility: string
  }

  const route = useRoute()
  const router = useRouter()
  const itemStore = useItemStore()
  const loadingStore = useLoadingOverlayStore()
  const cancelChangesStore = useCancelChangesConfirmationStore()
  const deleteConfirmationStore = useDeleteConfirmationStore()
  const errorStore = useErrorDisplayStore()
  const partnerStore = usePartnerStore()
  const projectStore = useProjectStore()

  // Route params
  const itemId = computed(() => {
    const id = route.params.id
    return Array.isArray(id) ? id[0] : id
  })

  // Mode determination
  const mode = ref<Mode>('view')

  // Determine mode from route
  if (itemId.value === 'new') {
    mode.value = 'create'
  }

  // Resource data
  const item = computed(() => itemStore.currentItem)
  const partnersList = computed(() => partnerStore.allPartners)
  const projects = computed(() => projectStore.projects)

  const types = Object.entries(StoreItemRequestTypeEnum).map(([key, value]) => ({
    id: key,
    internal_name: value,
  }))

  const partners = Object.entries(StorePartnerRequestTypeEnum).map(([key, value]) => ({
    id: key,
    internal_name: value,
  }))

  // Edit form state
  const editForm = ref<ItemFormData>({
    id: '',
    internal_name: '',
    type: '',
    partner_id: '',
    project_id: '',
    backward_compatibility: '',
  })

  // Navigation
  const backLink = computed(() => ({
    title: 'Back to Items',
    route: '/items',
    icon: ArrowLeftIcon,
    color: 'blue',
  }))

  // Information description
  const informationDescription = computed(() => {
    if (mode.value === 'create') {
      return 'Enter the item details below.'
    }
    return 'Item details and metadata.'
  })

  // Unsaved changes tracking
  const hasUnsavedChanges = computed(() => {
    if (mode.value === 'view') return false
    if (mode.value === 'create') {
      return editForm.value.internal_name.trim() !== ''
    }
    if (!item.value) return false
    return (
      editForm.value.internal_name !== item.value.internal_name ||
      editForm.value.backward_compatibility !== (item.value.backward_compatibility || '')
    )
  })

  // Methods
  const fetchItem = async (): Promise<void> => {
    if (mode.value === 'create') return
    if (!itemId.value || itemId.value === 'new') return
    await itemStore.fetchItem(
      itemId.value,
      'partner, project, country, collection, artists, workshops, tags, itemImages'
    )
  }

  const enterEditMode = (): void => {
    if (!item.value) return
    const matchType = types.find(t => t.internal_name === item.value?.type)
    const matchPartner = partners.find(p => p.internal_name === item.value?.partner?.internal_name)
    const matchProject = projects.value.find(
      p => p.internal_name === item.value?.project?.internal_name
    )
    editForm.value = {
      id: item.value.id,
      internal_name: item.value.internal_name,
      type: matchType ? matchType.id : (item.value.type as StoreItemRequestTypeEnum),
      partner_id: matchPartner
        ? matchPartner.id
        : (item.value.partner?.id as StorePartnerRequestTypeEnum),
      project_id: matchProject ? matchProject.id : item.value.project?.id || '',
      backward_compatibility: item.value.backward_compatibility || '',
    }
    mode.value = 'edit'
  }

  const saveItem = async (): Promise<void> => {
    try {
      loadingStore.show('Saving...')
      if (mode.value === 'create') {
        const createData: StoreItemRequest = {
          id: editForm.value.id,
          internal_name: editForm.value.internal_name,
          type: editForm.value.type as StoreItemRequestTypeEnum,
          partner_id: editForm.value.partner_id as StorePartnerRequestTypeEnum,
          project_id: editForm.value.project_id,
          backward_compatibility: editForm.value.backward_compatibility || undefined,
        }
        const newItem = await itemStore.createItem(createData)
        if (newItem) {
          errorStore.addMessage('info', 'Item created successfully.')
          await router.push(`/items/${newItem.id}`)
          mode.value = 'view'
        }
      } else if (mode.value === 'edit' && item.value) {
        const updateData: UpdateItemRequest = {
          internal_name: editForm.value.internal_name,
          backward_compatibility: editForm.value.backward_compatibility || undefined,
        }
        const updatedItem = await itemStore.updateItem(item.value.id, updateData)
        if (updatedItem) {
          errorStore.addMessage('info', 'Item updated successfully.')
          mode.value = 'view'
        }
      }
    } catch {
      errorStore.addMessage('error', 'Failed to save item. Please try again.')
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
          router.push('/items')
        } else {
          mode.value = 'view'
        }
      }
    } else if (mode.value === 'create') {
      router.push('/items')
    } else {
      mode.value = 'view'
    }
  }

  const deleteItem = async (): Promise<void> => {
    if (!item.value) return
    const result = await deleteConfirmationStore.trigger(
      'Delete Item',
      `Are you sure you want to delete "${item.value.internal_name}"? This action cannot be undone.`
    )
    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await itemStore.deleteItem(item.value.id)
        errorStore.addMessage('info', 'Item deleted successfully.')
        await router.push('/items')
      } catch {
        errorStore.addMessage('error', 'Failed to delete item. Please try again.')
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
        partner_id: '',
        project_id: '',
        backward_compatibility: '',
      }
    } else {
      await fetchItem()
    }
    // Load partners for selection
    try {
      await partnerStore.fetchAllPartners()
    } catch {
      // swallow - errorStore will display via the partner store error handling
    }
    // Load projects for selection
    try {
      await projectStore.fetchAllProjects()
    } catch {
      // swallow - errorStore will display via the project store error handling
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
          partner_id: '',
          project_id: '',
          backward_compatibility: '',
        }
      } else if (typeof newId === 'string') {
        mode.value = 'view'
        await fetchItem()
      }
    }
  )

  // Update edit form when item data changes
  watch(
    item,
    newItem => {
      if (newItem && mode.value === 'view') {
        editForm.value = {
          id: newItem.id,
          internal_name: newItem.internal_name,
          type: newItem.type as StoreItemRequestTypeEnum,
          partner_id: newItem.partner?.id as StorePartnerRequestTypeEnum,
          project_id: newItem.project?.id || '',
          backward_compatibility: newItem.backward_compatibility || '',
        }
      }
    },
    { immediate: true }
  )
</script>
