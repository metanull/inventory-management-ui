<template>
  <div class="flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <TableElement>
            <template #headers>
              <slot name="headers" />
            </template>
            <template #rows>
              <slot name="rows" />
            </template>
          </TableElement>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import TableElement from './table/TableElement.vue'
</script>
