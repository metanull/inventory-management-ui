import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AvailableImages from '../AvailableImages.vue'
import { apiClient } from '@/api/client'

// Mock the API client
vi.mock('@/api/client', () => ({
  apiClient: {
    getAvailableImages: vi.fn(),
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
    { path: '/available-images', component: AvailableImages },
    { path: '/available-images/:id', component: { template: '<div>Detail</div>' } },
  ],
})

describe('AvailableImages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    const mockGetAvailableImages = vi.mocked(apiClient.getAvailableImages)
    mockGetAvailableImages.mockReturnValue(new Promise(() => {})) // Never resolves

    const wrapper = mount(AvailableImages, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Loading available images...')
  })

  it('should display available images with previews', async () => {
    const mockImages = [
      {
        id: '1',
        path: '/path/to/image1.jpg',
        comment: 'Test image 1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
      },
      {
        id: '2',
        path: '/path/to/image2.jpg',
        comment: 'Test image 2',
        created_at: '2023-01-03T00:00:00Z',
        updated_at: null,
      },
    ]

    const mockGetAvailableImages = vi.mocked(apiClient.getAvailableImages)
    const mockViewAvailableImage = vi.mocked(apiClient.viewAvailableImage)

    mockGetAvailableImages.mockResolvedValue({ data: mockImages })
    mockViewAvailableImage.mockResolvedValue('data:image/jpeg;base64,mockImageData')

    const wrapper = mount(AvailableImages, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(mockGetAvailableImages).toHaveBeenCalledOnce()
    expect(mockViewAvailableImage).toHaveBeenCalledWith('1')
    expect(mockViewAvailableImage).toHaveBeenCalledWith('2')
    expect(wrapper.text()).toContain('Test image 1')
    expect(wrapper.text()).toContain('Test image 2')
  })

  it('should handle API errors gracefully', async () => {
    const mockGetAvailableImages = vi.mocked(apiClient.getAvailableImages)
    mockGetAvailableImages.mockRejectedValue(new Error('API Error'))

    const wrapper = mount(AvailableImages, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('API Error')
  })

  it('should display empty state when no images available', async () => {
    const mockGetAvailableImages = vi.mocked(apiClient.getAvailableImages)
    mockGetAvailableImages.mockResolvedValue({ data: [] })

    const wrapper = mount(AvailableImages, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No available images found.')
  })

  it('should handle image loading errors', async () => {
    const mockImages = [
      {
        id: '1',
        path: '/path/to/image1.jpg',
        comment: 'Test image 1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
      },
    ]

    const mockGetAvailableImages = vi.mocked(apiClient.getAvailableImages)
    const mockViewAvailableImage = vi.mocked(apiClient.viewAvailableImage)

    mockGetAvailableImages.mockResolvedValue({ data: mockImages })
    mockViewAvailableImage.mockRejectedValue(new Error('Image loading failed'))

    const wrapper = mount(AvailableImages, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(console.error).toHaveBeenCalledWith('Failed to load image 1:', expect.any(Error))
  })

  it('should handle download image functionality', async () => {
    const mockImages = [
      {
        id: '1',
        path: '/path/to/image1.jpg',
        comment: 'Test image 1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
      },
    ]

    const mockGetAvailableImages = vi.mocked(apiClient.getAvailableImages)
    const mockDownloadAvailableImage = vi.mocked(apiClient.downloadAvailableImage)
    const mockViewAvailableImage = vi.mocked(apiClient.viewAvailableImage)

    mockGetAvailableImages.mockResolvedValue({ data: mockImages })
    mockViewAvailableImage.mockResolvedValue('data:image/jpeg;base64,mockImageData')
    mockDownloadAvailableImage.mockResolvedValue('binary-image-data')

    const wrapper = mount(AvailableImages, {
      global: {
        plugins: [router],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    // Find and click the download button
    const downloadButton = wrapper.find('[title="Download"]')
    expect(downloadButton.exists()).toBe(true)

    await downloadButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(mockDownloadAvailableImage).toHaveBeenCalledWith('1')
  })
})
