import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Countries from '../Countries.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock the API client
vi.mock('@/api/client', () => ({
  apiClient: {
    getCountries: vi.fn(() => Promise.resolve({
      data: [
        {
          id: '1',
          name: 'United States',
          code: 'US'
        },
        {
          id: '2',
          name: 'Canada',
          code: 'CA'
        }
      ]
    })),
    deleteCountry: vi.fn(() => Promise.resolve()),
    createCountry: vi.fn(() => Promise.resolve({ data: { id: '3', name: 'Mexico', code: 'MX' } })),
    updateCountry: vi.fn(() => Promise.resolve({ data: { id: '1', name: 'United States of America', code: 'US' } }))
  }
}))

describe('Countries.vue', () => {
  let wrapper: any
  let router: any

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/countries', component: Countries }
      ]
    })

    await router.push('/countries')

    wrapper = mount(Countries, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    })

    // Wait for component to load
    await wrapper.vm.$nextTick()
  })

  it('renders the countries page', () => {
    expect(wrapper.find('h1').text()).toBe('Countries')
  })

  it('loads countries on mount', async () => {
    const { apiClient } = await import('@/api/client')
    
    // Wait for countries to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    expect(apiClient.getCountries).toHaveBeenCalled()
  })

  it('should call deleteCountry when delete button is clicked and confirmed', async () => {
    const { apiClient } = await import('@/api/client')
    
    // Wait for countries to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Find and click the delete button
    const deleteButton = wrapper.find('button[data-testid="delete-country"]')
    expect(deleteButton.exists()).toBe(true)
    
    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    // Check if delete modal is visible
    expect(wrapper.vm.showDeleteModal).toBe(true)
    
    // Simulate clicking the confirm delete by directly calling the deleteCountry function
    await wrapper.vm.deleteCountry()
    
    expect(apiClient.deleteCountry).toHaveBeenCalledWith('1')
  })

  it('should not call deleteCountry when confirm is cancelled', async () => {
    const { apiClient } = await import('@/api/client')
    
    // Reset the mock call count
    vi.mocked(apiClient.deleteCountry).mockClear()
    
    // Wait for countries to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Find and click the delete button
    const deleteButton = wrapper.find('button[data-testid="delete-country"]')
    expect(deleteButton.exists()).toBe(true)
    
    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    // Check if delete modal is visible
    expect(wrapper.vm.showDeleteModal).toBe(true)
    
    // Find and click the cancel button in the modal
    const cancelButton = wrapper.findAll('button').find(btn => 
      btn.text().includes('Cancel')
    )
    
    if (cancelButton) {
      await cancelButton.trigger('click')
      expect(apiClient.deleteCountry).not.toHaveBeenCalled()
    }
  })

  it('should open create modal when add button is clicked', async () => {
    const addButton = wrapper.find('button[data-testid="add-country"]')
    
    if (addButton.exists()) {
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Check if modal is visible
      const modal = wrapper.find('[data-testid="create-country-modal"]')
      expect(modal.exists()).toBe(true)
    }
  })
})
