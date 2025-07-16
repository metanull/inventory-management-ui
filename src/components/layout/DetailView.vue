<template>
  <div>
    <!-- Initial Loading State (for first load) -->
    <LoadingSpinner v-if="loading" />

    <!-- Error State -->
    <ErrorDisplay v-else-if="error" :error="error" @retry="handleRetry" />

    <!-- Detail Content -->
    <div v-else-if="resource" class="relative space-y-6">
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
        :internal-name="resource?.internal_name || ''"
        :backward-compatibility="resource?.backward_compatibility || null"
        :is-editing="isEditing"
        :save-loading="saveLoading"
        :save-disabled="isSaveDisabled"
        :back-link="backLink"
        @edit="$emit('edit')"
        @delete="$emit('delete')"
        @save="$emit('save')"
        @cancel="$emit('cancel')"
      />

      <!-- Status Cards -->
      <div
        v-if="statusCards && statusCards.length > 0"
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

      <!-- System Properties -->
      <div :class="{ 'opacity-50 pointer-events-none': actionLoading }">
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
  import ErrorDisplay from '@/components/layout/ErrorDisplay.vue'
  import DetailViewHeader from '@/components/layout/DetailViewHeader.vue'
  import StatusCard from '@/components/home/StatusCard.vue'
  import SystemProperties from '@/components/detail/SystemProperties.vue'
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
    saveLoading?: boolean
    actionLoading?: boolean
    hasUnsavedChanges?: boolean // New prop to track unsaved changes

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

  // Computed loading state - prioritize initial loading over store loading
  const loading = computed(() => initialLoading.value || (props.storeLoading && !props.resource))

  // Disable save button if no unsaved changes
  const isSaveDisabled = computed(() => !props.hasUnsavedChanges)

  // Browser beforeunload event handler
  const handleBeforeUnload = (event: Event) => {
    if (props.isEditing && props.hasUnsavedChanges) {
      event.preventDefault()
      // Modern browsers show a generic message, but we still need to set returnValue
      Object.assign(event, { returnValue: '' })
      return ''
    }
  }

  // Navigation guard to prevent leaving with unsaved changes
  onBeforeRouteLeave(
    (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
      if (props.isEditing && props.hasUnsavedChanges) {
        showUnsavedChangesModal.value = true
        pendingNavigation.value = () => next()
        next(false) // Prevent navigation
      } else {
        next() // Allow navigation
      }
    }
  )

  // Watch for editing state changes to add/remove beforeunload listener
  watch(
    () => props.isEditing,
    (isEditing: boolean) => {
      if (isEditing) {
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
    if (pendingNavigation.value) {
      pendingNavigation.value()
      pendingNavigation.value = null
    }
  }

  // Handle cancellation of leaving
  const handleCancelLeave = () => {
    showUnsavedChangesModal.value = false
    pendingNavigation.value = null
  }

  // Handle field changes from child components
  const handleFieldChange = () => {
    emit('unsavedChanges', true)
  }

  // Fetch data on mount
  onMounted(async () => {
    if (!props.resource) {
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
