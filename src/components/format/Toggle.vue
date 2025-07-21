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
                  <XMarkIcon class="h-3 w-3 text-gray-400" />
                </span>
                <span
                  :class="[
                    'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out',
                    isActive ? 'opacity-100' : 'opacity-0',
                  ]"
                  aria-hidden="true"
                >
                  <CheckIcon class="h-3 w-3 text-indigo-600" />
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
  import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/solid'

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
