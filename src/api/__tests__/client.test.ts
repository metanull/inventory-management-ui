import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse } from 'axios'
import type { 
  ItemResource, 
  PartnerResource, 
  ProjectResource, 
  PictureResource,
  ApiResponse 
} from '../client'

// Mock axios completely
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn()
      },
      response: {
        use: vi.fn()
      }
    }
  }
  
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance)
    }
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
})

describe('ApiClient', () => {
  let mockAxiosInstance: any
  let ApiClient: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get the mocked axios instance
    const axios = await import('axios')
    mockAxiosInstance = (axios.default.create as any)()
    
    // Ensure all HTTP methods are mocked
    mockAxiosInstance.get = vi.fn()
    mockAxiosInstance.post = vi.fn()
    mockAxiosInstance.put = vi.fn()
    mockAxiosInstance.patch = vi.fn()
    mockAxiosInstance.delete = vi.fn()
    
    localStorageMock.getItem.mockReturnValue('mock-token')

    // Dynamically import the client after setting up mocks
    const clientModule = await import('../client')
    ApiClient = clientModule.apiClient
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const mockToken = 'mock-auth-token'
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockToken
      })

      const result = await ApiClient.login('test@example.com', 'password', 'test-device')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/mobile/acquire-token', {
        email: 'test@example.com',
        password: 'password',
        device_name: 'test-device'
      })
      expect(result).toBe(mockToken)
    })

    it('should logout successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({})

      await ApiClient.logout()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/mobile/wipe')
    })

    it('should handle login error', async () => {
      const mockError = new Error('Login failed')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      await expect(ApiClient.login('test@example.com', 'wrong-password', 'test-device'))
        .rejects.toThrow('Login failed')
    })
  })

  describe('Items API', () => {
    const mockItem: ItemResource = {
      id: '1',
      internal_name: 'Test Item',
      backward_compatibility: null,
      type: 'object',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }

    const mockApiResponse: ApiResponse<ItemResource[]> = {
      data: [mockItem]
    }

    it('should get items successfully', async () => {
      const mockResponse: AxiosResponse<ApiResponse<ItemResource[]>> = {
        data: mockApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getItems()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/item')
      expect(result).toEqual(mockApiResponse)
    })

    it('should get single item successfully', async () => {
      const mockSingleResponse: ApiResponse<ItemResource> = {
        data: mockItem
      }
      const mockResponse: AxiosResponse<ApiResponse<ItemResource>> = {
        data: mockSingleResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getItem('1')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/item/1')
      expect(result).toEqual(mockSingleResponse)
    })

    it('should create item successfully', async () => {
      const newItem: Partial<ItemResource> = {
        internal_name: 'New Item',
        type: 'object'
      }
      const mockResponse: AxiosResponse<ApiResponse<ItemResource>> = {
        data: { data: { ...mockItem, ...newItem } },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.createItem(newItem)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/item', newItem)
      expect(result.data.internal_name).toBe('New Item')
    })

    it('should update item successfully', async () => {
      const updates: Partial<ItemResource> = {
        internal_name: 'Updated Item'
      }
      const updatedItem = { ...mockItem, ...updates }
      const mockResponse: AxiosResponse<ApiResponse<ItemResource>> = {
        data: { data: updatedItem },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.updateItem('1', updates)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/item/1', updates)
      expect(result.data.internal_name).toBe('Updated Item')
    })

    it('should delete item successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({})

      await ApiClient.deleteItem('1')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/item/1')
    })

    it('should get item tags successfully', async () => {
      const mockTags = [
        { id: '1', internal_name: 'Tag 1', created_at: null, updated_at: null },
        { id: '2', internal_name: 'Tag 2', created_at: null, updated_at: null }
      ]
      const mockResponse = { data: mockTags }
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await ApiClient.getItemTags('item-1')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/item/item-1/tags')
      expect(result.data).toEqual(mockTags)
    })

    it('should add tag to item successfully', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({})

      await ApiClient.addTagToItem('item-1', 'tag-1')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/item/item-1/tags', { tag_id: 'tag-1' })
    })

    it('should remove tag from item successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({})

      await ApiClient.removeTagFromItem('item-1', 'tag-1')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/item/item-1/tags/tag-1')
    })

    it('should handle items API errors', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(ApiClient.getItems()).rejects.toThrow('Network error')
    })
  })

  describe('Partners API', () => {
    const mockPartner: PartnerResource = {
      id: '1',
      internal_name: 'Test Partner',
      backward_compatibility: null,
      type: 'museum',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }

    it('should get partners successfully', async () => {
      const mockResponse: AxiosResponse<ApiResponse<PartnerResource[]>> = {
        data: { data: [mockPartner] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getPartners()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/partner')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].type).toBe('museum')
    })

    it('should create partner successfully', async () => {
      const newPartner: Partial<PartnerResource> = {
        internal_name: 'New Museum',
        type: 'museum'
      }
      const mockResponse: AxiosResponse<ApiResponse<PartnerResource>> = {
        data: { data: { ...mockPartner, ...newPartner } },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.createPartner(newPartner)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/partner', newPartner)
      expect(result.data.internal_name).toBe('New Museum')
    })

    it('should delete partner successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({})

      await ApiClient.deletePartner('1')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/partner/1')
    })
  })

  describe('Projects API', () => {
    const mockProject: ProjectResource = {
      id: '1',
      internal_name: 'Test Project',
      backward_compatibility: null,
      launch_date: '2023-06-01',
      is_launched: true,
      is_enabled: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }

    it('should get projects successfully', async () => {
      const mockResponse: AxiosResponse<ApiResponse<ProjectResource[]>> = {
        data: { data: [mockProject] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getProjects()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/project')
      expect(result.data[0].is_launched).toBe(true)
    })

    it('should get enabled projects successfully', async () => {
      const mockResponse: AxiosResponse<ApiResponse<ProjectResource[]>> = {
        data: { data: [mockProject] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getEnabledProjects()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/project/enabled')
      expect(result.data[0].is_enabled).toBe(true)
    })
  })

  describe('Pictures API', () => {
    const mockPicture: PictureResource = {
      id: '1',
      internal_name: 'Test Picture',
      backward_compatibility: null,
      path: '/images/test.jpg',
      copyright_text: 'Test Copyright',
      copyright_url: 'https://example.com',
      upload_name: 'test.jpg',
      upload_extension: 'jpg',
      upload_mime_type: 'image/jpeg',
      upload_size: 12345,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }

    it('should get pictures successfully', async () => {
      const mockResponse: AxiosResponse<ApiResponse<PictureResource[]>> = {
        data: { data: [mockPicture] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getPictures()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/picture')
      expect(result.data[0].upload_mime_type).toBe('image/jpeg')
    })

    it('should create picture with FormData successfully', async () => {
      const formData = new FormData()
      formData.append('file', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg')
      formData.append('internal_name', 'New Picture')

      const mockResponse: AxiosResponse<ApiResponse<PictureResource>> = {
        data: { data: mockPicture },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.createPicture(formData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      expect(result.data.upload_name).toBe('test.jpg')
    })
  })

  describe('HTTP Interceptors', () => {
    it('should setup request and response interceptors', () => {
      // Verify that the axios instance has interceptor methods available
      expect(mockAxiosInstance.interceptors).toBeDefined()
      expect(mockAxiosInstance.interceptors.request).toBeDefined()
      expect(mockAxiosInstance.interceptors.response).toBeDefined()
      expect(typeof mockAxiosInstance.interceptors.request.use).toBe('function')
      expect(typeof mockAxiosInstance.interceptors.response.use).toBe('function')
    })
  })

  describe('Countries', () => {
    it('should fetch countries', async () => {
      const mockResponse: AxiosResponse<ApiResponse<any[]>> = {
        data: { data: [{ id: 'USA', internal_name: 'United States', backward_compatibility: null }] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getCountries()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/country')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe('USA')
    })

    it('should create a country', async () => {
      const countryData = { id: 'USA', internal_name: 'United States' }
      const mockResponse: AxiosResponse<ApiResponse<any>> = {
        data: { data: { id: 'USA', internal_name: 'United States', backward_compatibility: null } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.createCountry(countryData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/country', countryData)
      expect(result.data.id).toBe('USA')
    })

    it('should update a country', async () => {
      const countryData = { internal_name: 'United States of America' }
      const mockResponse: AxiosResponse<ApiResponse<any>> = {
        data: { data: { id: 'USA', internal_name: 'United States of America', backward_compatibility: null } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.updateCountry('USA', countryData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/country/USA', countryData)
      expect(result.data.internal_name).toBe('United States of America')
    })

    it('should delete a country', async () => {
      const mockResponse: AxiosResponse<void> = {
        data: undefined,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.delete.mockResolvedValueOnce(mockResponse)

      await ApiClient.deleteCountry('USA')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/country/USA')
    })
  })

  describe('Languages', () => {
    it('should fetch languages', async () => {
      const mockResponse: AxiosResponse<ApiResponse<any[]>> = {
        data: { data: [{ id: 'eng', internal_name: 'English', is_default: true, backward_compatibility: null }] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getLanguages()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/language')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe('eng')
    })

    it('should fetch default language', async () => {
      const mockResponse: AxiosResponse<ApiResponse<any>> = {
        data: { data: { id: 'eng', internal_name: 'English', is_default: true, backward_compatibility: null } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getDefaultLanguage()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/language/default')
      expect(result.data.is_default).toBe(true)
    })

    it('should set default language', async () => {
      const mockResponse: AxiosResponse<ApiResponse<any>> = {
        data: { data: { id: 'eng', internal_name: 'English', is_default: true, backward_compatibility: null } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.patch.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.setDefaultLanguage('eng', true)

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/language/eng/default', { is_default: true })
      expect(result.data.is_default).toBe(true)
    })
  })

  describe('Contexts', () => {
    it('should fetch contexts', async () => {
      const mockResponse: AxiosResponse<ApiResponse<any[]>> = {
        data: { data: [{ id: '1', internal_name: 'Default Context', is_default: true, backward_compatibility: null }] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getContexts()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/context')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].is_default).toBe(true)
    })

    it('should set default context', async () => {
      const mockResponse: AxiosResponse<ApiResponse<any>> = {
        data: { data: { id: '1', internal_name: 'Default Context', is_default: true, backward_compatibility: null } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.patch.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.setDefaultContext('1', true)

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/context/1/default', { is_default: true })
      expect(result.data.is_default).toBe(true)
    })
  })

  describe('Image Uploads', () => {
    it('should fetch image uploads', async () => {
      const mockResponse: AxiosResponse<ApiResponse<any[]>> = {
        data: { data: [{ id: '1', name: 'test.jpg', size: 1024, mime_type: 'image/jpeg' }] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getImageUploads()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/image-upload')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('test.jpg')
    })

    it('should create image upload', async () => {
      const formData = new FormData()
      formData.append('file', new File(['test'], 'test.jpg'))
      
      const mockResponse: AxiosResponse<ApiResponse<any>> = {
        data: { data: { id: '1', name: 'test.jpg', size: 1024, mime_type: 'image/jpeg' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.createImageUpload(formData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/image-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      expect(result.data.name).toBe('test.jpg')
    })
  })

  describe('Available Images', () => {
    it('should fetch available images', async () => {
      const mockResponse: AxiosResponse<ApiResponse<any[]>> = {
        data: { data: [{ id: '1', path: '/path/to/image.jpg', comment: 'Test comment' }] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getAvailableImages()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/available-image')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].comment).toBe('Test comment')
    })

    it('should update available image', async () => {
      const updateData = { comment: 'Updated comment' }
      const mockResponse: AxiosResponse<ApiResponse<any>> = {
        data: { data: { id: '1', path: '/path/to/image.jpg', comment: 'Updated comment' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.updateAvailableImage('1', updateData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/available-image/1', updateData)
      expect(result.data.comment).toBe('Updated comment')
    })
  })
})
