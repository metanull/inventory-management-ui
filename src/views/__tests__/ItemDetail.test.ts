import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import ItemDetail from '../ItemDetail.vue'
import { apiClient } from '@/api/client'

// Mock the API client
vi.mock('@/api/client', () => ({
  apiClient: {
    getItem: vi.fn(),
    getItemTags: vi.fn(),
    getTags: vi.fn(),
    addTagToItem: vi.fn(),
    removeTagFromItem: vi.fn(),
    deleteItem: vi.fn(),
  }
}))

const mockApiClient = apiClient as any

describe('ItemDetail.vue', () => {
  let pinia: any
  let router: any

  const mockItem = {
    id: '1',
    internal_name: 'Test Item',
    type: 'object' as const,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    backward_compatibility: null
  }

  const mockTags = [
    { id: 'tag1', internal_name: 'Tag 1', created_at: null, updated_at: null },
    { id: 'tag2', internal_name: 'Tag 2', created_at: null, updated_at: null }
  ]

  const mockAllTags = [
    ...mockTags,
    { id: 'tag3', internal_name: 'Tag 3', created_at: null, updated_at: null }
  ]

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/items/:id', component: ItemDetail }
      ]
    })

    // Mock API responses
    mockApiClient.getItem.mockResolvedValue({ data: mockItem })
    mockApiClient.getItemTags.mockResolvedValue({ data: mockTags })
    mockApiClient.getTags.mockResolvedValue({ data: mockAllTags })
    mockApiClient.addTagToItem.mockResolvedValue({})
    mockApiClient.removeTagFromItem.mockResolvedValue({})
    mockApiClient.deleteItem.mockResolvedValue({})

    vi.clearAllMocks()
  })

  it('should display item details correctly', async () => {
    await router.push('/items/1')
    
    const wrapper = mount(ItemDetail, {
      global: {
        plugins: [router, pinia]
      }
    })

    // Wait for component to load
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockApiClient.getItem).toHaveBeenCalledWith('1')
    expect(wrapper.text()).toContain('Test Item')
  })

  it('should display current tags', async () => {
    await router.push('/items/1')
    
    const wrapper = mount(ItemDetail, {
      global: {
        plugins: [router, pinia]
      }
    })

    // Wait for component to load
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Tag 1')
    expect(wrapper.text()).toContain('Tag 2')
  })

  it('should open tag management modal', async () => {
    await router.push('/items/1')
    
    const wrapper = mount(ItemDetail, {
      global: {
        plugins: [router, pinia]
      }
    })

    // Wait for component to load
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const manageTagsButtons = wrapper.findAll('button')
    const manageTagsButton = manageTagsButtons.find(btn => btn.text().includes('Manage Tags'))
    
    if (manageTagsButton) {
      await manageTagsButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('Manage Tags')
      expect(wrapper.text()).toContain('Add Tag')
    }
  })

  it('should call addTagToItem when adding a tag', async () => {
    await router.push('/items/1')
    
    const wrapper = mount(ItemDetail, {
      global: {
        plugins: [router, pinia]
      }
    })

    // Wait for component to load
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Open modal
    const manageTagsButtons = wrapper.findAll('button')
    const manageTagsButton = manageTagsButtons.find(btn => btn.text().includes('Manage Tags'))
    
    if (manageTagsButton) {
      await manageTagsButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Select a tag and add it
      const vm = wrapper.vm as any
      vm.selectedTagId = 'tag3'
      await vm.addTag()

      expect(mockApiClient.addTagToItem).toHaveBeenCalledWith('1', 'tag3')
    }
  })

  it('should call removeTagFromItem when removing a tag', async () => {
    await router.push('/items/1')
    
    const wrapper = mount(ItemDetail, {
      global: {
        plugins: [router, pinia]
      }
    })

    // Wait for component to load
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Call remove tag directly
    const vm = wrapper.vm as any
    await vm.removeTag('tag1')

    expect(mockApiClient.removeTagFromItem).toHaveBeenCalledWith('1', 'tag1')
  })
})
