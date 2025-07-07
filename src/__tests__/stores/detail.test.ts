import { setActivePinia, createPinia } from 'pinia'
import { useDetailStore } from '@/stores/detail'

describe('Detail Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty details', () => {
    const store = useDetailStore()
    expect(store.details).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })
})
