<template>
  <div class="p-4 border border-gray-200 rounded-lg bg-yellow-50">
    <h3 class="text-lg font-medium text-yellow-800 mb-4">Error Testing Panel</h3>
    <div class="space-y-3">
      <button
        @click="testAuthError"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Test Authentication Error (401)
      </button>
      <button
        @click="testValidationError"
        class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Test Validation Error (422)
      </button>
      <button
        @click="testNetworkError"
        class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Test Network Error
      </button>
      <button
        @click="testServerError"
        class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Test Server Error (500)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useErrorHandler } from '@/utils/errorHandler'
import { apiClient } from '@/api/client'

const { handleError } = useErrorHandler()

const testAuthError = async () => {
  try {
    // Temporarily corrupt the auth token to trigger 401
    const originalToken = localStorage.getItem('auth_token')
    localStorage.setItem('auth_token', 'invalid_token_for_testing')
    
    // Try to make a request that will fail with 401
    await apiClient.getCountries()
    
    // Restore original token
    if (originalToken) {
      localStorage.setItem('auth_token', originalToken)
    } else {
      localStorage.removeItem('auth_token')
    }
  } catch (error) {
    // Error is automatically handled by the API client interceptor
    console.log('Auth error test completed')
    
    // Restore original token
    const originalToken = localStorage.getItem('auth_token')
    if (originalToken === 'invalid_token_for_testing') {
      localStorage.removeItem('auth_token')
    }
  }
}

const testValidationError = async () => {
  try {
    // Try to create a country with invalid data
    await apiClient.createCountry({
      internal_name: '', // Empty required field
      backward_compatibility: 'toolong', // Too long
    } as any)
  } catch (error) {
    console.log('Validation error test completed')
  }
}

const testNetworkError = () => {
  // Simulate a network error
  handleError({
    code: 'NETWORK_ERROR',
    message: 'Network connection failed'
  }, 'Error Testing')
}

const testServerError = async () => {
  try {
    // Try to access a non-existent endpoint to trigger 404 (which will be handled as an error)
    await apiClient.getCountry('nonexistent-country-id-12345')
  } catch (error) {
    console.log('Server error test completed')
  }
}
</script>
