// Core exports
export * from './core';

// Component exports
export { Link } from './components/link';
export type { LinkProps, StringRouteProps, RouteDefProps } from './components/link';

// Hook exports
export * from './hooks';

// Utility exports
export { redirect } from './utils/redirect';

/**
 * Interface for global route type augmentation.
 * Users can extend this interface to provide their own routes.
 */
export interface NextjsTypesafeRouting {
  /**
   * Routes registry that can be augmented by user
   * @example
   * declare module 'nextjs-typesafe-routing' {
   *   interface NextjsTypesafeRouting {
   *     routes: typeof MyRoutes
   *   }
   * }
   */
  routes?: Record<string, unknown>;
}

// Make the interface available for module augmentation
declare global {
  interface NextjsTypesafeRouting {
    routes?: Record<string, unknown>;
  }
}
