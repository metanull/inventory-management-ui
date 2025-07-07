import { setActivePinia, createPinia } from 'pinia'
import { useWorkshopStore } from '@/stores/workshop'

describe('Workshop Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty workshops', () => {
    const store = useWorkshopStore()
    expect(store.workshops).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })
})
