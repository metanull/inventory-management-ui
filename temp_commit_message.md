refactor: replace custom auth client with @metanull/inventory-app-api-client

- Replace custom authentication wrapper with direct usage of MobileAppAuthenticationApi
- Update auth store to use tokenAcquire() and tokenWipe() methods directly
- Update auth store tests to mock the new API client methods
- Temporarily disable exactOptionalPropertyTypes in tsconfig due to generated client incompatibility
- Maintain all existing authentication functionality and interfaces
- Ensure no breaking changes for existing auth store consumers

BREAKING: None - all existing auth store methods work identically

Resolves authentication refactoring requirements to use API client package directly without wrappers.
