import { mount } from '@vue/test-utils'
import Authors from '../Authors.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Authors.vue', () => {
  it('renders authors list and handles loading', async () => {
    const wrapper = mount(Authors, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              author: {
                authors: [
                  {
                    id: '1',
                    name: 'Test Author',
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
    expect(wrapper.text()).toContain('Authors')
    expect(wrapper.text()).toContain('Test Author')
  })

  it('shows loading spinner', () => {
    const wrapper = mount(Authors, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              author: { authors: [], loading: true, error: null },
            },
          }),
        ],
      },
    })
    expect(wrapper.html()).toContain('loader')
  })

  it('shows error message', () => {
    const wrapper = mount(Authors, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              author: { authors: [], loading: false, error: 'Failed' },
            },
          }),
        ],
      },
    })
    expect(wrapper.text()).toContain('Failed')
  })
})
