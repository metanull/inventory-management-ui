<template>
  <div class="bg-white shadow" :class="{ 'border-l-4 border-blue-500': isEditing }">
    <div class="px-4 py-5 sm:px-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ internalName }}
            <span v-if="isEditing" class="text-sm font-normal text-blue-600 ml-2">(Editing)</span>
          </h1>
          <p v-if="backwardCompatibility" class="text-sm text-gray-500">
            Legacy ID: {{ backwardCompatibility }}
          </p>
        </div>
        <div class="flex space-x-3">
          <template v-if="!isEditing">
            <EditButton @click="$emit('edit')" />
            <DeleteButton @click="$emit('delete')" />
          </template>
          <template v-else>
            <SaveButton :loading="saveLoading" @click="$emit('save')" />
            <CancelButton @click="$emit('cancel')" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import EditButton from '@/components/actions/detail/EditButton.vue'
  import DeleteButton from '@/components/actions/detail/DeleteButton.vue'
  import SaveButton from '@/components/actions/detail/SaveButton.vue'
  import CancelButton from '@/components/actions/detail/CancelButton.vue'

  defineProps<{
    internalName: string
    backwardCompatibility?: string | null
    isEditing: boolean
    saveLoading?: boolean
  }>()

  defineEmits<{
    edit: []
    delete: []
    save: []
    cancel: []
  }>()
</script>
