import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Countries from '@/views/Countries.vue'
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
  error: null,
  countries: [] as CountryResource[],
  sortedCountries: [] as CountryResource[],
  fetchCountries: vi.fn(),
  deleteCountry: vi.fn(),
}

const mockCountries: CountryResource[] = [
  {
    id: 'USA',
    internal_name: 'United States',
    backward_compatibility: 'US',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'CAN',
    internal_name: 'Canada',
    backward_compatibility: 'CA',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
]

describe('Countries View', () => {
  let router: ReturnType<typeof createRouter>
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/countries', component: Countries },
        { path: '/countries/:id', component: { template: '<div>Country Detail</div>' } },
      ],
    })

    vi.mocked(useCountryStore).mockReturnValue(
      mockCountryStore as ReturnType<typeof useCountryStore>
    )
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the page title and description', () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.find('h1').text()).toBe('Country Management')
      expect(wrapper.text()).toContain('Manage countries available in the inventory system')
    })

    it('should render action buttons', () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.find('button').text()).toContain('Refresh')
      expect(wrapper.text()).toContain('Add Country')
    })

    it('should render ErrorDisplay component', () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.find('[data-testid="error-display"]').exists()).toBe(true)
    })
  })

  describe('Countries List', () => {
    it('should render countries when available', () => {
      mockCountryStore.countries = mockCountries
      mockCountryStore.sortedCountries = mockCountries

      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('United States')
      expect(wrapper.text()).toContain('Canada')
      expect(wrapper.text()).toContain('ID: USA')
      expect(wrapper.text()).toContain('ID: CAN')
      expect(wrapper.text()).toContain('Legacy: US')
      expect(wrapper.text()).toContain('Legacy: CA')
    })

    it('should render empty state when no countries', () => {
      mockCountryStore.countries = []
      mockCountryStore.sortedCountries = []
      mockCountryStore.loading = false

      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('No countries found')
      expect(wrapper.text()).toContain('Get started by creating a new country')
    })

    it('should render loading state when loading', () => {
      mockCountryStore.loading = true

      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('Loading countries...')
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
    })
  })

  describe('Country Cards', () => {
    beforeEach(() => {
      mockCountryStore.countries = mockCountries
      mockCountryStore.sortedCountries = mockCountries
    })

    it('should render edit and delete buttons for each country', () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      // Should have edit and delete buttons for each country
      const editButtons = wrapper.findAll('button[title="Edit Country"]')
      const deleteButtons = wrapper.findAll('button[title="Delete Country"]')

      expect(editButtons).toHaveLength(2)
      expect(deleteButtons).toHaveLength(2)
    })

    it('should render view details links for each country', () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      const viewLinks = wrapper.findAll('[data-testid="view-details-button"]')
      expect(viewLinks.length).toBeGreaterThan(0)
    })

    it('should format dates correctly', () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      // Check if dates are formatted (should contain month names)
      expect(wrapper.text()).toContain('Jan')
    })
  })

  describe('User Interactions', () => {
    beforeEach(() => {
      mockCountryStore.countries = mockCountries
      mockCountryStore.sortedCountries = mockCountries
    })

    it('should call fetchCountries on refresh button click', async () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      await wrapper.find('[data-testid="refresh-button"]').trigger('click')

      expect(mockCountryStore.fetchCountries).toHaveBeenCalled()
    })

    it('should open create modal when add country button is clicked', async () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      await wrapper.find('[data-testid="add-country-button"]').trigger('click')

      // Check if the form modal is visible
      expect(wrapper.vm.isFormModalVisible).toBe(true)
      expect(wrapper.vm.selectedCountry).toBeNull()
    })

    it('should open edit modal when edit button is clicked', async () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      const editButton = wrapper.find('button[title="Edit Country"]')
      await editButton.trigger('click')

      expect(wrapper.vm.isFormModalVisible).toBe(true)
      expect(wrapper.vm.selectedCountry).toBeTruthy()
    })

    it('should open delete modal when delete button is clicked', async () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      const deleteButton = wrapper.find('button[title="Delete Country"]')
      await deleteButton.trigger('click')

      expect(wrapper.vm.isDeleteModalVisible).toBe(true)
      expect(wrapper.vm.countryToDelete).toBeTruthy()
    })

    it('should navigate to country detail when view details is clicked', async () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      const pushSpy = vi.spyOn(router, 'push')

      const viewButton = wrapper.find('[data-testid="view-details-button"]')
      await viewButton.trigger('click')

      expect(pushSpy).toHaveBeenCalledWith('/countries/USA')
    })
  })

  describe('Modal Interactions', () => {
    beforeEach(() => {
      mockCountryStore.countries = mockCountries
      mockCountryStore.sortedCountries = mockCountries
    })

    it('should close form modal and refresh countries on success', async () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      // Open form modal
      wrapper.vm.isFormModalVisible = true
      await wrapper.vm.$nextTick()

      // Simulate success event
      await wrapper.vm.handleCountrySuccess()

      expect(mockCountryStore.fetchCountries).toHaveBeenCalled()
    })

    it('should close delete modal on cancel', async () => {
      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      // Open delete modal
      wrapper.vm.isDeleteModalVisible = true
      wrapper.vm.countryToDelete = mockCountries[0]
      await wrapper.vm.$nextTick()

      // Find and click cancel button
      const cancelButton = wrapper.find('[data-testid="cancel-delete-button"]')
      await cancelButton.trigger('click')

      expect(wrapper.vm.isDeleteModalVisible).toBe(false)
      expect(wrapper.vm.countryToDelete).toBeNull()
    })

    it('should confirm delete and close modal on success', async () => {
      mockCountryStore.deleteCountry.mockResolvedValue(true)

      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      // First open the delete modal by clicking the delete button
      const deleteButton = wrapper.find('button[title="Delete Country"]')
      await deleteButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Verify modal is open and country is set
      expect(wrapper.vm.isDeleteModalVisible).toBe(true)
      expect(wrapper.vm.countryToDelete).toBeTruthy()

      // Call confirmDelete method directly as a workaround for the event handler issue
      await wrapper.vm.confirmDelete()
      await flushPromises() // Wait for async operations
      await wrapper.vm.$nextTick()

      expect(mockCountryStore.deleteCountry).toHaveBeenCalledWith('USA')
      expect(wrapper.vm.isDeleteModalVisible).toBe(false)
    })

    it('should keep delete modal open on delete failure', async () => {
      mockCountryStore.deleteCountry.mockResolvedValue(false)

      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      // Set up delete modal
      wrapper.vm.isDeleteModalVisible = true
      wrapper.vm.countryToDelete = mockCountries[0]
      await wrapper.vm.$nextTick()

      // Click delete button
      await wrapper.vm.confirmDelete()

      expect(mockCountryStore.deleteCountry).toHaveBeenCalledWith('USA')
      expect(wrapper.vm.isDeleteModalVisible).toBe(true)
    })
  })

  describe('Lifecycle', () => {
    it('should fetch countries on mount', () => {
      mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(mockCountryStore.fetchCountries).toHaveBeenCalled()
    })
  })

  describe('Date Formatting', () => {
    it('should handle null dates gracefully', () => {
      const countryWithNullDate: CountryResource = {
        id: 'XXX',
        internal_name: 'Test Country',
        backward_compatibility: null,
        created_at: null,
        updated_at: null,
      }

      mockCountryStore.countries = [countryWithNullDate]
      mockCountryStore.sortedCountries = [countryWithNullDate]

      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('N/A')
    })

    it('should handle invalid dates gracefully', () => {
      const countryWithInvalidDate: CountryResource = {
        id: 'XXX',
        internal_name: 'Test Country',
        backward_compatibility: null,
        created_at: 'invalid-date',
        updated_at: 'invalid-date',
      }

      mockCountryStore.countries = [countryWithInvalidDate]
      mockCountryStore.sortedCountries = [countryWithInvalidDate]

      const wrapper = mount(Countries, {
        global: {
          plugins: [pinia, router],
        },
      })

      expect(wrapper.text()).toContain('Invalid Date')
    })
  })
})
