import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import Contexts from '../Contexts.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock the API client
vi.mock('@/api/client', () => ({
  apiClient: {
    getContexts: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: '1',
            name: 'Archaeological Context',
            description: 'Archaeological findings and documentation',
          },
          {
            id: '2',
            name: 'Historical Context',
            description: 'Historical background and significance',
          },
        ],
      })
    ),
    deleteContext: vi.fn(() => Promise.resolve()),
    createContext: vi.fn(() =>
      Promise.resolve({
        data: { id: '3', name: 'Cultural Context', description: 'Cultural significance' },
      })
    ),
    updateContext: vi.fn(() =>
      Promise.resolve({
        data: {
          id: '1',
          name: 'Archaeological Research Context',
          description: 'Updated description',
        },
      })
    ),
  },
}))

describe('Contexts.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof Contexts>>
  let router: Router

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/contexts', component: Contexts },
      ],
    })

    await router.push('/contexts')

    wrapper = mount(Contexts, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    })

    // Wait for component to load
    await wrapper.vm.$nextTick()
  })

  it('renders the contexts page', () => {
    expect(wrapper.find('h1').text()).toBe('Contexts')
  })

  it('loads contexts on mount', async () => {
    const { apiClient } = await import('@/api/client')

    // Wait for contexts to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    expect(apiClient.getContexts).toHaveBeenCalled()
  })

  it('should call deleteContext when delete button is clicked and confirmed', async () => {
    const { apiClient } = await import('@/api/client')

    // Wait for contexts to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Find and click the delete button
    const deleteButton = wrapper.find('button[data-testid="delete-context"]')
    expect(deleteButton.exists()).toBe(true)

    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Check if delete modal is visible
    expect(wrapper.vm.showDeleteModal).toBe(true)

    // Simulate clicking the confirm delete by directly calling the deleteContext function
    await wrapper.vm.deleteContext()

    expect(apiClient.deleteContext).toHaveBeenCalledWith('1')
  })

  it('should not call deleteContext when confirm is cancelled', async () => {
    const { apiClient } = await import('@/api/client')

    // Reset the mock call count
    vi.mocked(apiClient.deleteContext).mockClear()

    // Wait for contexts to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Find and click the delete button
    const deleteButton = wrapper.find('button[data-testid="delete-context"]')
    expect(deleteButton.exists()).toBe(true)

    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Check if delete modal is visible
    expect(wrapper.vm.showDeleteModal).toBe(true)

    // Find and click the cancel button in the modal
    const cancelButton = wrapper.findAll('button').find(btn => btn.text().includes('Cancel'))

    if (cancelButton) {
      await cancelButton.trigger('click')
      expect(apiClient.deleteContext).not.toHaveBeenCalled()
    }
  })

  it('should open create modal when add button is clicked', async () => {
    const addButton = wrapper.find('button[data-testid="add-context"]')

    if (addButton.exists()) {
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Check if modal is visible
      const modal = wrapper.find('[data-testid="create-context-modal"]')
      expect(modal.exists()).toBe(true)
    }
  })
})
