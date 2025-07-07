import { mount } from '@vue/test-utils'
import Details from '../Details.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Details.vue', () => {
  it('renders details list and handles loading', async () => {
    const wrapper = mount(Details, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              detail: {
                details: [
                  {
                    id: '1',
                    internal_name: 'Test Detail',
                    backward_compatibility: null,
                    created_at: null,
                    updated_at: null,
                  },
                ],
                loading: false,
                error: null,
              },
            },
          }),
        ],
      },
    })
    expect(wrapper.text()).toContain('Details')
    expect(wrapper.text()).toContain('Test Detail')
  })

  it('shows loading spinner', () => {
    const wrapper = mount(Details, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              detail: { details: [], loading: true, error: null },
            },
          }),
        ],
      },
    })
    expect(wrapper.html()).toContain('loader')
  })

  it('shows error message', () => {
    const wrapper = mount(Details, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              detail: { details: [], loading: false, error: 'Failed' },
            },
          }),
        ],
      },
    })
    expect(wrapper.text()).toContain('Failed')
  })
})
