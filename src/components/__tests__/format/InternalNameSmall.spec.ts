import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InternalNameSmall from '../../format/InternalNameSmall.vue'

describe('InternalNameSmall', () => {
  it('renders correctly', () => {
    const wrapper = mount(InternalNameSmall, {
      props: {
        internalName: 'Test Name',
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('displays internal name with correct styling', () => {
    const wrapper = mount(InternalNameSmall, {
      props: {
        internalName: 'My Internal Name',
      },
    })

    const nameElement = wrapper.find('.text-sm.font-medium.text-gray-900')
    expect(nameElement.exists()).toBe(true)
    expect(nameElement.text()).toBe('My Internal Name')
  })

  it('shows icon container with responsive classes', () => {
    const wrapper = mount(InternalNameSmall, {
      props: {
        internalName: 'Test Name',
      },
    })

    const iconContainer = wrapper.find('.h-10.w-10.hidden.sm\\:flex')
    expect(iconContainer.exists()).toBe(true)
  })

  it('renders default icon when no icon slot provided', () => {
    const wrapper = mount(InternalNameSmall, {
      props: {
        internalName: 'Test Name',
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.classes()).toContain('h-5')
    expect(svg.classes()).toContain('w-5')
    expect(svg.classes()).toContain('text-gray-600')
  })

  it('renders custom icon when icon slot provided', () => {
    const wrapper = mount(InternalNameSmall, {
      props: {
        internalName: 'Test Name',
      },
      slots: {
        icon: '<div class="custom-icon">Custom Icon</div>',
      },
    })

    expect(wrapper.html()).toContain('Custom Icon')
    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })

  it('shows backward compatibility with correct styling', () => {
    const wrapper = mount(InternalNameSmall, {
      props: {
        internalName: 'Test Name',
        backwardCompatibility: 'legacy-123',
      },
    })

    const legacyElement = wrapper.find('.text-xs.text-gray-500')
    expect(legacyElement.exists()).toBe(true)
    expect(legacyElement.text()).toBe('Legacy: legacy-123')
  })

  it('hides backward compatibility when null', () => {
    const wrapper = mount(InternalNameSmall, {
      props: {
        internalName: 'Test Name',
        backwardCompatibility: null,
      },
    })

    expect(wrapper.text()).not.toContain('Legacy:')
  })

  it('hides backward compatibility when undefined', () => {
    const wrapper = mount(InternalNameSmall, {
      props: {
        internalName: 'Test Name',
      },
    })

    expect(wrapper.text()).not.toContain('Legacy:')
  })

  it('hides backward compatibility when empty string', () => {
    const wrapper = mount(InternalNameSmall, {
      props: {
        internalName: 'Test Name',
        backwardCompatibility: '',
      },
    })

    expect(wrapper.text()).not.toContain('Legacy:')
  })

  it('has correct layout structure', () => {
    const wrapper = mount(InternalNameSmall, {
      props: {
        internalName: 'Test Name',
      },
    })

    // Check main flex container
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('items-center')

    // Check text container
    const textContainer = wrapper.find('.ml-4')
    expect(textContainer.exists()).toBe(true)
  })
})
