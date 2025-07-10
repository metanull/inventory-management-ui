import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import CountryDetail from '@/views/CountryDetail.vue'
import { useCountryStore } from '@/stores/country'
import type { CountryResource } from '@metanull/inventory-app-api-client'

// Mock the components
vi.mock('@/components/CountryForm.vue', () => ({
  default: {
    name: 'CountryForm',
    template: '<div data-testid="country-form"></div>',
    props: ['isVisible', 'country'],
    emits: ['close', 'success'],
  },
}))

vi.mock('@/components/ErrorDisplay.vue', () => ({
  default: {
    name: 'ErrorDisplay',
    template: '<div data-testid="error-display"></div>',
  },
}))

// Mock the store
vi.mock('@/stores/country')

const mockCountryStore = {
  loading: false,
  error: null as string | null,
  currentCountry: null as CountryResource | null,
  fetchCountry: vi.fn(),
  deleteCountry: vi.fn(),
}

const mockCountry: CountryResource = {
  id: 'USA',
  internal_name: 'United States',
  backward_compatibility: 'US',
  created_at: '2024-01-01T12:00:00Z',
  updated_at: '2024-01-02T14:30:00Z',
}

describe('CountryDetail View', () => {
  let router: ReturnType<typeof createRouter>
  let pinia: ReturnType<typeof createPinia>

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/countries', component: { template: '<div>Countries</div>' } },
        { path: '/countries/:id', component: CountryDetail },
      ],
    })

    // Set initial route
    await router.push('/countries/USA')
    await router.isReady()

    vi.mocked(useCountryStore).mockReturnValue(
      mockCountryStore as ReturnType<typeof useCountryStore>
    )
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render loading state when loading', async () => {
      mockCountryStore.loading = true
      mockCountryStore.currentCountry = null

      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('Loading country details...')
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
    })

    it('should render country details when loaded', async () => {
      mockCountryStore.loading = false
      mockCountryStore.currentCountry = mockCountry

      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.find('h1').text()).toContain('United States')
      expect(wrapper.find('h1').text()).toContain('(USA)')
      expect(wrapper.text()).toContain('Country details and information')
    })

    it('should render error state when error occurs', async () => {
      mockCountryStore.loading = false
      mockCountryStore.currentCountry = null
      mockCountryStore.error = 'Country not found'

      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('Country not found')
      expect(wrapper.text()).toContain('The requested country could not be loaded')
    })

    it('should render action buttons when country is loaded', async () => {
      mockCountryStore.loading = false
      mockCountryStore.currentCountry = mockCountry

      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('Edit Country')
      expect(wrapper.text()).toContain('Delete Country')
    })

    it('should render back to countries button', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('Back to Countries')
    })
  })

  describe('Country Information Display', () => {
    beforeEach(() => {
      mockCountryStore.loading = false
      mockCountryStore.currentCountry = mockCountry
    })

    it('should display all country information fields', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('Country ID')
      expect(wrapper.text()).toContain('USA')
      expect(wrapper.text()).toContain('Internal Name')
      expect(wrapper.text()).toContain('United States')
      expect(wrapper.text()).toContain('Backward Compatibility')
      expect(wrapper.text()).toContain('US')
      expect(wrapper.text()).toContain('Created At')
      expect(wrapper.text()).toContain('Last Updated')
    })

    it('should display "Not set" for null backward compatibility', async () => {
      const countryWithoutBackwardCompatibility: CountryResource = {
        ...mockCountry,
        backward_compatibility: null,
      }
      mockCountryStore.currentCountry = countryWithoutBackwardCompatibility

      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('Not set')
    })

    it('should display ISO standards information', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('ISO Standards')
      expect(wrapper.text()).toContain('ISO 3166-1 alpha-3')
      expect(wrapper.text()).toContain('Current country code (3 letters)')
      expect(wrapper.text()).toContain('ISO 3166-1 alpha-2')
      expect(wrapper.text()).toContain('Legacy country code (2 letters)')
    })

    it('should not display alpha-2 section when backward compatibility is null', async () => {
      const countryWithoutBackwardCompatibility: CountryResource = {
        ...mockCountry,
        backward_compatibility: null,
      }
      mockCountryStore.currentCountry = countryWithoutBackwardCompatibility

      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('ISO 3166-1 alpha-3')
      expect(wrapper.text()).not.toContain('ISO 3166-1 alpha-2')
    })
  })

  describe('Date Formatting', () => {
    beforeEach(() => {
      mockCountryStore.loading = false
      mockCountryStore.currentCountry = mockCountry
    })

    it('should format dates correctly', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      // Check for formatted date components
      expect(wrapper.text()).toContain('January')
      expect(wrapper.text()).toContain('2024')
    })

    it('should handle null dates gracefully', async () => {
      const countryWithNullDates: CountryResource = {
        ...mockCountry,
        created_at: null,
        updated_at: null,
      }
      mockCountryStore.currentCountry = countryWithNullDates

      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('N/A')
    })

    it('should handle invalid dates gracefully', async () => {
      const countryWithInvalidDates: CountryResource = {
        ...mockCountry,
        created_at: 'invalid-date',
        updated_at: 'invalid-date',
      }
      mockCountryStore.currentCountry = countryWithInvalidDates

      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('Invalid Date')
    })
  })

  describe('User Interactions', () => {
    beforeEach(() => {
      mockCountryStore.loading = false
      mockCountryStore.currentCountry = mockCountry
    })

    it('should navigate back to countries list when back button is clicked', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      const pushSpy = vi.spyOn(router, 'push')

      const backButton = wrapper.find('[data-testid="back-to-countries-button"]')
      await backButton.trigger('click')

      expect(pushSpy).toHaveBeenCalledWith('/countries')
    })

    it('should open edit modal when edit button is clicked', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      const editButton = wrapper.find('[data-testid="edit-country-button"]')
      await editButton.trigger('click')

      expect(wrapper.vm.isEditModalVisible).toBe(true)
    })

    it('should open delete modal when delete button is clicked', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      const deleteButton = wrapper.find('[data-testid="delete-country-button"]')
      await deleteButton.trigger('click')

      expect(wrapper.vm.isDeleteModalVisible).toBe(true)
    })

    it('should close edit modal on cancel', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      // Open modal first
      wrapper.vm.isEditModalVisible = true
      await wrapper.vm.$nextTick()

      // Close it
      wrapper.vm.closeEditModal()

      expect(wrapper.vm.isEditModalVisible).toBe(false)
    })

    it('should refresh country data after successful update', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      await wrapper.vm.handleCountryUpdate()

      expect(mockCountryStore.fetchCountry).toHaveBeenCalledWith('USA')
    })
  })

  describe('Delete Functionality', () => {
    beforeEach(() => {
      mockCountryStore.loading = false
      mockCountryStore.currentCountry = mockCountry
    })

    it('should show delete confirmation modal', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      // Open delete modal
      wrapper.vm.isDeleteModalVisible = true
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Delete Country')
      expect(wrapper.text()).toContain(
        'Are you sure you want to delete the country "United States"?'
      )
      expect(wrapper.text()).toContain('This action cannot be undone')
    })

    it('should close delete modal on cancel', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      // Open delete modal
      wrapper.vm.isDeleteModalVisible = true
      await wrapper.vm.$nextTick()

      // Find and click cancel button
      const cancelButton = wrapper.find('[data-testid="cancel-delete-button"]')
      await cancelButton.trigger('click')

      expect(wrapper.vm.isDeleteModalVisible).toBe(false)
    })

    it('should navigate to countries list after successful deletion', async () => {
      mockCountryStore.deleteCountry.mockResolvedValue(true)

      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      const pushSpy = vi.spyOn(router, 'push')

      await wrapper.vm.confirmDelete()

      expect(mockCountryStore.deleteCountry).toHaveBeenCalledWith('USA')
      expect(pushSpy).toHaveBeenCalledWith('/countries')
    })

    it('should stay on page if deletion fails', async () => {
      mockCountryStore.deleteCountry.mockResolvedValue(false)

      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      const pushSpy = vi.spyOn(router, 'push')

      await wrapper.vm.confirmDelete()

      expect(mockCountryStore.deleteCountry).toHaveBeenCalledWith('USA')
      expect(pushSpy).not.toHaveBeenCalled()
    })
  })

  describe('Lifecycle and Route Changes', () => {
    it('should fetch country on mount', async () => {
      mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(mockCountryStore.fetchCountry).toHaveBeenCalledWith('USA')
    })

    it('should fetch new country when route parameter changes', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      // Simulate route change
      await router.push('/countries/CAN')
      await wrapper.vm.$nextTick()

      expect(mockCountryStore.fetchCountry).toHaveBeenCalledWith('CAN')
    })
  })

  describe('Error State Navigation', () => {
    beforeEach(() => {
      mockCountryStore.loading = false
      mockCountryStore.currentCountry = null
      mockCountryStore.error = 'Country not found'
    })

    it('should navigate back to countries from error state', async () => {
      const wrapper = mount(CountryDetail, {
        global: {
          plugins: [pinia, router],
        },
      })

      const pushSpy = vi.spyOn(router, 'push')

      const backButton = wrapper.find('[data-testid="back-to-countries-button"]')
      await backButton.trigger('click')

      expect(pushSpy).toHaveBeenCalledWith('/countries')
    })
  })
})
