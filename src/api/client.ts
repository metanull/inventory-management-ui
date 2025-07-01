import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ErrorHandler } from '@/utils/errorHandler'

export interface ApiResponse<T> {
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

// Resource types based on the API specification
export interface ItemResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  type: 'object' | 'monument'
  partner?: PartnerResource
  project?: ProjectResource
  country?: CountryResource
  tags?: TagResource[]
  created_at: string | null
  updated_at: string | null
}

export interface PartnerResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  type: 'museum' | 'institution' | 'individual'
  country?: CountryResource
  created_at: string | null
  updated_at: string | null
}

export interface ProjectResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  launch_date: string | null
  is_launched: boolean
  is_enabled: boolean
  context?: ContextResource
  language?: LanguageResource
  created_at: string | null
  updated_at: string | null
}

export interface TagResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  description: string
  created_at: string | null
  updated_at: string | null
}

export interface PictureResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  path: string | null
  copyright_text: string | null
  copyright_url: string | null
  upload_name: string | null
  upload_extension: string | null
  upload_mime_type: string | null
  upload_size: number | null
  created_at: string | null
  updated_at: string | null
}

export interface ContextResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  is_default: boolean
  created_at: string | null
  updated_at: string | null
}

export interface LanguageResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  is_default: boolean
  created_at: string | null
  updated_at: string | null
}

export interface CountryResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  created_at: string | null
  updated_at: string | null
}

export interface AvailableImageResource {
  id: string
  path: string | null
  comment: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ContextualizationResource {
  id: string
  context_id: string
  item_id: string | null
  detail_id: string | null
  extra: any[] | null
  internal_name: string
  backward_compatibility: string | null
  created_at: string | null
  updated_at: string | null
  context?: ContextResource
  item?: ItemResource
  detail?: DetailResource
}

export interface DetailResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  item?: ItemResource
  created_at: string | null
  updated_at: string | null
}

export interface ImageUploadResource {
  id: string
  path: string | null
  name: string | null
  extension: string | null
  mime_type: string | null
  size: number | null
  created_at: string | null
  updated_at: string | null
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        // Let ErrorHandler manage the error display and authentication redirects
        ErrorHandler.handleError(error, 'API Request')
        
