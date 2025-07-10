import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CountryForm from '@/components/CountryForm.vue'
import { useCountryStore } from '@/stores/country'
import type { CountryResource } from '@metanull/inventory-app-api-client'

// Mock the store
vi.mock('@/stores/country')
vi.mock('@/utils/errorHandler', () => ({
  ErrorHandler: {
    handleError: vi.fn(),
  },
}))

const mockCountryStore = {
  loading: false,
  createCountry: vi.fn(),
  updateCountry: vi.fn(),
  findCountryById: vi.fn(),
}

describe('CountryForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(useCountryStore).mockReturnValue(
      mockCountryStore as ReturnType<typeof useCountryStore>
    )
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render create form when no country is provided', () => {
      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      expect(wrapper.find('h3').text()).toBe('Create New Country')
      expect(wrapper.find('button[type="submit"]').text().trim()).toBe('Create Country')
      expect(wrapper.find('#id').attributes('disabled')).toBeUndefined()
    })

    it('should render edit form when country is provided', () => {
      const country: CountryResource = {
        id: 'USA',
        internal_name: 'United States',
        backward_compatibility: 'US',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
          country,
        },
      })

      expect(wrapper.find('h3').text()).toBe('Edit Country')
      expect(wrapper.find('button[type="submit"]').text().trim()).toBe('Update Country')
      expect(wrapper.find('#id').attributes('disabled')).toBeDefined()
    })

    it('should not render when isVisible is false', () => {
      const wrapper = mount(CountryForm, {
        props: {
          isVisible: false,
        },
      })

      expect(wrapper.find('.fixed').exists()).toBe(false)
    })
  })

  describe('Form Population', () => {
    it('should populate form fields when editing', async () => {
      const country: CountryResource = {
        id: 'USA',
        internal_name: 'United States',
        backward_compatibility: 'US',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const wrapper = mount(CountryForm, {
        props: {
          isVisible: false,
          country,
        },
      })

      // Show the modal which will trigger the watcher
      await wrapper.setProps({ isVisible: true })
      await wrapper.vm.$nextTick()
      await flushPromises() // Wait for async operations

      expect((wrapper.find('#id').element as HTMLInputElement).value).toBe('USA')
      expect((wrapper.find('#internal_name').element as HTMLInputElement).value).toBe(
        'United States'
      )
      expect((wrapper.find('#backward_compatibility').element as HTMLInputElement).value).toBe('US')
    })

    it('should clear form when switching from edit to create', async () => {
      const country: CountryResource = {
        id: 'USA',
        internal_name: 'United States',
        backward_compatibility: 'US',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
          country,
        },
      })

      await wrapper.setProps({ country: null })
      await wrapper.vm.$nextTick()

      expect((wrapper.find('#id').element as HTMLInputElement).value).toBe('')
      expect((wrapper.find('#internal_name').element as HTMLInputElement).value).toBe('')
      expect((wrapper.find('#backward_compatibility').element as HTMLInputElement).value).toBe('')
    })
  })

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      // Try to submit empty form
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Check for validation errors
      expect(
        wrapper.find('[data-testid="validation-error-id"]').exists() ||
          wrapper.text().includes('ID is required')
      ).toBe(true)
    })

    it('should validate ID format (3 uppercase letters)', async () => {
      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      // Test invalid ID length
      await wrapper.find('#id').setValue('US')
      await wrapper.vm.$nextTick()

      expect(wrapper.text().includes('ID must be exactly 3 characters')).toBe(true)

      // Test invalid characters
      await wrapper.find('#id').setValue('123')
      await wrapper.vm.$nextTick()

      expect(wrapper.text().includes('ID must contain only uppercase letters')).toBe(true)
    })

    it('should validate backward compatibility format (2 uppercase letters)', async () => {
      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      await wrapper.find('#backward_compatibility').setValue('U')
      await wrapper.vm.$nextTick()

      expect(wrapper.text().includes('Backward compatibility must be exactly 2 characters')).toBe(
        true
      )

      await wrapper.find('#backward_compatibility').setValue('12')
      await wrapper.vm.$nextTick()

      expect(wrapper.text().includes('Must contain only uppercase letters')).toBe(true)
    })

    it('should auto-uppercase ID and backward compatibility', async () => {
      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      await wrapper.find('#id').setValue('usa')
      await wrapper.find('#backward_compatibility').setValue('us')
      await wrapper.vm.$nextTick()

      expect((wrapper.find('#id').element as HTMLInputElement).value).toBe('USA')
      expect((wrapper.find('#backward_compatibility').element as HTMLInputElement).value).toBe('US')
    })

    it('should check for duplicate IDs when creating', async () => {
      mockCountryStore.findCountryById.mockReturnValue({
        id: 'USA',
        internal_name: 'United States',
      })

      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      await wrapper.find('#id').setValue('USA')
      await wrapper.vm.$nextTick()

      expect(wrapper.text().includes('A country with this ID already exists')).toBe(true)
    })
  })

  describe('Form Submission', () => {
    it('should create new country successfully', async () => {
      const mockCountry: CountryResource = {
        id: 'GBR',
        internal_name: 'United Kingdom',
        backward_compatibility: 'GB',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockCountryStore.createCountry.mockResolvedValue(mockCountry)
      mockCountryStore.findCountryById.mockReturnValue(undefined)

      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      // Fill form
      await wrapper.find('#id').setValue('GBR')
      await wrapper.find('#internal_name').setValue('United Kingdom')
      await wrapper.find('#backward_compatibility').setValue('GB')
      await wrapper.vm.$nextTick()

      // Submit form
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(mockCountryStore.createCountry).toHaveBeenCalledWith({
        id: 'GBR',
        internal_name: 'United Kingdom',
        backward_compatibility: 'GB',
      })
    })

    it('should update existing country successfully', async () => {
      const existingCountry: CountryResource = {
        id: 'USA',
        internal_name: 'United States',
        backward_compatibility: 'US',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const updatedCountry: CountryResource = {
        ...existingCountry,
        internal_name: 'United States of America',
      }

      mockCountryStore.updateCountry.mockResolvedValue(updatedCountry)

      const wrapper = mount(CountryForm, {
        props: {
          isVisible: false,
          country: existingCountry,
        },
      })

      // Show the modal which will trigger the watcher and populate the form
      await wrapper.setProps({ isVisible: true })
      await wrapper.vm.$nextTick()
      await flushPromises()

      // Update internal name
      await wrapper.find('#internal_name').setValue('United States of America')
      await wrapper.vm.$nextTick()

      // Submit form
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(mockCountryStore.updateCountry).toHaveBeenCalledWith('USA', {
        internal_name: 'United States of America',
        backward_compatibility: 'US',
      })
    })

    it('should handle submission errors gracefully', async () => {
      mockCountryStore.createCountry.mockResolvedValue(null)
      mockCountryStore.findCountryById.mockReturnValue(undefined)

      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      // Fill and submit form
      await wrapper.find('#id').setValue('GBR')
      await wrapper.find('#internal_name').setValue('United Kingdom')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Form should remain open on error
      expect(wrapper.find('.fixed').exists()).toBe(true)
    })
  })

  describe('Modal Controls', () => {
    it('should emit close event when cancel button is clicked', async () => {
      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      await wrapper.find('button[type="button"]').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should emit success event after successful submission', async () => {
      const mockCountry: CountryResource = {
        id: 'GBR',
        internal_name: 'United Kingdom',
        backward_compatibility: 'GB',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockCountryStore.createCountry.mockResolvedValue(mockCountry)
      mockCountryStore.findCountryById.mockReturnValue(undefined)

      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      // Fill and submit form
      await wrapper.find('#id').setValue('GBR')
      await wrapper.find('#internal_name').setValue('United Kingdom')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('success')).toBeTruthy()
      expect(wrapper.emitted('success')?.[0]).toEqual([mockCountry])
    })

    it('should disable submit button when form is invalid', async () => {
      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()

      // Fill required fields
      await wrapper.find('#id').setValue('GBR')
      await wrapper.find('#internal_name').setValue('United Kingdom')
      await wrapper.vm.$nextTick()

      expect(submitButton.attributes('disabled')).toBeUndefined()
    })

    it('should show loading state during submission', async () => {
      mockCountryStore.loading = true

      const wrapper = mount(CountryForm, {
        props: {
          isVisible: true,
        },
      })

      expect(wrapper.find('.animate-spin').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
    })
  })
})
