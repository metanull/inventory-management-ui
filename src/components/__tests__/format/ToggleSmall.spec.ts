import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ToggleSmall from '../../format/ToggleSmall.vue'

describe('ToggleSmall', () => {
  const defaultProps = {
    title: 'Test Toggle',
    statusText: 'Enabled',
    isActive: true,
  }

  it('renders correctly', () => {
    const wrapper = mount(ToggleSmall, {
      props: defaultProps,
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('renders as a button with correct accessibility attributes', () => {
    const wrapper = mount(ToggleSmall, {
      props: defaultProps,
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.attributes('aria-label')).toBe('Toggle test toggle')
    expect(button.attributes('title')).toBe('Test Toggle: Enabled')
  })

  it('applies correct container styling', () => {
    const wrapper = mount(ToggleSmall, {
      props: defaultProps,
    })

    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('items-center')
    expect(wrapper.classes()).toContain('justify-center')
  })

  it('applies active styling when isActive is true', () => {
    const wrapper = mount(ToggleSmall, {
      props: { ...defaultProps, isActive: true },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('bg-indigo-600')
    expect(button.attributes('aria-pressed')).toBe('true')

    // Check slider position
    const slider = wrapper.find('.translate-x-5')
    expect(slider.exists()).toBe(true)
  })

  it('applies inactive styling when isActive is false', () => {
    const wrapper = mount(ToggleSmall, {
      props: { ...defaultProps, isActive: false },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('bg-gray-200')
    expect(button.attributes('aria-pressed')).toBe('false')

    // Check slider position
    const slider = wrapper.find('.translate-x-0')
    expect(slider.exists()).toBe(true)
  })

  it('shows inactive icon when isActive is false', () => {
    const wrapper = mount(ToggleSmall, {
      props: { ...defaultProps, isActive: false },
    })

    // The inactive icon should be visible (opacity-100)
    const inactiveIcon = wrapper.find('.opacity-100 svg')
    expect(inactiveIcon.exists()).toBe(true)
    expect(inactiveIcon.classes()).toContain('text-gray-400')
  })

  it('shows active icon when isActive is true', () => {
    const wrapper = mount(ToggleSmall, {
      props: { ...defaultProps, isActive: true },
    })

    // The active icon should be visible (opacity-100)
    const activeIconContainer = wrapper
      .findAll('.opacity-100')
      .find(el => el.find('svg').exists() && el.find('svg').classes().includes('text-indigo-600'))
    expect(activeIconContainer).toBeTruthy()
  })

  it('emits toggle event on button click', async () => {
    const wrapper = mount(ToggleSmall, {
      props: defaultProps,
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('toggle')).toBeTruthy()
  })

  it('does not emit toggle event when disabled', async () => {
    const wrapper = mount(ToggleSmall, {
      props: { ...defaultProps, disabled: true },
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('toggle')).toBeFalsy()
  })

  it('does not emit toggle event when loading', async () => {
    const wrapper = mount(ToggleSmall, {
      props: { ...defaultProps, loading: true },
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('toggle')).toBeFalsy()
  })

  it('applies disabled styling when disabled', () => {
    const wrapper = mount(ToggleSmall, {
      props: { ...defaultProps, disabled: true },
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('disabled:opacity-50')
    expect(button.classes()).toContain('disabled:cursor-not-allowed')
  })

  it('applies disabled styling when loading', () => {
    const wrapper = mount(ToggleSmall, {
      props: { ...defaultProps, loading: true },
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('updates aria-label based on title prop', () => {
    const wrapper = mount(ToggleSmall, {
      props: { ...defaultProps, title: 'Custom Title' },
    })

    const button = wrapper.find('button')
    expect(button.attributes('aria-label')).toBe('Toggle custom title')
  })

  it('updates title attribute based on title and status props', () => {
    const wrapper = mount(ToggleSmall, {
      props: {
        ...defaultProps,
        title: 'Custom Title',
        statusText: 'Custom Status',
      },
    })

    const button = wrapper.find('button')
    expect(button.attributes('title')).toBe('Custom Title: Custom Status')
  })
})