        // Still reject the promise so individual methods can handle it if needed
        return Promise.reject(error)
      }
    )
  }

  // Authentication
  async login(email: string, password: string, deviceName: string): Promise<string> {
    const response = await this.client.post('/mobile/acquire-token', {
      email,
      password,
      device_name: deviceName,
      wipe_tokens: true, // Remove older tokens during login
    })
    
    // Parse the response format: "tokenCount;actualToken"
    const responseData = response.data
    if (typeof responseData === 'string' && responseData.includes(';')) {
      const [tokenCount, token] = responseData.split(';')
      console.log(`Authentication successful. Active tokens: ${tokenCount}`)
      return token
    }
    
    // Fallback for different response formats
    return responseData
  }

  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  clearAuthToken(): void {
    localStorage.removeItem('auth_token')
  }

  async logout(): Promise<void> {
    await this.client.get('/mobile/wipe')
    this.clearAuthToken()
  }

  // Items
  async getItems(): Promise<ApiResponse<ItemResource[]>> {
    const response: AxiosResponse<ApiResponse<ItemResource[]>> = await this.client.get('/item')
    return response.data
  }

  async getItem(id: string): Promise<ApiResponse<ItemResource>> {
    const response: AxiosResponse<ApiResponse<ItemResource>> = await this.client.get(`/item/${id}`)
    return response.data
  }

  async createItem(data: Partial<ItemResource>): Promise<ApiResponse<ItemResource>> {
    const response: AxiosResponse<ApiResponse<ItemResource>> = await this.client.post('/item', data)
    return response.data
  }

  async updateItem(id: string, data: Partial<ItemResource>): Promise<ApiResponse<ItemResource>> {
    const response: AxiosResponse<ApiResponse<ItemResource>> = await this.client.put(
      `/item/${id}`,
      data
    )
    return response.data
  }

  async deleteItem(id: string): Promise<void> {
    await this.client.delete(`/item/${id}`)
  }

  // Item Tags
  async getItemTags(itemId: string): Promise<ApiResponse<TagResource[]>> {
    const response: AxiosResponse<ApiResponse<TagResource[]>> = await this.client.get(
      `/item/${itemId}/tags`
    )
    return response.data
  }

  async addTagToItem(itemId: string, tagId: string): Promise<void> {
    await this.client.post(`/item/${itemId}/tags`, { tag_id: tagId })
  }

  async removeTagFromItem(itemId: string, tagId: string): Promise<void> {
    await this.client.delete(`/item/${itemId}/tags/${tagId}`)
  }

  // Partners
  async getPartners(): Promise<ApiResponse<PartnerResource[]>> {
    const response: AxiosResponse<ApiResponse<PartnerResource[]>> = await this.client.get('/partner')
    return response.data
  }

  async getPartner(id: string): Promise<ApiResponse<PartnerResource>> {
    const response: AxiosResponse<ApiResponse<PartnerResource>> = await this.client.get(
      `/partner/${id}`
    )
    return response.data
  }

  async createPartner(data: Partial<PartnerResource>): Promise<ApiResponse<PartnerResource>> {
    const response: AxiosResponse<ApiResponse<PartnerResource>> = await this.client.post(
      '/partner',
      data
    )
    return response.data
  }

  async updatePartner(
    id: string,
    data: Partial<PartnerResource>
  ): Promise<ApiResponse<PartnerResource>> {
    const response: AxiosResponse<ApiResponse<PartnerResource>> = await this.client.put(
      `/partner/${id}`,
      data
    )
    return response.data
  }

  async deletePartner(id: string): Promise<void> {
    await this.client.delete(`/partner/${id}`)
  }

  // Projects
  async getProjects(): Promise<ApiResponse<ProjectResource[]>> {
    const response: AxiosResponse<ApiResponse<ProjectResource[]>> = await this.client.get('/project')
    return response.data
  }

  async getEnabledProjects(): Promise<ApiResponse<ProjectResource[]>> {
    const response: AxiosResponse<ApiResponse<ProjectResource[]>> = await this.client.get(
      '/project/enabled'
    )
    return response.data
  }

  async getProject(id: string): Promise<ApiResponse<ProjectResource>> {
    const response: AxiosResponse<ApiResponse<ProjectResource>> = await this.client.get(
      `/project/${id}`
    )
    return response.data
  }

  async createProject(data: Partial<ProjectResource>): Promise<ApiResponse<ProjectResource>> {
    const response: AxiosResponse<ApiResponse<ProjectResource>> = await this.client.post(
      '/project',
      data
    )
    return response.data
  }

  async updateProject(
    id: string,
    data: Partial<ProjectResource>
  ): Promise<ApiResponse<ProjectResource>> {
    const response: AxiosResponse<ApiResponse<ProjectResource>> = await this.client.put(
      `/project/${id}`,
      data
    )
    return response.data
  }

  async deleteProject(id: string): Promise<void> {
    await this.client.delete(`/project/${id}`)
  }

  // Tags
  async getTags(): Promise<ApiResponse<TagResource[]>> {
    const response: AxiosResponse<ApiResponse<TagResource[]>> = await this.client.get('/tag')
    return response.data
  }

  async getTag(id: string): Promise<ApiResponse<TagResource>> {
    const response: AxiosResponse<ApiResponse<TagResource>> = await this.client.get(`/tag/${id}`)
    return response.data
  }

  async createTag(data: Partial<TagResource>): Promise<ApiResponse<TagResource>> {
    const response: AxiosResponse<ApiResponse<TagResource>> = await this.client.post('/tag', data)
    return response.data
  }

  async updateTag(id: string, data: Partial<TagResource>): Promise<ApiResponse<TagResource>> {
    const response: AxiosResponse<ApiResponse<TagResource>> = await this.client.put(
      `/tag/${id}`,
      data
    )
    return response.data
  }

  async deleteTag(id: string): Promise<void> {
    await this.client.delete(`/tag/${id}`)
  }

  // Pictures
  async getPictures(): Promise<ApiResponse<PictureResource[]>> {
    const response: AxiosResponse<ApiResponse<PictureResource[]>> = await this.client.get('/picture')
    return response.data
  }

  async getPicture(id: string): Promise<ApiResponse<PictureResource>> {
    const response: AxiosResponse<ApiResponse<PictureResource>> = await this.client.get(
      `/picture/${id}`
    )
    return response.data
  }

  async createPicture(formData: FormData): Promise<ApiResponse<PictureResource>> {
    const response: AxiosResponse<ApiResponse<PictureResource>> = await this.client.post(
      '/picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  }

  async updatePicture(id: string, data: Partial<PictureResource>): Promise<ApiResponse<PictureResource>> {
    const response: AxiosResponse<ApiResponse<PictureResource>> = await this.client.put(
      `/picture/${id}`,
      data
    )
    return response.data
  }

  async deletePicture(id: string): Promise<void> {
    await this.client.delete(`/picture/${id}`)
  }

  // Countries
  async getCountries(): Promise<ApiResponse<CountryResource[]>> {
    const response: AxiosResponse<ApiResponse<CountryResource[]>> = await this.client.get('/country')
    return response.data
  }

  async getCountry(id: string): Promise<ApiResponse<CountryResource>> {
    const response: AxiosResponse<ApiResponse<CountryResource>> = await this.client.get(`/country/${id}`)
    return response.data
  }

  async createCountry(data: Partial<CountryResource>): Promise<ApiResponse<CountryResource>> {
    const response: AxiosResponse<ApiResponse<CountryResource>> = await this.client.post('/country', data)
    return response.data
  }

  async updateCountry(id: string, data: Partial<CountryResource>): Promise<ApiResponse<CountryResource>> {
    const response: AxiosResponse<ApiResponse<CountryResource>> = await this.client.put(`/country/${id}`, data)
    return response.data
  }

  async deleteCountry(id: string): Promise<void> {
    await this.client.delete(`/country/${id}`)
  }

  // Languages
  async getLanguages(): Promise<ApiResponse<LanguageResource[]>> {
    const response: AxiosResponse<ApiResponse<LanguageResource[]>> = await this.client.get('/language')
    return response.data
  }

  async getLanguage(id: string): Promise<ApiResponse<LanguageResource>> {
    const response: AxiosResponse<ApiResponse<LanguageResource>> = await this.client.get(`/language/${id}`)
    return response.data
  }

  async getDefaultLanguage(): Promise<ApiResponse<LanguageResource>> {
    const response: AxiosResponse<ApiResponse<LanguageResource>> = await this.client.get('/language/default')
    return response.data
  }

  async getEnglishLanguage(): Promise<ApiResponse<LanguageResource>> {
    const response: AxiosResponse<ApiResponse<LanguageResource>> = await this.client.get('/language/english')
    return response.data
  }

  async createLanguage(data: Partial<LanguageResource>): Promise<ApiResponse<LanguageResource>> {
    // Remove forbidden fields for creation
    const { is_default, ...createData } = data
    const response: AxiosResponse<ApiResponse<LanguageResource>> = await this.client.post('/language', createData)
    return response.data
  }

  async updateLanguage(id: string, data: Partial<LanguageResource>): Promise<ApiResponse<LanguageResource>> {
    // Remove forbidden fields for update
    const { is_default, ...updateData } = data
    const response: AxiosResponse<ApiResponse<LanguageResource>> = await this.client.put(`/language/${id}`, updateData)
    return response.data
  }

  async setDefaultLanguage(id: string, isDefault: boolean): Promise<ApiResponse<LanguageResource>> {
    const response: AxiosResponse<ApiResponse<LanguageResource>> = await this.client.patch(`/language/${id}/default`, {
      is_default: isDefault
    })
    return response.data
  }

  async deleteLanguage(id: string): Promise<void> {
    await this.client.delete(`/language/${id}`)
  }

  // Contexts
  async getContexts(): Promise<ApiResponse<ContextResource[]>> {
    const response: AxiosResponse<ApiResponse<ContextResource[]>> = await this.client.get('/context')
    return response.data
  }

  async getContext(id: string): Promise<ApiResponse<ContextResource>> {
    const response: AxiosResponse<ApiResponse<ContextResource>> = await this.client.get(`/context/${id}`)
    return response.data
  }

  async getDefaultContext(): Promise<ApiResponse<ContextResource>> {
    const response: AxiosResponse<ApiResponse<ContextResource>> = await this.client.get('/context/default')
    return response.data
  }

  async createContext(data: Partial<ContextResource>): Promise<ApiResponse<ContextResource>> {
    // Remove forbidden fields for creation
    const { is_default, ...createData } = data
    const response: AxiosResponse<ApiResponse<ContextResource>> = await this.client.post('/context', createData)
    return response.data
  }

  async updateContext(id: string, data: Partial<ContextResource>): Promise<ApiResponse<ContextResource>> {
    // Remove forbidden fields for update
    const { is_default, ...updateData } = data
    const response: AxiosResponse<ApiResponse<ContextResource>> = await this.client.put(`/context/${id}`, updateData)
    return response.data
  }

  async setDefaultContext(id: string, isDefault: boolean): Promise<ApiResponse<ContextResource>> {
    const response: AxiosResponse<ApiResponse<ContextResource>> = await this.client.patch(`/context/${id}/default`, {
      is_default: isDefault
    })
    return response.data
  }

  async deleteContext(id: string): Promise<void> {
    await this.client.delete(`/context/${id}`)
  }

  // Contextualizations
  async getContextualizations(): Promise<PaginatedResponse<ContextualizationResource>> {
    const response: AxiosResponse<PaginatedResponse<ContextualizationResource>> = await this.client.get('/contextualization')
    return response.data
  }

  async getContextualizationsForItems(): Promise<PaginatedResponse<ContextualizationResource>> {
    const response: AxiosResponse<PaginatedResponse<ContextualizationResource>> = await this.client.get('/contextualization/for-items')
    return response.data
  }

  async getContextualizationsForDetails(): Promise<PaginatedResponse<ContextualizationResource>> {
    const response: AxiosResponse<PaginatedResponse<ContextualizationResource>> = await this.client.get('/contextualization/for-details')
    return response.data
  }

  async getDefaultContextualizations(): Promise<PaginatedResponse<ContextualizationResource>> {
    const response: AxiosResponse<PaginatedResponse<ContextualizationResource>> = await this.client.get('/contextualization/default-context')
    return response.data
  }

  async getContextualization(id: string): Promise<ApiResponse<ContextualizationResource>> {
    const response: AxiosResponse<ApiResponse<ContextualizationResource>> = await this.client.get(`/contextualization/${id}`)
    return response.data
  }

  async createContextualization(data: Partial<ContextualizationResource>): Promise<ApiResponse<ContextualizationResource>> {
    const response: AxiosResponse<ApiResponse<ContextualizationResource>> = await this.client.post('/contextualization', data)
    return response.data
  }

  async createContextualizationWithDefaultContext(data: Partial<ContextualizationResource>): Promise<ApiResponse<ContextualizationResource>> {
    const response: AxiosResponse<ApiResponse<ContextualizationResource>> = await this.client.post('/contextualization/with-default-context', data)
    return response.data
  }

  async updateContextualization(id: string, data: Partial<ContextualizationResource>): Promise<ApiResponse<ContextualizationResource>> {
    const response: AxiosResponse<ApiResponse<ContextualizationResource>> = await this.client.put(`/contextualization/${id}`, data)
    return response.data
  }

  async deleteContextualization(id: string): Promise<void> {
    await this.client.delete(`/contextualization/${id}`)
  }

  // Details
  async getDetails(): Promise<ApiResponse<DetailResource[]>> {
    const response: AxiosResponse<ApiResponse<DetailResource[]>> = await this.client.get('/detail')
    return response.data
  }

  async getDetail(id: string): Promise<ApiResponse<DetailResource>> {
    const response: AxiosResponse<ApiResponse<DetailResource>> = await this.client.get(`/detail/${id}`)
    return response.data
  }

  async createDetail(data: Partial<DetailResource & { item_id: string }>): Promise<ApiResponse<DetailResource>> {
    const response: AxiosResponse<ApiResponse<DetailResource>> = await this.client.post('/detail', data)
    return response.data
  }

  async updateDetail(id: string, data: Partial<DetailResource & { item_id: string }>): Promise<ApiResponse<DetailResource>> {
    const response: AxiosResponse<ApiResponse<DetailResource>> = await this.client.put(`/detail/${id}`, data)
    return response.data
  }

  async deleteDetail(id: string): Promise<void> {
    await this.client.delete(`/detail/${id}`)
  }

  // Available Images
  async getAvailableImages(): Promise<ApiResponse<AvailableImageResource[]>> {
    const response: AxiosResponse<ApiResponse<AvailableImageResource[]>> = await this.client.get('/available-image')
    return response.data
  }

  async getAvailableImage(id: string): Promise<ApiResponse<AvailableImageResource>> {
    const response: AxiosResponse<ApiResponse<AvailableImageResource>> = await this.client.get(`/available-image/${id}`)
    return response.data
  }

  async updateAvailableImage(id: string, data: { comment?: string | null }): Promise<ApiResponse<AvailableImageResource>> {
    const response: AxiosResponse<ApiResponse<AvailableImageResource>> = await this.client.put(`/available-image/${id}`, data)
    return response.data
  }

  async deleteAvailableImage(id: string): Promise<void> {
    await this.client.delete(`/available-image/${id}`)
  }

  async downloadAvailableImage(id: string): Promise<string> {
    const response: AxiosResponse<string> = await this.client.get(`/available-image/${id}/download`)
    return response.data
  }

  // Image Uploads
  async getImageUploads(): Promise<ApiResponse<ImageUploadResource[]>> {
    const response: AxiosResponse<ApiResponse<ImageUploadResource[]>> = await this.client.get('/image-upload')
    return response.data
  }

  async getImageUpload(id: string): Promise<ApiResponse<ImageUploadResource>> {
    const response: AxiosResponse<ApiResponse<ImageUploadResource>> = await this.client.get(`/image-upload/${id}`)
    return response.data
  }

  async createImageUpload(formData: FormData): Promise<ApiResponse<ImageUploadResource>> {
    const response: AxiosResponse<ApiResponse<ImageUploadResource>> = await this.client.post('/image-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteImageUpload(id: string): Promise<void> {
    await this.client.delete(`/image-upload/${id}`)
  }
}

export const apiClient = new ApiClient()
