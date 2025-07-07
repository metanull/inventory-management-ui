<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Workshops</h1>
      <button
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        @click="openCreate = true"
      >
        <span class="mr-2"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            /></svg
        ></span>
        Add Workshop
      </button>
    </div>
    <div v-if="loading" class="flex justify-center py-8"><span class="loader"></span></div>
    <div v-else>
      <div v-if="error" class="text-red-600">{{ error }}</div>
      <table v-if="workshops.length" class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th class="px-4 py-2 text-left">Name</th>
            <th class="px-4 py-2 text-left">Internal Name</th>
            <th class="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="workshop in workshops" :key="workshop.id" class="hover:bg-gray-50">
            <td class="px-4 py-2">{{ workshop.name }}</td>
            <td class="px-4 py-2">{{ workshop.internal_name }}</td>
            <td class="px-4 py-2 space-x-2">
              <button class="text-blue-600 hover:underline" @click="editWorkshop(workshop)">
                Edit
              </button>
              <button class="text-red-600 hover:underline" @click="confirmDelete(workshop)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-gray-600">No workshops found.</div>
    </div>
    <!-- Create/Edit Modal -->
    <Dialog
      v-model="openCreate"
      :open="openCreate"
      as="div"
      class="fixed z-10 inset-0 overflow-y-auto"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <DialogOverlay class="fixed inset-0 bg-black opacity-30" />
        <div class="bg-white rounded-lg shadow-xl p-6 z-20 w-full max-w-md">
          <DialogTitle class="text-lg font-bold mb-4">{{
            editing ? 'Edit Workshop' : 'Add Workshop'
          }}</DialogTitle>
          <form @submit.prevent="submitWorkshop">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Name</label>
              <input v-model="form.name" required class="w-full border rounded px-3 py-2" />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Internal Name</label>
              <input v-model="form.internal_name" class="w-full border rounded px-3 py-2" />
            </div>
            <div class="flex justify-end space-x-2">
              <button type="button" class="px-4 py-2 bg-gray-200 rounded" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">
                {{ editing ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
    <!-- Delete Confirmation -->
    <Dialog
      v-model="openDelete"
      :open="openDelete"
      as="div"
      class="fixed z-10 inset-0 overflow-y-auto"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <DialogOverlay class="fixed inset-0 bg-black opacity-30" />
        <div class="bg-white rounded-lg shadow-xl p-6 z-20 w-full max-w-sm">
          <DialogTitle class="text-lg font-bold mb-4">Delete Workshop</DialogTitle>
          <p>
            Are you sure you want to delete <span class="font-semibold">{{ toDelete?.name }}</span
            >?
          </p>
          <div class="flex justify-end space-x-2 mt-6">
            <button class="px-4 py-2 bg-gray-200 rounded" @click="openDelete = false">
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-red-600 text-white rounded"
              @click="deleteWorkshopConfirmed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useWorkshopStore } from '@/stores/workshop'
  import { Dialog, DialogOverlay, DialogTitle } from '@headlessui/vue'

  const store = useWorkshopStore()
  const { workshops, loading, error, fetchWorkshops } = store

  const openCreate = ref(false)
  const openDelete = ref(false)
  const editing = ref(false)
  const toDelete = ref<any>(null)
  const form = ref({ id: '', name: '', internal_name: '' })

  onMounted(fetchWorkshops)

  function editWorkshop(workshop: any) {
    form.value = { ...workshop }
    editing.value = true
    openCreate.value = true
  }

  function closeModal() {
    openCreate.value = false
    editing.value = false
    form.value = { id: '', name: '', internal_name: '' }
  }

  async function submitWorkshop() {
    try {
      if (editing.value) {
        await store.updateWorkshop(form.value.id, form.value)
      } else {
        await store.createWorkshop(form.value)
      }
      await fetchWorkshops()
      closeModal()
    } catch (e: any) {
      alert(e.message || 'Failed to save workshop.')
    }
  }

  function confirmDelete(workshop: any) {
    toDelete.value = workshop
    openDelete.value = true
  }

  async function deleteWorkshopConfirmed() {
    if (!toDelete.value) return
    try {
      await store.deleteWorkshop(toDelete.value.id)
      await fetchWorkshops()
      openDelete.value = false
      toDelete.value = null
    } catch (e: any) {
      alert(e.message || 'Failed to delete workshop.')
    }
  }
</script>

<style scoped>
  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
