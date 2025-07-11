<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-base leading-6 font-medium text-gray-700">System Properties</h3>
      <p class="mt-1 max-w-2xl text-xs text-gray-400">Internal system data managed by the API.</p>
    </div>
    <div class="border-t border-gray-200">
      <dl>
        <div class="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-xs font-medium text-gray-400 uppercase tracking-wide">ID</dt>
          <dd class="mt-1 sm:mt-0 sm:col-span-2">
            <UuidDisplay :uuid="id" format="long" class="text-xs text-gray-600" />
          </dd>
        </div>
        <div class="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-xs font-medium text-gray-400 uppercase tracking-wide">Created</dt>
          <dd class="mt-1 sm:mt-0 sm:col-span-2">
            <DateDisplay
              :date="createdAt"
              format="medium"
              show-time
              class="text-xs text-gray-600"
            />
          </dd>
        </div>
        <div class="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-xs font-medium text-gray-400 uppercase tracking-wide">Last Updated</dt>
          <dd class="mt-1 sm:mt-0 sm:col-span-2">
            <DateDisplay
              :date="updatedAt"
              format="medium"
              show-time
              class="text-xs text-gray-600"
            />
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
  import DateDisplay from '@/components/DateDisplay.vue'
  import UuidDisplay from '@/components/UuidDisplay.vue'

  defineProps<{
    id: string
    createdAt: string | null
    updatedAt: string | null
  }>()
</script>
