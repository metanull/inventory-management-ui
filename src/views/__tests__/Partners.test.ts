import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Partners from '../Partners.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock the API client
vi.mock('@/api/client', () => ({
  apiClient: {
    getPartners: vi.fn(() => Promise.resolve({
      data: [
        {
          id: '1',
          internal_name: 'Test Partner',
          type: 'museum',
          country: null
        }
      ]
    })),
    deletePartner: vi.fn(() => Promise.resolve()),
    createPartner: vi.fn(() => Promise.resolve({ data: {} })),
    updatePartner: vi.fn(() => Promise.resolve({ data: {} }))
  }
}))

describe('Partners.vue', () => {
  let wrapper: any
  let router: any

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/partners', component: Partners }
      ]
    })

    await router.push('/partners')

    wrapper = mount(Partners, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    })

    // Wait for component to load
    await wrapper.vm.$nextTick()
  })

  it('should call deletePartner when delete button is clicked', async () => {
    const { apiClient } = await import('@/api/client')
    
    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    
    // Wait for partners to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Find and click the delete button
    const deleteButtons = wrapper.findAll('button')
    const deleteButton = deleteButtons.find(btn => btn.text().includes('Delete'))
    expect(deleteButton).toBeDefined()
    
    await deleteButton!.trigger('click')
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this partner?')
    expect(apiClient.deletePartner).toHaveBeenCalledWith('1')
    
    confirmSpy.mockRestore()
  })

  it('should not call deletePartner when confirm is cancelled', async () => {
    const { apiClient } = await import('@/api/client')
    
    // Reset the mock call count
    vi.mocked(apiClient.deletePartner).mockClear()
    
    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    
    // Wait for partners to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Find and click the delete button
    const deleteButtons = wrapper.findAll('button')
    const deleteButton = deleteButtons.find(btn => btn.text().includes('Delete'))
    await deleteButton!.trigger('click')
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this partner?')
    expect(apiClient.deletePartner).not.toHaveBeenCalled()
    
    confirmSpy.mockRestore()
  })
})
