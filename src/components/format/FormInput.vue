<template>
  <select
    v-if="type === 'select'"
    :required="required"
    :disabled="disabled"
    :value="modelValue"
    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    @change="handleChange"
  >
    <option v-if="placeholder" value="" disabled>
      {{ placeholder }}
    </option>
    <option v-for="option in options" :key="option.id" :value="option.id">
      {{ option.internal_name }}
    </option>
  </select>

  <input
    v-else
    :type="type"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :value="modelValue"
    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
  /*global HTMLSelectElement*/

  interface Option {
    id: string
    internal_name: string
  }

  defineProps<{
    type?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    modelValue?: string
    options?: Option[]
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
  }

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    emit('update:modelValue', target.value)
  }
</script>
