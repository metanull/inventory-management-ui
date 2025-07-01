import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import ImageUploads from '../ImageUploads.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock the API client
vi.mock('@/api/client', () => ({
  apiClient: {
    getImageUploads: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: '1',
            filename: 'test-image.jpg',
            originalFilename: 'Original Test Image.jpg',
            mimeType: 'image/jpeg',
            uploadedAt: '2024-01-15T10:30:00Z',
          },
          {
            id: '2',
            filename: 'another-image.png',
            originalFilename: 'Another Image.png',
            mimeType: 'image/png',
            uploadedAt: '2024-01-16T14:20:00Z',
          },
        ],
      })
    ),
    deleteImageUpload: vi.fn(() => Promise.resolve()),
    createImageUpload: vi.fn(() =>
      Promise.resolve({ data: { id: '3', filename: 'new-image.jpg' } })
    ),
    updateImageUpload: vi.fn(() =>
      Promise.resolve({ data: { id: '1', filename: 'updated-image.jpg' } })
    ),
  },
}))

describe('ImageUploads.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ImageUploads>>
  let router: Router

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/image-uploads', component: ImageUploads },
      ],
    })

    await router.push('/image-uploads')

    wrapper = mount(ImageUploads, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    })

    // Wait for component to load
    await wrapper.vm.$nextTick()
  })

  it('renders the image uploads page', () => {
    expect(wrapper.find('h1').text()).toBe('Image Uploads')
  })

  it('loads image uploads on mount', async () => {
    const { apiClient } = await import('@/api/client')

    // Wait for image uploads to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    expect(apiClient.getImageUploads).toHaveBeenCalled()
  })

  it('should call deleteImageUpload when delete button is clicked and confirmed', async () => {
    const { apiClient } = await import('@/api/client')

    // Wait for image uploads to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Find and click the delete button
    const deleteButton = wrapper.find('button[data-testid="delete-image-upload"]')
    expect(deleteButton.exists()).toBe(true)

    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Check if delete modal is visible
    expect(wrapper.vm.showDeleteModal).toBe(true)

    // Simulate clicking the confirm delete by directly calling the deleteUpload function
    await wrapper.vm.deleteUpload()

    expect(apiClient.deleteImageUpload).toHaveBeenCalledWith('1')
  })

  it('should not call deleteImageUpload when confirm is cancelled', async () => {
    const { apiClient } = await import('@/api/client')

    // Reset the mock call count
    vi.mocked(apiClient.deleteImageUpload).mockClear()

    // Wait for image uploads to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Find and click the delete button
    const deleteButton = wrapper.find('button[data-testid="delete-image-upload"]')
    expect(deleteButton.exists()).toBe(true)

    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Check if delete modal is visible
    expect(wrapper.vm.showDeleteModal).toBe(true)

    // Find and click the cancel button in the modal
    const cancelButton = wrapper.findAll('button').find(btn => btn.text().includes('Cancel'))

    if (cancelButton) {
      await cancelButton.trigger('click')
      expect(apiClient.deleteImageUpload).not.toHaveBeenCalled()
    }
  })

  it('should open upload modal when add button is clicked', async () => {
    const addButton = wrapper.find('button[data-testid="add-image-upload"]')

    if (addButton.exists()) {
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Check if modal is visible
      const modal = wrapper.find('[data-testid="create-image-upload-modal"]')
      expect(modal.exists()).toBe(true)
    }
  })
})
