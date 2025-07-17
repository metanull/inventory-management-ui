import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingOverlayStore = defineStore('loadingOverlay', () => {
  const visible = ref<boolean>(false)
  const disabled = ref<boolean>(false)

  const show = (): void => {
    if (!disabled.value) {
      visible.value = true
    }
  }

  const hide = (): void => {
    visible.value = false
  }

  const disable = (): void => {
    disabled.value = true
    visible.value = false
  }

  const enable = (): void => {
    disabled.value = false
  }

  return {
    // State
    visible,
    disabled,
    // Actions
    show,
    hide,
    disable,
    enable,
  }
})
