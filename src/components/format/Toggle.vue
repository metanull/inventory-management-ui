<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div
            :class="['w-8 h-8 rounded-full flex items-center justify-center', iconBackgroundClass]"
          >
            <component :is="iconComponent" :class="['w-5 h-5', iconClass]" />
          </div>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">{{ title }}</dt>
            <dd class="text-lg font-medium text-gray-900">
              {{ statusText }}
            </dd>
          </dl>
        </div>
        <div v-if="!hideSwitch" class="ml-5 flex-shrink-0">
          <div class="flex items-center space-x-3">
            <span v-if="loading" class="text-sm text-gray-500">Updating...</span>
            <button
              type="button"
              :disabled="disabled || loading"
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                isActive ? 'bg-indigo-600' : 'bg-gray-200',
              ]"
              :aria-pressed="isActive"
              :aria-label="`Toggle ${title.toLowerCase()}`"
              @click="!disabled && !loading && $emit('toggle')"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  isActive ? 'translate-x-5' : 'translate-x-0',
                ]"
              >
                <span
                  :class="[
                    'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out',
                    isActive ? 'opacity-0' : 'opacity-100',
                  ]"
                  aria-hidden="true"
                >
                  <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                    <path
                      d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span
                  :class="[
                    'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out',
                    isActive ? 'opacity-100' : 'opacity-0',
                  ]"
                  aria-hidden="true"
                >
                  <svg class="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                    <path
                      d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
                    />
                  </svg>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, type Component } from 'vue'

  const props = defineProps<{
    title: string
    statusText: string
    isActive: boolean
    disabled?: boolean
    loading?: boolean
    hideSwitch?: boolean
    activeIconBackgroundClass: string
    inactiveIconBackgroundClass: string
    activeIconClass: string
    inactiveIconClass: string
    activeIconComponent: Component
    inactiveIconComponent: Component
  }>()

  defineEmits<{
    toggle: []
  }>()

  // Computed properties for dynamic classes and content
  const iconBackgroundClass = computed(() =>
    props.isActive ? props.activeIconBackgroundClass : props.inactiveIconBackgroundClass
  )

  const iconClass = computed(() =>
    props.isActive ? props.activeIconClass : props.inactiveIconClass
  )

  const iconComponent = computed(() =>
    props.isActive ? props.activeIconComponent : props.inactiveIconComponent
  )
</script>
