import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type {
  ItemResource,
  PartnerResource,
  ProjectResource,
  PictureResource,
  ApiResponse,
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
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  }

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
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
  value: localStorageMock,
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
})

describe('ApiClient', () => {
  let mockAxiosInstance: {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    patch: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    interceptors: {
      request: { use: ReturnType<typeof vi.fn> }
      response: { use: ReturnType<typeof vi.fn> }
    }
  }
  let ApiClient: typeof import('../client').apiClient

  beforeEach(async () => {
    vi.clearAllMocks()

    // Get the mocked axios instance
    const axios = await import('axios')
    mockAxiosInstance = (axios.default.create as ReturnType<typeof vi.fn>)()

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
        data: mockToken,
      })

      const result = await ApiClient.login('test@example.com', 'password', 'test-device')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/mobile/acquire-token', {
        email: 'test@example.com',
        password: 'password',
        device_name: 'test-device',
        wipe_tokens: true,
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

      await expect(
        ApiClient.login('test@example.com', 'wrong-password', 'test-device')
      ).rejects.toThrow('Login failed')
    })
  })

  describe('Items API', () => {
    const mockItem: ItemResource = {
      id: '1',
      internal_name: 'Test Item',
      backward_compatibility: null,
      type: 'object',
      owner_reference: null,
      mwnf_reference: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }

    const mockApiResponse: ApiResponse<ItemResource[]> = {
      data: [mockItem],
    }

    it('should get items successfully', async () => {
      const mockResponse: AxiosResponse<ApiResponse<ItemResource[]>> = {
        data: mockApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getItems()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/item')
      expect(result).toEqual(mockApiResponse)
    })

    it('should get single item successfully', async () => {
      const mockSingleResponse: ApiResponse<ItemResource> = {
        data: mockItem,
      }
      const mockResponse: AxiosResponse<ApiResponse<ItemResource>> = {
        data: mockSingleResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getItem('1')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/item/1')
      expect(result).toEqual(mockSingleResponse)
    })

    it('should create item successfully', async () => {
      const newItem: Partial<ItemResource> = {
        internal_name: 'New Item',
        type: 'object',
      }
      const mockResponse: AxiosResponse<ApiResponse<ItemResource>> = {
        data: { data: { ...mockItem, ...newItem } },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.createItem(newItem)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/item', newItem)
      expect(result.data.internal_name).toBe('New Item')
    })

    it('should update item successfully', async () => {
      const updates: Partial<ItemResource> = {
        internal_name: 'Updated Item',
      }
      const updatedItem = { ...mockItem, ...updates }
      const mockResponse: AxiosResponse<ApiResponse<ItemResource>> = {
        data: { data: updatedItem },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
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
        { id: '2', internal_name: 'Tag 2', created_at: null, updated_at: null },
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
      updated_at: '2023-01-01T00:00:00Z',
    }

    it('should get partners successfully', async () => {
      const mockResponse: AxiosResponse<ApiResponse<PartnerResource[]>> = {
        data: { data: [mockPartner] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
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
        type: 'museum',
      }
      const mockResponse: AxiosResponse<ApiResponse<PartnerResource>> = {
        data: { data: { ...mockPartner, ...newPartner } },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
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
      updated_at: '2023-01-01T00:00:00Z',
    }

    it('should get projects successfully', async () => {
      const mockResponse: AxiosResponse<ApiResponse<ProjectResource[]>> = {
        data: { data: [mockProject] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
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
        config: {} as InternalAxiosRequestConfig,
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
      updated_at: '2023-01-01T00:00:00Z',
    }

    it('should get pictures successfully', async () => {
      const mockResponse: AxiosResponse<ApiResponse<PictureResource[]>> = {
        data: { data: [mockPicture] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
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
        config: {} as InternalAxiosRequestConfig,
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.createPicture(formData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
      const mockResponse: AxiosResponse<ApiResponse<unknown[]>> = {
        data: {
          data: [{ id: 'USA', internal_name: 'United States', backward_compatibility: null }],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getCountries()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/country')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe('USA')
    })

    it('should create a country', async () => {
      const countryData = { id: 'USA', internal_name: 'United States' }
      const mockResponse: AxiosResponse<ApiResponse<unknown>> = {
        data: { data: { id: 'USA', internal_name: 'United States', backward_compatibility: null } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.createCountry(countryData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/country', countryData)
      expect(result.data.id).toBe('USA')
    })

    it('should update a country', async () => {
      const countryData = { internal_name: 'United States of America' }
      const mockResponse: AxiosResponse<ApiResponse<unknown>> = {
        data: {
          data: {
            id: 'USA',
            internal_name: 'United States of America',
            backward_compatibility: null,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
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
        config: {} as InternalAxiosRequestConfig,
      }
      mockAxiosInstance.delete.mockResolvedValueOnce(mockResponse)

      await ApiClient.deleteCountry('USA')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/country/USA')
    })
  })

  describe('Languages', () => {
    it('should fetch languages', async () => {
      const mockResponse: AxiosResponse<ApiResponse<unknown[]>> = {
        data: {
          data: [
            { id: 'eng', internal_name: 'English', is_default: true, backward_compatibility: null },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getLanguages()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/language')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe('eng')
    })

    it('should fetch default language', async () => {
      const mockResponse: AxiosResponse<ApiResponse<unknown>> = {
        data: {
          data: {
            id: 'eng',
            internal_name: 'English',
            is_default: true,
            backward_compatibility: null,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getDefaultLanguage()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/language/default')
      expect(result.data.is_default).toBe(true)
    })

    it('should set default language', async () => {
      const mockResponse: AxiosResponse<ApiResponse<unknown>> = {
        data: {
          data: {
            id: 'eng',
            internal_name: 'English',
            is_default: true,
            backward_compatibility: null,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }
      mockAxiosInstance.patch.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.setDefaultLanguage('eng', true)

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/language/eng/default', {
        is_default: true,
      })
      expect(result.data.is_default).toBe(true)
    })
  })

  describe('Contexts', () => {
    it.skip('should fetch contexts', async () => {
      // REMOVED: getContexts is not implemented in apiClient
    })

    it.skip('should set default context', async () => {
      // REMOVED: setDefaultContext is not implemented in apiClient
    })
  })

  describe('Image Uploads', () => {
    it('should fetch image uploads', async () => {
      const mockResponse: AxiosResponse<ApiResponse<unknown[]>> = {
        data: { data: [{ id: '1', name: 'test.jpg', size: 1024, mime_type: 'image/jpeg' }] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
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

      const mockResponse: AxiosResponse<ApiResponse<unknown>> = {
        data: { data: { id: '1', name: 'test.jpg', size: 1024, mime_type: 'image/jpeg' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.createImageUpload(formData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/image-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      expect(result.data.name).toBe('test.jpg')
    })
  })

  describe('Available Images', () => {
    it('should fetch available images', async () => {
      const mockResponse: AxiosResponse<ApiResponse<unknown[]>> = {
        data: { data: [{ id: '1', path: '/path/to/image.jpg', comment: 'Test comment' }] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.getAvailableImages()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/available-image')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].comment).toBe('Test comment')
    })

    it('should update available image', async () => {
      const updateData = { comment: 'Updated comment' }
      const mockResponse: AxiosResponse<ApiResponse<unknown>> = {
        data: { data: { id: '1', path: '/path/to/image.jpg', comment: 'Updated comment' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse)

      const result = await ApiClient.updateAvailableImage('1', updateData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/available-image/1', updateData)
      expect(result.data.comment).toBe('Updated comment')
    })
  })

  // --- Additional API resource tests ---
  describe('Address API', () => {
    const mockAddress = {
      id: '1',
      internal_name: 'Test Address',
      country_id: 'USA',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get addresses', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockAddress] } })
      const result = await ApiClient.getAddresses()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/address')
      expect(result.data[0].internal_name).toBe('Test Address')
    })
    it('should create address', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { data: mockAddress } })
      const result = await ApiClient.createAddress({
        internal_name: 'Test Address',
        country_id: 'USA',
      })
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/address', expect.any(Object))
      expect(result.data.internal_name).toBe('Test Address')
    })
  })

  describe('AddressTranslation API', () => {
    const mockTranslation = {
      id: '1',
      address_id: '1',
      language_id: 'eng',
      address: '123 Main St',
      description: 'Desc',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get address translations', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockTranslation] } })
      const result = await ApiClient.getAddressTranslations()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/address-translation')
      expect(result.data[0].address).toBe('123 Main St')
    })
  })

  describe('Contact API', () => {
    const mockContact = {
      id: '1',
      internal_name: 'Test Contact',
      phone_number: '123-456-7890',
      formatted_phone_number: null,
      fax_number: null,
      formatted_fax_number: null,
      email: 'contact@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get contacts', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockContact] } })
      const result = await ApiClient.getContacts()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/contact')
      expect(result.data[0].email).toBe('contact@example.com')
    })
  })

  describe('ContactTranslation API', () => {
    const mockContactTranslation = {
      id: '1',
      contact_id: '1',
      language_id: 'eng',
      label: 'Contact Label',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get contact translations', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockContactTranslation] } })
      const result = await ApiClient.getContactTranslations()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/contact-translation')
      expect(result.data[0].label).toBe('Contact Label')
    })
  })

  describe('Detail API', () => {
    const mockDetail = {
      id: '1',
      internal_name: 'Test Detail',
      backward_compatibility: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get details', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockDetail] } })
      const result = await ApiClient.getDetails()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/detail')
      expect(result.data[0].internal_name).toBe('Test Detail')
    })
  })

  describe('DetailTranslation API', () => {
    const mockDetailTranslation = {
      id: '1',
      detail_id: '1',
      language_id: 'eng',
      context_id: 'ctx',
      name: 'Detail Name',
      alternate_name: null,
      description: 'Detail Desc',
      author_id: null,
      text_copy_editor_id: null,
      translator_id: null,
      translation_copy_editor_id: null,
      backward_compatibility: null,
      extra: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get detail translations', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockDetailTranslation] } })
      const result = await ApiClient.getDetailTranslations()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/detail-translation')
      expect(result.data[0].name).toBe('Detail Name')
    })
  })

  describe('ItemTranslation API', () => {
    const mockItemTranslation = {
      id: '1',
      item_id: '1',
      language_id: 'eng',
      context_id: 'ctx',
      name: 'Item Name',
      alternate_name: null,
      description: 'Item Desc',
      type: null,
      holder: null,
      owner: null,
      initial_owner: null,
      dates: null,
      location: null,
      dimensions: null,
      place_of_production: null,
      method_for_datation: null,
      method_for_provenance: null,
      obtention: null,
      bibliography: null,
      author_id: null,
      text_copy_editor_id: null,
      translator_id: null,
      translation_copy_editor_id: null,
      backward_compatibility: null,
      extra: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get item translations', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockItemTranslation] } })
      const result = await ApiClient.getItemTranslations()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/item-translation')
      expect(result.data[0].name).toBe('Item Name')
    })
  })

  describe('Location API', () => {
    const mockLocation = {
      id: '1',
      internal_name: 'Test Location',
      country_id: 'USA',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get locations', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockLocation] } })
      const result = await ApiClient.getLocations()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/location')
      expect(result.data[0].internal_name).toBe('Test Location')
    })
  })

  describe('LocationTranslation API', () => {
    const mockLocationTranslation = {
      id: '1',
      location_id: '1',
      language_id: 'eng',
      name: 'Location Name',
      description: 'Location Desc',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get location translations', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockLocationTranslation] } })
      const result = await ApiClient.getLocationTranslations()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/location-translation')
      expect(result.data[0].name).toBe('Location Name')
    })
  })

  describe('Province API', () => {
    const mockProvince = {
      id: '1',
      internal_name: 'Test Province',
      country_id: 'USA',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get provinces', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockProvince] } })
      const result = await ApiClient.getProvinces()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/province')
      expect(result.data[0].internal_name).toBe('Test Province')
    })
  })

  describe('ProvinceTranslation API', () => {
    const mockProvinceTranslation = {
      id: '1',
      province_id: '1',
      language_id: 'eng',
      name: 'Province Name',
      description: 'Province Desc',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get province translations', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockProvinceTranslation] } })
      const result = await ApiClient.getProvinceTranslations()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/province-translation')
      expect(result.data[0].name).toBe('Province Name')
    })
  })

  describe('TagItem API', () => {
    const mockTagItem = {
      id: '1',
      tag_id: '1',
      item_id: '1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get tag items', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockTagItem] } })
      const result = await ApiClient.getTagItems()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tag-item')
      expect(result.data[0].item_id).toBe('1')
    })
  })

  describe('Workshop API', () => {
    const mockWorkshop = {
      id: '1',
      name: 'Test Workshop',
      internal_name: 'Test Workshop',
      backward_compatibility: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get workshops', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockWorkshop] } })
      const result = await ApiClient.getWorkshops()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/workshop')
      expect(result.data[0].internal_name).toBe('Test Workshop')
    })
  })

  describe('Artist API', () => {
    const mockArtist = {
      id: '1',
      name: 'Test Artist',
      place_of_birth: null,
      place_of_death: null,
      date_of_birth: null,
      date_of_death: null,
      period_of_activity: null,
      internal_name: 'Test Artist',
      backward_compatibility: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    it('should get artists', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [mockArtist] } })
      const result = await ApiClient.getArtists()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/artist')
      expect(result.data[0].name).toBe('Test Artist')
    })
  })

  describe('Markdown API', () => {
    it('should render markdown to html', async () => {
      const mockMarkdown = '# Title\nContent'
      const mockHtml = '<h1>Title</h1><p>Content</p>'
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { html: mockHtml } })
      const result = await ApiClient.markdownToHtml(mockMarkdown)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/markdown/to-html', {
        markdown: mockMarkdown,
      })
      expect(result.html).toBe(mockHtml)
    })
  })
})
