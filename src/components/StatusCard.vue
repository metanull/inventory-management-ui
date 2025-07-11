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
        <div v-if="!hideButton" class="ml-5 flex-shrink-0">
          <button
            :disabled="disabled || loading"
            :class="[
              'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
              buttonClass,
            ]"
            @click="!disabled && !loading && $emit('toggle')"
          >
            {{ buttonText }}
          </button>
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
    hideButton?: boolean
    buttonText: string
    activeIconBackgroundClass: string
    inactiveIconBackgroundClass: string
    activeIconClass: string
    inactiveIconClass: string
    activeButtonClass: string
    inactiveButtonClass: string
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

  const buttonClass = computed(() =>
    props.isActive ? props.activeButtonClass : props.inactiveButtonClass
  )

  const iconComponent = computed(() =>
    props.isActive ? props.activeIconComponent : props.inactiveIconComponent
  )
</script>
