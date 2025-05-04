import { redirect as nextRedirect } from 'next/navigation';
import { RouteDefinition, NavigationOptions, StringRouteOptions } from '@/core/types';
import { generateUrl } from '@/core/registry';

/**
 * Type-safe redirect function
 * Can be used in Server Components or Server Actions
 * 
 * @param route - Route definition to redirect to
 * @param options - Optional params and query parameters
 */
export function redirect<R extends RouteDefinition>(
  route: R | string,
  options?: R extends RouteDefinition ? NavigationOptions<R> : StringRouteOptions
): never {
  const url = generateUrl(route, options as any);
  return nextRedirect(url);
} 