// Core exports
export { defineRoute, generateUrl, validateRouteParams, validateRouteQuery } from './core/route-builder';
export { RouteProvider, useRoutes, useRoute } from './core/route-provider';
export type { 
  RouteDefinition,
  DynamicRoutePattern,
  ExtractRouteParams,
  NavigationOptions,
  TypedRouter,
  TypedPathname
} from './core/types';

// Component exports
export { Link } from './components/link';
export type { LinkProps } from './components/link';

// Hook exports
export { useRouter } from './hooks/use-router';
export { usePathname } from './hooks/use-pathname';

// Utility exports
export { redirect } from './utils/redirect';
