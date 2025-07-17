<template>
  <div>
    <!-- Initial Loading State (for first load) -->
    <LoadingSpinner v-if="loading" />

    <!-- Error State -->
    <ErrorDisplay v-else-if="error" :error="error" @retry="handleRetry" />

    <!-- Detail Content -->
    <div v-else-if="resource || isCreating" class="relative space-y-6">
      <!-- Action Loading Overlay (for status toggles, etc.) -->
      <div
        v-if="actionLoading"
        class="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 rounded-lg"
      >
        <div class="bg-white rounded-lg p-4 shadow-lg">
          <LoadingSpinner />
        </div>
      </div>

      <!-- Header -->
      <DetailViewHeader
        :internal-name="headerTitle"
        :backward-compatibility="resource?.backward_compatibility || null"
        :is-editing="isEditing || (isCreating ?? false)"
        :is-creating="isCreating ?? false"
        :save-loading="saveLoading"
        :save-disabled="isSaveDisabled"
        :back-link="backLink"
        @edit="$emit('edit')"
        @delete="$emit('delete')"
        @save="$emit('save')"
        @cancel="handleCancel"
      />

      <!-- Status Cards (hidden during creation) -->
      <div
        v-if="statusCards && statusCards.length > 0 && !isCreating"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2"
        :class="{ 'opacity-50 pointer-events-none': isEditing || actionLoading }"
      >
        <StatusCard
          v-for="(card, index) in statusCards"
          :key="index"
          :title="card.title"
          :description="card.description"
          :main-color="card.mainColor"
          :status-text="card.statusText"
          :toggle-title="card.toggleTitle"
          :is-active="card.isActive"
          :loading="card.loading"
          :disabled="card.disabled || actionLoading"
          :active-icon-background-class="card.activeIconBackgroundClass"
          :inactive-icon-background-class="card.inactiveIconBackgroundClass"
          :active-icon-class="card.activeIconClass"
          :inactive-icon-class="card.inactiveIconClass"
          :active-icon-component="card.activeIconComponent"
          :inactive-icon-component="card.inactiveIconComponent"
          @toggle="$emit('statusToggle', index)"
        />
      </div>

      <!-- Information Section (Slot) -->
      <div
        class="bg-white shadow overflow-hidden sm:rounded-lg"
        :class="{ 'opacity-50 pointer-events-none': actionLoading }"
      >
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">{{ informationTitle }}</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            {{ informationDescription }}
          </p>
        </div>
        <div class="border-t border-gray-200">
          <slot name="information" :on-field-change="handleFieldChange" />
        </div>
      </div>

      <!-- System Properties (hidden during creation) -->
      <div v-if="!isCreating" :class="{ 'opacity-50 pointer-events-none': actionLoading }">
        <SystemProperties
          :id="resource?.id || ''"
          :created-at="resource?.created_at || ''"
          :updated-at="resource?.updated_at || ''"
        />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      :show="showDeleteModal"
      :title="deleteModalTitle"
      :message="deleteModalMessage"
      :loading="deleteLoading"
      @confirm="$emit('confirmDelete')"
      @cancel="$emit('cancelDelete')"
    />

    <!-- Unsaved Changes Modal -->
    <UnsavedChangesModal
      :show="showUnsavedChangesModal"
      @confirm="handleConfirmLeave"
      @cancel="handleCancelLeave"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch, type Component } from 'vue'
  import {
    onBeforeRouteLeave,
    type NavigationGuardNext,
    type RouteLocationNormalized,
  } from 'vue-router'
  import LoadingSpinner from '@/components/layout/modals/LoadingSpinner.vue'
  import ErrorDisplay from '@/components/layout/app/ErrorDisplay.vue'
  import DetailViewHeader from '@/components/layout/detail/DetailViewHeader.vue'
  import StatusCard from '@/components/format/card/StatusCard.vue'
  import SystemProperties from '@/components/layout/detail/SystemProperties.vue'
  import DeleteConfirmationModal from '@/components/layout/modals/DeleteConfirmationModal.vue'
  import UnsavedChangesModal from '@/components/layout/modals/UnsavedChangesModal.vue'

  interface StatusCardConfig {
    title: string
    description: string
    mainColor: string
    statusText: string
    toggleTitle: string
    isActive: boolean
    loading: boolean
    disabled?: boolean
    activeIconBackgroundClass: string
    inactiveIconBackgroundClass: string
    activeIconClass: string
    inactiveIconClass: string
    activeIconComponent: Component
    inactiveIconComponent: Component
  }

  interface Resource {
    id: string
    internal_name: string
    backward_compatibility?: string | null
    created_at: string | null
    updated_at: string | null
  }

  const props = defineProps<{
    // Loading states
    storeLoading?: boolean // Store's internal loading state (optional)
    error: any
    resource: Resource | null

    // Edit states
    isEditing: boolean
    isCreating?: boolean // New prop to support creation mode
    saveLoading?: boolean
    actionLoading?: boolean
    hasUnsavedChanges?: boolean // New prop to track unsaved changes

    // Creation mode customization
    createTitle?: string // Custom title for creation mode
    createSubtitle?: string // Custom subtitle for creation mode

    // Navigation
    backLink?: {
      title: string
      route: string
      icon: any
      color?: string
    }

    // Configuration
    statusCards?: StatusCardConfig[]
    informationTitle: string
    informationDescription: string

    // Modal states
    showDeleteModal: boolean
    deleteModalTitle: string
    deleteModalMessage: string
    deleteLoading?: boolean

    // Fetch function for initial load
    fetchData: () => Promise<void>
  }>()

  const emit = defineEmits<{
    retry: []
    edit: []
    delete: []
    save: []
    cancel: []
    statusToggle: [index: number]
    confirmDelete: []
    cancelDelete: []
    unsavedChanges: [hasChanges: boolean] // New emit for parent to notify of changes
  }>()

  // Internal loading state for initial page load
  const initialLoading = ref(false)

  // Unsaved changes modal state
  const showUnsavedChangesModal = ref(false)
  const pendingNavigation = ref<(() => void) | null>(null)
  const pendingDestination = ref<RouteLocationNormalized | null>(null)
  const isCancelInProgress = ref(false)

  // Computed loading state - prioritize initial loading over store loading
  const loading = computed(
    () => initialLoading.value || (props.storeLoading && !props.resource && !props.isCreating)
  )

  // Disable save button if no unsaved changes
  const isSaveDisabled = computed(() => !props.hasUnsavedChanges)

  // Header title - use custom title for creation mode or resource name
  const headerTitle = computed(() => {
    if (props.isCreating) {
      return props.createTitle || 'New Record'
    }
    return props.resource?.internal_name || ''
  })

  // Browser beforeunload event handler
  const handleBeforeUnload = (event: Event) => {
    if ((props.isEditing || props.isCreating) && props.hasUnsavedChanges) {
      event.preventDefault()
      // Modern browsers show a generic message, but we still need to set returnValue
      Object.assign(event, { returnValue: '' })
      return ''
    }
  }

  // Navigation guard to prevent leaving with unsaved changes
  onBeforeRouteLeave(
    (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
      // If modal is already shown or we have a pending navigation, don't interfere
      if (showUnsavedChangesModal.value || pendingNavigation.value) {
        next(false)
        return
      }

      // If cancel is in progress, allow navigation without showing modal
      if (isCancelInProgress.value) {
        isCancelInProgress.value = false // Reset the flag
        next()
        return
      }

      if ((props.isEditing || props.isCreating) && props.hasUnsavedChanges) {
        showUnsavedChangesModal.value = true
        pendingDestination.value = to
        pendingNavigation.value = () => next()
        next(false) // Prevent navigation
      } else {
        next() // Allow navigation
      }
    }
  )

  // Watch for editing/creating state changes to add/remove beforeunload listener
  watch(
    () => props.isEditing || props.isCreating,
    (isEditingOrCreating: boolean) => {
      if (isEditingOrCreating) {
        window.addEventListener('beforeunload', handleBeforeUnload)
      } else {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    },
    { immediate: true }
  )

  // Clean up event listener on unmount
  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  // Handle confirmation to leave without saving
  const handleConfirmLeave = () => {
    showUnsavedChangesModal.value = false
    const navigationCallback = pendingNavigation.value

    // Reset immediately to prevent multiple calls
    pendingNavigation.value = null
    pendingDestination.value = null

    if (navigationCallback) {
      // Use the original navigation callback which calls next()
      navigationCallback()
    }
  }

  // Handle cancellation of leaving
  const handleCancelLeave = () => {
    showUnsavedChangesModal.value = false
    pendingNavigation.value = null // Clear the pending navigation
    pendingDestination.value = null // Clear the pending destination
  }

  // Handle field changes from child components
  const handleFieldChange = () => {
    emit('unsavedChanges', true)
  }

  // Handle cancel action - bypass unsaved changes modal
  const handleCancel = () => {
    isCancelInProgress.value = true
    emit('cancel')
  }

  // Fetch data on mount
  onMounted(async () => {
    if (!props.resource && !props.isCreating) {
      initialLoading.value = true
      try {
        await props.fetchData()
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        initialLoading.value = false
      }
    }
  })

  // Retry function that uses internal loading state
  const handleRetry = async () => {
    initialLoading.value = true
    try {
      await props.fetchData()
      emit('retry')
    } catch (error) {
      console.error('Failed to retry data fetch:', error)
    } finally {
      initialLoading.value = false
    }
  }
</script>
