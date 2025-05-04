// Core exports
export * from './core';

// Component exports
export { Link } from './components/link';
export type { LinkProps, StringRouteProps, RouteDefProps } from './components/link';

// Hook exports
export * from './hooks';

// Utility exports
export { redirect } from './utils/redirect';

// Create a declaration merging to allow users to augment the RoutesRegistry
declare global {
  interface NextjsTypesafeRouting {
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
}
