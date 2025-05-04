import { redirect as nextRedirect } from 'next/navigation';
import { RouteDefinition, NavigationOptions } from '@/core/types';
import { generateUrl } from '@/core/route-builder';

/**
 * Type-safe redirect function
 * Can be used in Server Components or Server Actions
 * 
 * @param route - Route definition to redirect to
 * @param options - Optional params and query parameters
 */
export function redirect<R extends RouteDefinition>(
  route: R,
  options?: NavigationOptions<R>
): never {
  const url = generateUrl(route, options as any);
  return nextRedirect(url);
} 