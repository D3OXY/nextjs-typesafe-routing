# nextjs-typesafe-routing

## 0.2.1

### Patch Changes

- ab3d053: Fixed type exports to properly expose NextjsTypesafeRouting interface and ensure createRouteRegistry is correctly exported in the package.

## 0.2.0

### Minor Changes

- e6dbf72: Improved type-safety for navigation hooks and added string literal support. Enhanced useRouter, usePathname, and redirect functions for better type checking with route parameters.
- e6dbf72: Enhanced type-safety and developer experience:
  - Added support for string literals with autocomplete in href
  - Added subpath imports for better organization (`/link`, `/navigation`, `/core`)
  - Added type checking for dynamic routes to require parameters
  - Improved typings to prevent usage errors

## 0.1.0

### Minor Changes

- Enhanced type-safety and developer experience:
  - Added support for string literals with autocomplete in href
  - Added subpath imports for better organization (`/link`, `/navigation`, `/core`)
  - Added type checking for dynamic routes to require parameters
  - Improved typings to prevent usage errors

## 0.0.2

### Patch Changes

- Initial release with core functionality:
  - Type-safe route definitions with `defineRoute`
  - Enhanced `Link` component with type safety
  - Type-safe navigation hooks (`useRouter`, `usePathname`)
  - Support for dynamic segments and query parameters
  - Type-safe `redirect` function
