import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InternalName from '../../format/InternalName.vue'

describe('InternalName', () => {
  it('renders correctly', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('displays internal name', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'My Internal Name',
      },
    })

    expect(wrapper.text()).toContain('My Internal Name')
  })

  it('applies correct CSS classes to internal name', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
      },
    })

    const nameElement = wrapper.find('.text-sm.font-medium.text-gray-900')
    expect(nameElement.exists()).toBe(true)
    expect(nameElement.text()).toBe('Test Name')
  })

  it('shows backward compatibility when provided', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
        backwardCompatibility: 'legacy-123',
      },
    })

    expect(wrapper.text()).toContain('Legacy ID: legacy-123')
  })

  it('applies correct CSS classes to backward compatibility', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
        backwardCompatibility: 'legacy-123',
      },
    })

    const legacyElement = wrapper.find('.text-sm.text-gray-500')
    expect(legacyElement.exists()).toBe(true)
    expect(legacyElement.text()).toBe('Legacy ID: legacy-123')
  })

  it('hides backward compatibility when null', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
        backwardCompatibility: null,
      },
    })

    expect(wrapper.text()).not.toContain('Legacy ID:')
  })

  it('hides backward compatibility when undefined', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
      },
    })

    expect(wrapper.text()).not.toContain('Legacy ID:')
  })

  it('hides backward compatibility when empty string', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
        backwardCompatibility: '',
      },
    })

    expect(wrapper.text()).not.toContain('Legacy ID:')
  })

  // Small variant tests
  it('renders small variant correctly', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
        small: true,
      },
    })

    expect(wrapper.exists()).toBe(true)
    // Should have icon container in small mode
    expect(wrapper.find('.h-10.w-10.rounded-full.bg-gray-200').exists()).toBe(true)
    expect(wrapper.find('.ml-4').exists()).toBe(true)
  })

  it('shows responsive icon container in small mode', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
        small: true,
      },
    })

    const iconContainer = wrapper.find('.flex-shrink-0.h-10.w-10.hidden.sm\\:flex')
    expect(iconContainer.exists()).toBe(true)
  })

  it('displays legacy text differently in small mode', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
        backwardCompatibility: 'legacy-123',
        small: true,
      },
    })

    expect(wrapper.text()).toContain('Legacy: legacy-123')
    expect(wrapper.find('.text-xs.text-gray-500').exists()).toBe(true)
  })

  it('renders slot content for icon in small mode', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
        small: true,
      },
      slots: {
        icon: '<div class="custom-icon">Custom Icon</div>',
      },
    })

    expect(wrapper.html()).toContain('Custom Icon')
  })

  it('uses default icon when no slot provided in small mode', () => {
    const wrapper = mount(InternalName, {
      props: {
        internalName: 'Test Name',
        small: true,
      },
    })

    // Should contain the default RectangleGroupIcon
    expect(wrapper.find('.h-5.w-5.text-gray-600').exists()).toBe(true)
  })
})
