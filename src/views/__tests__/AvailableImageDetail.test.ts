import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AvailableImageDetail from '../AvailableImageDetail.vue'
import { apiClient } from '@/api/client'

// Mock the API client
vi.mock('@/api/client', () => ({
  apiClient: {
    getAvailableImage: vi.fn(),
    updateAvailableImage: vi.fn(),
    deleteAvailableImage: vi.fn(),
    downloadAvailableImage: vi.fn(),
    viewAvailableImage: vi.fn(),
  },
}))

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/available-images', component: { template: '<div>List</div>' } },
    { path: '/available-images/:id', component: AvailableImageDetail },
  ],
})

// Mock window.confirm
// eslint-disable-next-line no-undef
global.confirm = vi.fn()

describe('AvailableImageDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', async () => {
    const mockGetAvailableImage = vi.mocked(apiClient.getAvailableImage)
    mockGetAvailableImage.mockReturnValue(new Promise(() => {})) // Never resolves

    await router.push('/available-images/test-id')

    const wrapper = mount(AvailableImageDetail, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Loading...')
  })

  it('should display available image details with preview', async () => {
    const mockImage = {
      id: 'test-id',
      path: '/path/to/image.jpg',
      comment: 'Test comment',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    }

    const mockGetAvailableImage = vi.mocked(apiClient.getAvailableImage)
    const mockViewAvailableImage = vi.mocked(apiClient.viewAvailableImage)

    mockGetAvailableImage.mockResolvedValue({ data: mockImage })
    mockViewAvailableImage.mockResolvedValue('data:image/jpeg;base64,mockImageData')

    await router.push('/available-images/test-id')

    const wrapper = mount(AvailableImageDetail, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(mockGetAvailableImage).toHaveBeenCalledWith('test-id')
    expect(mockViewAvailableImage).toHaveBeenCalledWith('test-id')
    expect(wrapper.text()).toContain('/path/to/image.jpg')
    expect(wrapper.text()).toContain('Test comment')
  })

  it('should handle API errors gracefully', async () => {
    const mockGetAvailableImage = vi.mocked(apiClient.getAvailableImage)
    mockGetAvailableImage.mockRejectedValue(new Error('API Error'))

    await router.push('/available-images/test-id')

    const wrapper = mount(AvailableImageDetail, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('API Error')
  })

  it('should handle image preview loading errors', async () => {
    const mockImage = {
      id: 'test-id',
      path: '/path/to/image.jpg',
      comment: 'Test comment',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    }

    const mockGetAvailableImage = vi.mocked(apiClient.getAvailableImage)
    const mockViewAvailableImage = vi.mocked(apiClient.viewAvailableImage)

    mockGetAvailableImage.mockResolvedValue({ data: mockImage })
    mockViewAvailableImage.mockRejectedValue(new Error('Image loading failed'))

    await router.push('/available-images/test-id')

    const wrapper = mount(AvailableImageDetail, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(console.error).toHaveBeenCalledWith('Failed to load image preview:', expect.any(Error))
    expect(wrapper.text()).toContain('Failed to load image')
  })

  it('should enter edit mode when edit button is clicked', async () => {
    const mockImage = {
      id: 'test-id',
      path: '/path/to/image.jpg',
      comment: 'Test comment',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    }

    const mockGetAvailableImage = vi.mocked(apiClient.getAvailableImage)
    const mockViewAvailableImage = vi.mocked(apiClient.viewAvailableImage)

    mockGetAvailableImage.mockResolvedValue({ data: mockImage })
    mockViewAvailableImage.mockResolvedValue('data:image/jpeg;base64,mockImageData')

    await router.push('/available-images/test-id')

    const wrapper = mount(AvailableImageDetail, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const editButtons = wrapper.findAll('button')
    const editButton = editButtons.find(btn => btn.text() === 'Edit')
    expect(editButton).toBeDefined()

    await editButton!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Edit Available Image')
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('should save changes when form is submitted', async () => {
    const mockImage = {
      id: 'test-id',
      path: '/path/to/image.jpg',
      comment: 'Test comment',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    }

    const updatedImage = {
      ...mockImage,
      comment: 'Updated comment',
    }

    const mockGetAvailableImage = vi.mocked(apiClient.getAvailableImage)
    const mockUpdateAvailableImage = vi.mocked(apiClient.updateAvailableImage)
    const mockViewAvailableImage = vi.mocked(apiClient.viewAvailableImage)

    mockGetAvailableImage.mockResolvedValue({ data: mockImage })
    mockUpdateAvailableImage.mockResolvedValue({ data: updatedImage })
    mockViewAvailableImage.mockResolvedValue('data:image/jpeg;base64,mockImageData')

    await router.push('/available-images/test-id')

    const wrapper = mount(AvailableImageDetail, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    // Enter edit mode
    const editButtons = wrapper.findAll('button')
    const editButton = editButtons.find(btn => btn.text() === 'Edit')
    await editButton!.trigger('click')
    await wrapper.vm.$nextTick()

    // Update comment
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Updated comment')

    // Submit form
    const form = wrapper.find('form')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()

    expect(mockUpdateAvailableImage).toHaveBeenCalledWith('test-id', {
      comment: 'Updated comment',
    })
  })

  it('should handle delete functionality', async () => {
    const mockImage = {
      id: 'test-id',
      path: '/path/to/image.jpg',
      comment: 'Test comment',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    }

    const mockGetAvailableImage = vi.mocked(apiClient.getAvailableImage)
    const mockDeleteAvailableImage = vi.mocked(apiClient.deleteAvailableImage)
    const mockViewAvailableImage = vi.mocked(apiClient.viewAvailableImage)

    mockGetAvailableImage.mockResolvedValue({ data: mockImage })
    mockDeleteAvailableImage.mockResolvedValue()
    mockViewAvailableImage.mockResolvedValue('data:image/jpeg;base64,mockImageData')

    // Mock confirm to return true
    // eslint-disable-next-line no-undef
    vi.mocked(global.confirm).mockReturnValue(true)

    await router.push('/available-images/test-id')

    const wrapper = mount(AvailableImageDetail, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const deleteButtons = wrapper.findAll('button')
    const deleteButton = deleteButtons.find(btn => btn.text() === 'Delete')
    expect(deleteButton).toBeDefined()

    await deleteButton!.trigger('click')
    await wrapper.vm.$nextTick()

    // eslint-disable-next-line no-undef
    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this available image?'
    )
    expect(mockDeleteAvailableImage).toHaveBeenCalledWith('test-id')
  })

  it('should handle download functionality', async () => {
    const mockImage = {
      id: 'test-id',
      path: '/path/to/image.jpg',
      comment: 'Test comment',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    }

    const mockGetAvailableImage = vi.mocked(apiClient.getAvailableImage)
    const mockDownloadAvailableImage = vi.mocked(apiClient.downloadAvailableImage)
    const mockViewAvailableImage = vi.mocked(apiClient.viewAvailableImage)

    mockGetAvailableImage.mockResolvedValue({ data: mockImage })
    mockDownloadAvailableImage.mockResolvedValue('binary-image-data')
    mockViewAvailableImage.mockResolvedValue('data:image/jpeg;base64,mockImageData')

    await router.push('/available-images/test-id')

    const wrapper = mount(AvailableImageDetail, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const downloadButtons = wrapper.findAll('button')
    const downloadButton = downloadButtons.find(btn => btn.text() === 'Download')
    expect(downloadButton).toBeDefined()

    await downloadButton!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(mockDownloadAvailableImage).toHaveBeenCalledWith('test-id')
  })
})
