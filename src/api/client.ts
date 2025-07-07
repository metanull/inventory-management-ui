import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ErrorHandler } from '@/utils/errorHandler'

declare const process: {
  env: Record<string, string | undefined>
}

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

// Resource types based on the OpenAPI specification
export interface AddressTranslationResource {
  id: string
  address_id: string
  language_id: string
  address: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export interface AddressResource {
  id: string
  internal_name: string
  country_id: string
  translations?: AddressTranslationResource[]
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

export interface CountryResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
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

export interface PartnerResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  type: string
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

export interface ArtistResource {
  id: string
  name: string
  place_of_birth: string | null
  place_of_death: string | null
  date_of_birth: string | null
  date_of_death: string | null
  period_of_activity: string | null
  internal_name: string
  backward_compatibility: string | null
  created_at: string | null
  updated_at: string | null
  items?: ItemResource[]
}

export interface WorkshopResource {
  id: string
  name: string
  internal_name: string
  backward_compatibility: string | null
  created_at: string | null
  updated_at: string | null
  items?: ItemResource[]
}

export interface ItemResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  type: string
  owner_reference: string | null
  mwnf_reference: string | null
  partner?: PartnerResource
  project?: ProjectResource
  country?: CountryResource
  artists?: ArtistResource[]
  workshops?: WorkshopResource[]
  tags?: TagResource[]
  translations?: ItemTranslationResource[]
  created_at: string | null
  updated_at: string | null
}

export interface ItemTranslationResource {
  id: string
  item_id: string
  language_id: string
  context_id: string
  name: string
  alternate_name: string | null
  description: string
  type: string | null
  holder: string | null
  owner: string | null
  initial_owner: string | null
  dates: string | null
  location: string | null
  dimensions: string | null
  place_of_production: string | null
  method_for_datation: string | null
  method_for_provenance: string | null
  obtention: string | null
  bibliography: string | null
  author_id: string | null
  text_copy_editor_id: string | null
  translator_id: string | null
  translation_copy_editor_id: string | null
  backward_compatibility: string | null
  extra: string[] | null
  created_at: string | null
  updated_at: string | null
  item?: ItemResource
  language?: LanguageResource
  context?: ContextResource
  author?: AuthorResource
  text_copy_editor?: AuthorResource
  translator?: AuthorResource
  translation_copy_editor?: AuthorResource
}

export interface AuthorResource {
  id: string
  name: string
  internal_name: string | null
  backward_compatibility: string | null
  created_at: string | null
  updated_at: string | null
}

export interface DetailResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  item?: ItemResource
  translations?: DetailTranslationResource[]
  created_at: string | null
  updated_at: string | null
}

export interface DetailTranslationResource {
  id: string
  detail_id: string
  language_id: string
  context_id: string
  name: string
  alternate_name: string | null
  description: string
  author_id: string | null
  text_copy_editor_id: string | null
  translator_id: string | null
  translation_copy_editor_id: string | null
  backward_compatibility: string | null
  extra: string[] | null
  created_at: string | null
  updated_at: string | null
  detail?: DetailResource
  language?: LanguageResource
  context?: ContextResource
  author?: AuthorResource
  text_copy_editor?: AuthorResource
  translator?: AuthorResource
  translation_copy_editor?: AuthorResource
}

export interface ContextResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  is_default: boolean
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

export interface ContactTranslationResource {
  id: string
  contact_id: string
  language_id: string
  label: string
  created_at: string | null
  updated_at: string | null
}

export interface ContactResource {
  id: string
  internal_name: string
  phone_number: string | null
  formatted_phone_number: string | null
  fax_number: string | null
  formatted_fax_number: string | null
  email: string | null
  translations?: ContactTranslationResource[]
  created_at: string | null
  updated_at: string | null
}

