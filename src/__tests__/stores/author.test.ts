import { setActivePinia, createPinia } from 'pinia'
import { useAuthorStore } from '@/stores/author'

describe('Author Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty authors', () => {
    const store = useAuthorStore()
    expect(store.authors).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })
})
