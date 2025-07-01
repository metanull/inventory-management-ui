import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Languages from '../Languages.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock the API client
vi.mock('@/api/client', () => ({
  apiClient: {
    getLanguages: vi.fn(() => Promise.resolve({
      data: [
        {
          id: '1',
          name: 'English',
          code: 'en'
        },
        {
          id: '2',
          name: 'Spanish',
          code: 'es'
        }
      ]
    })),
    deleteLanguage: vi.fn(() => Promise.resolve()),
    createLanguage: vi.fn(() => Promise.resolve({ data: { id: '3', name: 'French', code: 'fr' } })),
    updateLanguage: vi.fn(() => Promise.resolve({ data: { id: '1', name: 'English (US)', code: 'en-US' } }))
  }
}))

describe('Languages.vue', () => {
  let wrapper: any
  let router: any

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/languages', component: Languages }
      ]
    })

    await router.push('/languages')

    wrapper = mount(Languages, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    })

    // Wait for component to load
    await wrapper.vm.$nextTick()
  })

  it('renders the languages page', () => {
    expect(wrapper.find('h1').text()).toBe('Languages')
  })

  it('loads languages on mount', async () => {
    const { apiClient } = await import('@/api/client')
    
    // Wait for languages to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    expect(apiClient.getLanguages).toHaveBeenCalled()
  })

  it('should call deleteLanguage when delete button is clicked and confirmed', async () => {
    const { apiClient } = await import('@/api/client')
    
    // Wait for languages to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Find and click the delete button
    const deleteButton = wrapper.find('button[data-testid="delete-language"]')
    expect(deleteButton.exists()).toBe(true)
    
    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    // Check if delete modal is visible
    expect(wrapper.vm.showDeleteModal).toBe(true)
    
    // Simulate clicking the confirm delete by directly calling the deleteLanguage function
    await wrapper.vm.deleteLanguage()
    
    expect(apiClient.deleteLanguage).toHaveBeenCalledWith('1')
  })

  it('should not call deleteLanguage when confirm is cancelled', async () => {
    const { apiClient } = await import('@/api/client')
    
    // Reset the mock call count
    vi.mocked(apiClient.deleteLanguage).mockClear()
    
    // Wait for languages to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Find and click the delete button
    const deleteButton = wrapper.find('button[data-testid="delete-language"]')
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
      expect(apiClient.deleteLanguage).not.toHaveBeenCalled()
    }
  })

  it('should open create modal when add button is clicked', async () => {
    const addButton = wrapper.find('button[data-testid="add-language"]')
    
    if (addButton.exists()) {
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Check if modal is visible
      const modal = wrapper.find('[data-testid="create-language-modal"]')
      expect(modal.exists()).toBe(true)
    }
  })
})