export interface LocationTranslationResource {
  id: string
  location_id: string
  language_id: string
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export interface LocationResource {
  id: string
  internal_name: string
  country_id: string
  translations?: LocationTranslationResource[]
  created_at: string | null
  updated_at: string | null
}

export interface ProvinceTranslationResource {
  id: string
  province_id: string
  language_id: string
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ProvinceResource {
  id: string
  internal_name: string
  country_id: string
  translations?: ProvinceTranslationResource[]
  created_at: string | null
  updated_at: string | null
}

export interface TagItemResource {
  id: string
  tag_id: string
  item_id: string
  tag?: TagResource
  item?: ItemResource
  created_at: string | null
  updated_at: string | null
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    // Support both Vite (import.meta.env) and Node (process.env) for baseURL
    let baseURL: string
    if (
      typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_API_BASE_URL
    ) {
      baseURL = import.meta.env.VITE_API_BASE_URL
    } else if (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) {
      baseURL = process.env.VITE_API_BASE_URL
    } else {
      baseURL = 'http://127.0.0.1:8000/api'
    }

    this.client = axios.create({
      baseURL,
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
    const response: AxiosResponse<ApiResponse<PartnerResource[]>> =
      await this.client.get('/partner')
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
    const response: AxiosResponse<ApiResponse<ProjectResource[]>> =
      await this.client.get('/project')
    return response.data
  }

  async getEnabledProjects(): Promise<ApiResponse<ProjectResource[]>> {
    const response: AxiosResponse<ApiResponse<ProjectResource[]>> =
      await this.client.get('/project/enabled')
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
    const response: AxiosResponse<ApiResponse<PictureResource[]>> =
      await this.client.get('/picture')
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

  async updatePicture(
    id: string,
    data: Partial<PictureResource>
  ): Promise<ApiResponse<PictureResource>> {
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
    const response: AxiosResponse<ApiResponse<CountryResource[]>> =
      await this.client.get('/country')
    return response.data
  }

  async getCountry(id: string): Promise<ApiResponse<CountryResource>> {
    const response: AxiosResponse<ApiResponse<CountryResource>> = await this.client.get(
      `/country/${id}`
    )
    return response.data
  }

  async createCountry(data: Partial<CountryResource>): Promise<ApiResponse<CountryResource>> {
    const response: AxiosResponse<ApiResponse<CountryResource>> = await this.client.post(
      '/country',
      data
    )
    return response.data
  }

  async updateCountry(
    id: string,
    data: Partial<CountryResource>
  ): Promise<ApiResponse<CountryResource>> {
    const response: AxiosResponse<ApiResponse<CountryResource>> = await this.client.put(
      `/country/${id}`,
      data
    )
    return response.data
  }

  async deleteCountry(id: string): Promise<void> {
    await this.client.delete(`/country/${id}`)
  }

  // Languages
  async getLanguages(): Promise<ApiResponse<LanguageResource[]>> {
    const response: AxiosResponse<ApiResponse<LanguageResource[]>> =
      await this.client.get('/language')
    return response.data
  }

  async getLanguage(id: string): Promise<ApiResponse<LanguageResource>> {
    const response: AxiosResponse<ApiResponse<LanguageResource>> = await this.client.get(
      `/language/${id}`
    )
    return response.data
  }

  async getDefaultLanguage(): Promise<ApiResponse<LanguageResource>> {
    const response: AxiosResponse<ApiResponse<LanguageResource>> =
      await this.client.get('/language/default')
    return response.data
  }

  async getEnglishLanguage(): Promise<ApiResponse<LanguageResource>> {
    const response: AxiosResponse<ApiResponse<LanguageResource>> =
      await this.client.get('/language/english')
    return response.data
  }

  async createLanguage(data: Partial<LanguageResource>): Promise<ApiResponse<LanguageResource>> {
    // Remove forbidden fields for creation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { is_default, ...createData } = data
    const response: AxiosResponse<ApiResponse<LanguageResource>> = await this.client.post(
      '/language',
      createData
    )
    return response.data
  }

  async updateLanguage(
    id: string,
    data: Partial<LanguageResource>
  ): Promise<ApiResponse<LanguageResource>> {
    // Remove forbidden fields for update
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { is_default, ...updateData } = data
    const response: AxiosResponse<ApiResponse<LanguageResource>> = await this.client.put(
      `/language/${id}`,
      updateData
    )
    return response.data
  }

  async setDefaultLanguage(id: string, isDefault: boolean): Promise<ApiResponse<LanguageResource>> {
    const response: AxiosResponse<ApiResponse<LanguageResource>> = await this.client.patch(
      `/language/${id}/default`,
      {
        is_default: isDefault,
      }
    )
    return response.data
  }

  async deleteLanguage(id: string): Promise<void> {
    await this.client.delete(`/language/${id}`)
  }

  // Details
  async getDetails(): Promise<ApiResponse<DetailResource[]>> {
    const response: AxiosResponse<ApiResponse<DetailResource[]>> = await this.client.get('/detail')
    return response.data
  }

  async getDetail(id: string): Promise<ApiResponse<DetailResource>> {
    const response: AxiosResponse<ApiResponse<DetailResource>> = await this.client.get(
      `/detail/${id}`
    )
    return response.data
  }

  async createDetail(
    data: Partial<DetailResource & { item_id: string }>
  ): Promise<ApiResponse<DetailResource>> {
    const response: AxiosResponse<ApiResponse<DetailResource>> = await this.client.post(
      '/detail',
      data
    )
    return response.data
  }

  async updateDetail(
    id: string,
    data: Partial<DetailResource & { item_id: string }>
  ): Promise<ApiResponse<DetailResource>> {
    const response: AxiosResponse<ApiResponse<DetailResource>> = await this.client.put(
      `/detail/${id}`,
      data
    )
    return response.data
  }

  async deleteDetail(id: string): Promise<void> {
    await this.client.delete(`/detail/${id}`)
  }

  // Available Images
  async getAvailableImages(): Promise<ApiResponse<AvailableImageResource[]>> {
    const response: AxiosResponse<ApiResponse<AvailableImageResource[]>> =
      await this.client.get('/available-image')
    return response.data
  }

  async getAvailableImage(id: string): Promise<ApiResponse<AvailableImageResource>> {
    const response: AxiosResponse<ApiResponse<AvailableImageResource>> = await this.client.get(
      `/available-image/${id}`
    )
    return response.data
  }

  async updateAvailableImage(
    id: string,
    data: { comment?: string | null }
  ): Promise<ApiResponse<AvailableImageResource>> {
    const response: AxiosResponse<ApiResponse<AvailableImageResource>> = await this.client.put(
      `/available-image/${id}`,
      data
    )
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
    const response: AxiosResponse<ApiResponse<ImageUploadResource[]>> =
      await this.client.get('/image-upload')
    return response.data
  }

  async getImageUpload(id: string): Promise<ApiResponse<ImageUploadResource>> {
    const response: AxiosResponse<ApiResponse<ImageUploadResource>> = await this.client.get(
      `/image-upload/${id}`
    )
    return response.data
  }

  async createImageUpload(formData: FormData): Promise<ApiResponse<ImageUploadResource>> {
    const response: AxiosResponse<ApiResponse<ImageUploadResource>> = await this.client.post(
      '/image-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  }

  async deleteImageUpload(id: string): Promise<void> {
    await this.client.delete(`/image-upload/${id}`)
  }

  // Address
  async getAddresses(): Promise<ApiResponse<AddressResource[]>> {
    const response: AxiosResponse<ApiResponse<AddressResource[]>> =
      await this.client.get('/address')
    return response.data
  }

  async getAddress(id: string): Promise<ApiResponse<AddressResource>> {
    const response: AxiosResponse<ApiResponse<AddressResource>> = await this.client.get(
      `/address/${id}`
    )
    return response.data
  }

  async createAddress(data: Partial<AddressResource>): Promise<ApiResponse<AddressResource>> {
    const response: AxiosResponse<ApiResponse<AddressResource>> = await this.client.post(
      '/address',
      data
    )
    return response.data
  }

  async updateAddress(
    id: string,
    data: Partial<AddressResource>
  ): Promise<ApiResponse<AddressResource>> {
    const response: AxiosResponse<ApiResponse<AddressResource>> = await this.client.put(
      `/address/${id}`,
      data
    )
    return response.data
  }

  async deleteAddress(id: string): Promise<void> {
    await this.client.delete(`/address/${id}`)
  }

  // --- AddressTranslation ---
  async getAddressTranslations(): Promise<ApiResponse<AddressTranslationResource[]>> {
    const response: AxiosResponse<ApiResponse<AddressTranslationResource[]>> =
      await this.client.get('/address-translation')
    return response.data
  }
  async getAddressTranslation(id: string): Promise<ApiResponse<AddressTranslationResource>> {
    const response: AxiosResponse<ApiResponse<AddressTranslationResource>> = await this.client.get(
      `/address-translation/${id}`
    )
    return response.data
  }
  async createAddressTranslation(
    data: Partial<AddressTranslationResource>
  ): Promise<ApiResponse<AddressTranslationResource>> {
    const response: AxiosResponse<ApiResponse<AddressTranslationResource>> = await this.client.post(
      '/address-translation',
      data
    )
    return response.data
  }
  async updateAddressTranslation(
    id: string,
    data: Partial<AddressTranslationResource>
  ): Promise<ApiResponse<AddressTranslationResource>> {
    const response: AxiosResponse<ApiResponse<AddressTranslationResource>> = await this.client.put(
      `/address-translation/${id}`,
      data
    )
    return response.data
  }
  async deleteAddressTranslation(id: string): Promise<void> {
    await this.client.delete(`/address-translation/${id}`)
  }

  // --- Contact ---
  async getContacts(): Promise<ApiResponse<ContactResource[]>> {
    const response: AxiosResponse<ApiResponse<ContactResource[]>> =
      await this.client.get('/contact')
    return response.data
  }
  async getContact(id: string): Promise<ApiResponse<ContactResource>> {
    const response: AxiosResponse<ApiResponse<ContactResource>> = await this.client.get(
      `/contact/${id}`
    )
    return response.data
  }
  async createContact(data: Partial<ContactResource>): Promise<ApiResponse<ContactResource>> {
    const response: AxiosResponse<ApiResponse<ContactResource>> = await this.client.post(
      '/contact',
      data
    )
    return response.data
  }
  async updateContact(
    id: string,
    data: Partial<ContactResource>
  ): Promise<ApiResponse<ContactResource>> {
    const response: AxiosResponse<ApiResponse<ContactResource>> = await this.client.put(
      `/contact/${id}`,
      data
    )
    return response.data
  }
  async deleteContact(id: string): Promise<void> {
    await this.client.delete(`/contact/${id}`)
  }

  // --- ContactTranslation ---
  async getContactTranslations(): Promise<ApiResponse<ContactTranslationResource[]>> {
    const response: AxiosResponse<ApiResponse<ContactTranslationResource[]>> =
      await this.client.get('/contact-translation')
    return response.data
  }
  async getContactTranslation(id: string): Promise<ApiResponse<ContactTranslationResource>> {
    const response: AxiosResponse<ApiResponse<ContactTranslationResource>> = await this.client.get(
      `/contact-translation/${id}`
    )
    return response.data
  }
  async createContactTranslation(
    data: Partial<ContactTranslationResource>
  ): Promise<ApiResponse<ContactTranslationResource>> {
    const response: AxiosResponse<ApiResponse<ContactTranslationResource>> = await this.client.post(
      '/contact-translation',
      data
    )
    return response.data
  }
  async updateContactTranslation(
    id: string,
    data: Partial<ContactTranslationResource>
  ): Promise<ApiResponse<ContactTranslationResource>> {
    const response: AxiosResponse<ApiResponse<ContactTranslationResource>> = await this.client.put(
      `/contact-translation/${id}`,
      data
    )
    return response.data
  }
  async deleteContactTranslation(id: string): Promise<void> {
    await this.client.delete(`/contact-translation/${id}`)
  }

  // --- DetailTranslation ---
  async getDetailTranslations(): Promise<ApiResponse<DetailTranslationResource[]>> {
    const response: AxiosResponse<ApiResponse<DetailTranslationResource[]>> =
      await this.client.get('/detail-translation')
    return response.data
  }
  async getDetailTranslation(id: string): Promise<ApiResponse<DetailTranslationResource>> {
    const response: AxiosResponse<ApiResponse<DetailTranslationResource>> = await this.client.get(
      `/detail-translation/${id}`
    )
    return response.data
  }
  async createDetailTranslation(
    data: Partial<DetailTranslationResource>
  ): Promise<ApiResponse<DetailTranslationResource>> {
    const response: AxiosResponse<ApiResponse<DetailTranslationResource>> = await this.client.post(
      '/detail-translation',
      data
    )
    return response.data
  }
  async updateDetailTranslation(
    id: string,
    data: Partial<DetailTranslationResource>
  ): Promise<ApiResponse<DetailTranslationResource>> {
    const response: AxiosResponse<ApiResponse<DetailTranslationResource>> = await this.client.put(
      `/detail-translation/${id}`,
      data
    )
    return response.data
  }
  async deleteDetailTranslation(id: string): Promise<void> {
    await this.client.delete(`/detail-translation/${id}`)
  }

  // --- ItemTranslation ---
  async getItemTranslations(): Promise<ApiResponse<ItemTranslationResource[]>> {
    const response: AxiosResponse<ApiResponse<ItemTranslationResource[]>> =
      await this.client.get('/item-translation')
    return response.data
  }
  async getItemTranslation(id: string): Promise<ApiResponse<ItemTranslationResource>> {
    const response: AxiosResponse<ApiResponse<ItemTranslationResource>> = await this.client.get(
      `/item-translation/${id}`
    )
    return response.data
  }
  async createItemTranslation(
    data: Partial<ItemTranslationResource>
  ): Promise<ApiResponse<ItemTranslationResource>> {
    const response: AxiosResponse<ApiResponse<ItemTranslationResource>> = await this.client.post(
      '/item-translation',
      data
    )
    return response.data
  }
  async updateItemTranslation(
    id: string,
    data: Partial<ItemTranslationResource>
  ): Promise<ApiResponse<ItemTranslationResource>> {
    const response: AxiosResponse<ApiResponse<ItemTranslationResource>> = await this.client.put(
      `/item-translation/${id}`,
      data
    )
    return response.data
  }
  async deleteItemTranslation(id: string): Promise<void> {
    await this.client.delete(`/item-translation/${id}`)
  }

  // --- Location ---
  async getLocations(): Promise<ApiResponse<LocationResource[]>> {
    const response: AxiosResponse<ApiResponse<LocationResource[]>> =
      await this.client.get('/location')
    return response.data
  }
  async getLocation(id: string): Promise<ApiResponse<LocationResource>> {
    const response: AxiosResponse<ApiResponse<LocationResource>> = await this.client.get(
      `/location/${id}`
    )
    return response.data
  }

  async createLocation(data: Partial<LocationResource>): Promise<ApiResponse<LocationResource>> {
    const response: AxiosResponse<ApiResponse<LocationResource>> = await this.client.post(
      '/location',
      data
    )
    return response.data
  }

  async updateLocation(
    id: string,
    data: Partial<LocationResource>
  ): Promise<ApiResponse<LocationResource>> {
    const response: AxiosResponse<ApiResponse<LocationResource>> = await this.client.put(
      `/location/${id}`,
      data
    )
    return response.data
  }

  async deleteLocation(id: string): Promise<void> {
    await this.client.delete(`/location/${id}`)
  }

  // --- LocationTranslation ---
  async getLocationTranslations(): Promise<ApiResponse<LocationTranslationResource[]>> {
    const response: AxiosResponse<ApiResponse<LocationTranslationResource[]>> =
      await this.client.get('/location-translation')
    return response.data
  }
  async getLocationTranslation(id: string): Promise<ApiResponse<LocationTranslationResource>> {
    const response: AxiosResponse<ApiResponse<LocationTranslationResource>> = await this.client.get(
      `/location-translation/${id}`
    )
    return response.data
  }
  async createLocationTranslation(
    data: Partial<LocationTranslationResource>
  ): Promise<ApiResponse<LocationTranslationResource>> {
    const response: AxiosResponse<ApiResponse<LocationTranslationResource>> =
      await this.client.post('/location-translation', data)
    return response.data
  }
  async updateLocationTranslation(
    id: string,
    data: Partial<LocationTranslationResource>
  ): Promise<ApiResponse<LocationTranslationResource>> {
    const response: AxiosResponse<ApiResponse<LocationTranslationResource>> = await this.client.put(
      `/location-translation/${id}`,
      data
    )
    return response.data
  }
  async deleteLocationTranslation(id: string): Promise<void> {
    await this.client.delete(`/location-translation/${id}`)
  }

  // --- Province ---
  async getProvinces(): Promise<ApiResponse<ProvinceResource[]>> {
    const response: AxiosResponse<ApiResponse<ProvinceResource[]>> =
      await this.client.get('/province')
    return response.data
  }
  async getProvince(id: string): Promise<ApiResponse<ProvinceResource>> {
    const response: AxiosResponse<ApiResponse<ProvinceResource>> = await this.client.get(
      `/province/${id}`
    )
    return response.data
  }
  async createProvince(data: Partial<ProvinceResource>): Promise<ApiResponse<ProvinceResource>> {
    const response: AxiosResponse<ApiResponse<ProvinceResource>> = await this.client.post(
      '/province',
      data
    )
    return response.data
  }
  async updateProvince(
    id: string,
    data: Partial<ProvinceResource>
  ): Promise<ApiResponse<ProvinceResource>> {
    const response: AxiosResponse<ApiResponse<ProvinceResource>> = await this.client.put(
      `/province/${id}`,
      data
    )
    return response.data
  }
  async deleteProvince(id: string): Promise<void> {
    await this.client.delete(`/province/${id}`)
  }

  // --- ProvinceTranslation ---
  async getProvinceTranslations(): Promise<ApiResponse<ProvinceTranslationResource[]>> {
    const response: AxiosResponse<ApiResponse<ProvinceTranslationResource[]>> =
      await this.client.get('/province-translation')
    return response.data
  }
  async getProvinceTranslation(id: string): Promise<ApiResponse<ProvinceTranslationResource>> {
    const response: AxiosResponse<ApiResponse<ProvinceTranslationResource>> = await this.client.get(
      `/province-translation/${id}`
    )
    return response.data
  }
  async createProvinceTranslation(
    data: Partial<ProvinceTranslationResource>
  ): Promise<ApiResponse<ProvinceTranslationResource>> {
    const response: AxiosResponse<ApiResponse<ProvinceTranslationResource>> =
      await this.client.post('/province-translation', data)
    return response.data
  }
  async updateProvinceTranslation(
    id: string,
    data: Partial<ProvinceTranslationResource>
  ): Promise<ApiResponse<ProvinceTranslationResource>> {
    const response: AxiosResponse<ApiResponse<ProvinceTranslationResource>> = await this.client.put(
      `/province-translation/${id}`,
      data
    )
    return response.data
  }
  async deleteProvinceTranslation(id: string): Promise<void> {
    await this.client.delete(`/province-translation/${id}`)
  }

  // --- TagItem ---
  async getTagItems(): Promise<ApiResponse<TagItemResource[]>> {
    const response: AxiosResponse<ApiResponse<TagItemResource[]>> =
      await this.client.get('/tag-item')
    return response.data
  }
  async getTagItem(id: string): Promise<ApiResponse<TagItemResource>> {
    const response: AxiosResponse<ApiResponse<TagItemResource>> = await this.client.get(
      `/tag-item/${id}`
    )
    return response.data
  }
  async createTagItem(data: Partial<TagItemResource>): Promise<ApiResponse<TagItemResource>> {
    const response: AxiosResponse<ApiResponse<TagItemResource>> = await this.client.post(
      '/tag-item',
      data
    )
    return response.data
  }
  async updateTagItem(
    id: string,
    data: Partial<TagItemResource>
  ): Promise<ApiResponse<TagItemResource>> {
    const response: AxiosResponse<ApiResponse<TagItemResource>> = await this.client.put(
      `/tag-item/${id}`,
      data
    )
    return response.data
  }
  async deleteTagItem(id: string): Promise<void> {
    await this.client.delete(`/tag-item/${id}`)
  }

  // --- Workshop ---
  async getWorkshops(): Promise<ApiResponse<WorkshopResource[]>> {
    const response: AxiosResponse<ApiResponse<WorkshopResource[]>> =
      await this.client.get('/workshop')
    return response.data
  }
  async getWorkshop(id: string): Promise<ApiResponse<WorkshopResource>> {
    const response: AxiosResponse<ApiResponse<WorkshopResource>> = await this.client.get(
      `/workshop/${id}`
    )
    return response.data
  }
  async createWorkshop(data: Partial<WorkshopResource>): Promise<ApiResponse<WorkshopResource>> {
    const response: AxiosResponse<ApiResponse<WorkshopResource>> = await this.client.post(
      '/workshop',
      data
    )
    return response.data
  }

  async updateWorkshop(
    id: string,
    data: Partial<WorkshopResource>
  ): Promise<ApiResponse<WorkshopResource>> {
    const response: AxiosResponse<ApiResponse<WorkshopResource>> = await this.client.put(
      `/workshop/${id}`,
      data
    )
    return response.data
  }

  async deleteWorkshop(id: string): Promise<void> {
    await this.client.delete(`/workshop/${id}`)
  }

  // --- Artist ---
  async getArtists(): Promise<ApiResponse<ArtistResource[]>> {
    const response: AxiosResponse<ApiResponse<ArtistResource[]>> = await this.client.get('/artist')
    return response.data
  }
  async getArtist(id: string): Promise<ApiResponse<ArtistResource>> {
    const response: AxiosResponse<ApiResponse<ArtistResource>> = await this.client.get(
      `/artist/${id}`
    )
    return response.data
  }
  async createArtist(data: Partial<ArtistResource>): Promise<ApiResponse<ArtistResource>> {
    const response: AxiosResponse<ApiResponse<ArtistResource>> = await this.client.post(
      '/artist',
      data
    )
    return response.data
  }
  async updateArtist(
    id: string,
    data: Partial<ArtistResource>
  ): Promise<ApiResponse<ArtistResource>> {
    const response: AxiosResponse<ApiResponse<ArtistResource>> = await this.client.put(
      `/artist/${id}`,
      data
    )
    return response.data
  }
  async deleteArtist(id: string): Promise<void> {
    await this.client.delete(`/artist/${id}`)
  }

  // --- Context ---
  async getContexts(): Promise<ApiResponse<ContextResource[]>> {
    const response: AxiosResponse<ApiResponse<ContextResource[]>> =
      await this.client.get('/context')
    return response.data
  }
  async getContext(id: string): Promise<ApiResponse<ContextResource>> {
    const response: AxiosResponse<ApiResponse<ContextResource>> = await this.client.get(
      `/context/${id}`
    )
    return response.data
  }
  async getDefaultContext(): Promise<ApiResponse<ContextResource>> {
    const response: AxiosResponse<ApiResponse<ContextResource>> =
      await this.client.get('/context/default')
    return response.data
  }
  async createContext(data: Partial<ContextResource>): Promise<ApiResponse<ContextResource>> {
    const response: AxiosResponse<ApiResponse<ContextResource>> = await this.client.post(
      '/context',
      data
    )
    return response.data
  }
  async updateContext(
    id: string,
    data: Partial<ContextResource>
  ): Promise<ApiResponse<ContextResource>> {
    const response: AxiosResponse<ApiResponse<ContextResource>> = await this.client.put(
      `/context/${id}`,
      data
    )
    return response.data
  }
  async setDefaultContext(id: string, isDefault: boolean): Promise<ApiResponse<ContextResource>> {
    const response: AxiosResponse<ApiResponse<ContextResource>> = await this.client.patch(
      `/context/${id}/default`,
      {
        is_default: isDefault,
      }
    )
    return response.data
  }
  async deleteContext(id: string): Promise<void> {
    await this.client.delete(`/context/${id}`)
  }

  // --- Author ---
  async getAuthors(): Promise<ApiResponse<AuthorResource[]>> {
    const response: AxiosResponse<ApiResponse<AuthorResource[]>> = await this.client.get('/author')
    return response.data
  }
  async getAuthor(id: string): Promise<ApiResponse<AuthorResource>> {
    const response: AxiosResponse<ApiResponse<AuthorResource>> = await this.client.get(
      `/author/${id}`
    )
    return response.data
  }
  async createAuthor(data: Partial<AuthorResource>): Promise<ApiResponse<AuthorResource>> {
    const response: AxiosResponse<ApiResponse<AuthorResource>> = await this.client.post(
      '/author',
      data
    )
    return response.data
  }
  async updateAuthor(
    id: string,
    data: Partial<AuthorResource>
  ): Promise<ApiResponse<AuthorResource>> {
    const response: AxiosResponse<ApiResponse<AuthorResource>> = await this.client.put(
      `/author/${id}`,
      data
    )
    return response.data
  }
  async deleteAuthor(id: string): Promise<void> {
    await this.client.delete(`/author/${id}`)
  }

  // --- Markdown ---
  async markdownToHtml(markdown: string): Promise<{ html: string }> {
    const response: AxiosResponse<{ html: string }> = await this.client.post('/markdown/to-html', {
      markdown,
    })
    return response.data
  }
  async markdownFromHtml(html: string): Promise<{ markdown: string }> {
    const response: AxiosResponse<{ markdown: string }> = await this.client.post(
      '/markdown/from-html',
      { html }
    )
    return response.data
  }
  async markdownValidate(markdown: string): Promise<{ valid: boolean }> {
    const response: AxiosResponse<{ valid: boolean }> = await this.client.post(
      '/markdown/validate',
      { markdown }
    )
    return response.data
  }
  async markdownPreview(markdown: string): Promise<{ html: string }> {
    const response: AxiosResponse<{ html: string }> = await this.client.post('/markdown/preview', {
      markdown,
    })
    return response.data
  }
  async markdownIsMarkdown(content: string): Promise<{ isMarkdown: boolean }> {
    const response: AxiosResponse<{ isMarkdown: boolean }> = await this.client.post(
      '/markdown/is-markdown',
      { content }
    )
    return response.data
  }
  async markdownAllowedElements(): Promise<{ elements: string[] }> {
    const response: AxiosResponse<{ elements: string[] }> = await this.client.get(
      '/markdown/allowed-elements'
    )
    return response.data
  }
}

export const apiClient = new ApiClient()
