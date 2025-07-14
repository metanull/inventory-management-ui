import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useApiStatus } from '../useApiStatus'

// Mock the API client
vi.mock('@metanull/inventory-app-api-client', () => ({
  Configuration: vi.fn(),
  InfoApi: vi.fn().mockImplementation(() => ({
    infoHealth: vi.fn(),
    infoVersion: vi.fn(),
    infoIndex: vi.fn(),
  })),
}))

describe('useApiStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { isApiUp, loading, error, versionData } = useApiStatus()

    expect(isApiUp.value).toBe(false)
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(versionData.value).toBeNull()
  })

  it('should return the InfoApi data properties', () => {
    const composable = useApiStatus()

    expect(composable).toHaveProperty('isApiUp')
    expect(composable).toHaveProperty('loading')
    expect(composable).toHaveProperty('error')
    expect(composable).toHaveProperty('versionData')
    expect(composable).toHaveProperty('checkApiStatus')
  })

  it('should have checkApiStatus function', () => {
    const { checkApiStatus } = useApiStatus()

    expect(typeof checkApiStatus).toBe('function')
  })
})
