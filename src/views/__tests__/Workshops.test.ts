import { mount } from '@vue/test-utils'
import Workshops from '../Workshops.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Workshops.vue', () => {
  it('renders workshops list and handles loading', async () => {
    const wrapper = mount(Workshops, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              workshop: {
                workshops: [
                  {
                    id: '1',
                    name: 'Test Workshop',
                    internal_name: 'test',
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
    expect(wrapper.text()).toContain('Workshops')
    expect(wrapper.text()).toContain('Test Workshop')
  })

  it('shows loading spinner', () => {
    const wrapper = mount(Workshops, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              workshop: { workshops: [], loading: true, error: null },
            },
          }),
        ],
      },
    })
    expect(wrapper.html()).toContain('loader')
  })

  it('shows error message', () => {
    const wrapper = mount(Workshops, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              workshop: { workshops: [], loading: false, error: 'Failed' },
            },
          }),
        ],
      },
    })
    expect(wrapper.text()).toContain('Failed')
  })
})
