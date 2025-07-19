import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ViewButton from '../../../layout/list/ViewButton.vue'

describe('ViewButton', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ViewButton)

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('applies correct styling classes', () => {
    const wrapper = mount(ViewButton)

    expect(wrapper.classes()).toContain('text-indigo-600')
    expect(wrapper.classes()).toContain('hover:text-indigo-900')
  })

  it('has default tooltip', () => {
    const wrapper = mount(ViewButton)

    expect(wrapper.attributes('title')).toBe('View details')
  })

  it('uses custom tooltip when provided', () => {
    const wrapper = mount(ViewButton, {
      props: {
        tooltip: 'Custom tooltip text',
      },
    })

    expect(wrapper.attributes('title')).toBe('Custom tooltip text')
  })

  it('is not disabled by default', () => {
    const wrapper = mount(ViewButton)

    expect(wrapper.attributes('disabled')).toBeUndefined()
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(ViewButton, {
      props: {
        disabled: true,
      },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('applies disabled styling when disabled', () => {
    const wrapper = mount(ViewButton, {
      props: {
        disabled: true,
      },
    })

    expect(wrapper.classes()).toContain('text-gray-400')
    expect(wrapper.classes()).toContain('cursor-not-allowed')
  })

  it('applies hover styling when not disabled', () => {
    const wrapper = mount(ViewButton, {
      props: {
        disabled: false,
      },
    })

    expect(wrapper.classes()).toContain('hover:text-indigo-900')
  })

  it('emits click event when clicked and not disabled', async () => {
    const wrapper = mount(ViewButton)

    await wrapper.trigger('click')

    expect(wrapper.emitted().click).toBeTruthy()
    expect(wrapper.emitted().click).toHaveLength(1)
  })

  it('does not emit click event when disabled', async () => {
    const wrapper = mount(ViewButton, {
      props: {
        disabled: true,
      },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted().click).toBeFalsy()
  })

  it('renders eye icon with correct attributes', () => {
    const wrapper = mount(ViewButton)

    const icon = wrapper.find('svg')
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('h-4')
    expect(icon.classes()).toContain('w-4')
    expect(icon.attributes('fill')).toBe('none')
    expect(icon.attributes('stroke')).toBe('currentColor')
    expect(icon.attributes('viewBox')).toBe('0 0 24 24')
  })

  it('has correct eye icon paths', () => {
    const wrapper = mount(ViewButton)

    const paths = wrapper.findAll('svg path')
    expect(paths.length).toBe(2)

    // First path (inner eye circle)
    expect(paths[0].attributes('stroke-linecap')).toBe('round')
    expect(paths[0].attributes('stroke-linejoin')).toBe('round')
    expect(paths[0].attributes('stroke-width')).toBe('2')
    expect(paths[0].attributes('d')).toBe('M15 12a3 3 0 11-6 0 3 3 0 016 0z')

    // Second path (outer eye shape)
    expect(paths[1].attributes('stroke-linecap')).toBe('round')
    expect(paths[1].attributes('stroke-linejoin')).toBe('round')
    expect(paths[1].attributes('stroke-width')).toBe('2')
    expect(paths[1].attributes('d')).toBe(
      'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
    )
  })

  it('handles click event properly when enabled', async () => {
    const wrapper = mount(ViewButton, {
      props: {
        disabled: false,
      },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted().click).toBeTruthy()
    expect(wrapper.emitted().click).toHaveLength(1)
  })

  it('handles disabled state correctly', () => {
    const wrapper = mount(ViewButton, {
      props: {
        disabled: true,
        tooltip: 'Cannot view this item',
      },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('title')).toBe('Cannot view this item')
    expect(wrapper.classes()).toContain('text-gray-400')
    expect(wrapper.classes()).toContain('cursor-not-allowed')
  })
})
