import { z } from 'zod';
import { DynamicRoutePattern, ExtractRouteParams, RouteDefinition } from './types';

/**
 * Creates a type-safe route definition
 * 
 * @param path - The route path (can include dynamic segments like /:id)
 * @param options - Optional params and query schemas for validation
 * @returns A route definition object
 * 
 * @example
 * ```typescript
 * const userRoute = defineRoute('/user/:id', {
 *   params: z.object({
 *     id: z.string()
 *   })
 * });
 * ```
 */
export function defineRoute<
  Path extends string,
  Params = Path extends DynamicRoutePattern ? ExtractRouteParams<Path> : never,
  Query = never
>(
  path: Path,
  options?: {
    params?: z.ZodType<Params>;
    query?: z.ZodType<Query>;
  }
): RouteDefinition<Path, Params, Query> {
  return {
    path,
    ...options
  };
}

/**
 * Generates a URL string from a route definition and parameters
 */
export function generateUrl<
  R extends RouteDefinition,
  P = R['params'] extends z.ZodType<infer T> ? T : never
>(
  route: R,
  options?: { 
    params?: P;
    query?: Record<string, string | number | boolean | undefined>; 
  }
): string {
  const { params, query } = options || {};
  
  // Handle path parameters
  let url = route.path;
  
  if (params) {
    // Replace :param with actual values
    url = Object.entries(params).reduce(
      (path, [key, value]) => path.replace(`:${key}`, String(value)),
      url
    );
  }
  
  // Add query parameters if present
  if (query) {
    const queryParams = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }
  
  return url;
}

/**
 * Validates parameters against a route's param schema
 */
export function validateRouteParams<
  R extends RouteDefinition,
  P = R['params'] extends z.ZodType<infer T> ? T : never
>(route: R, params: unknown): P {
  if (!route.params) {
    throw new Error(`Route ${route.path} does not have params schema defined`);
  }
  
  return route.params.parse(params) as P;
}

/**
 * Validates query parameters against a route's query schema
 */
export function validateRouteQuery<
  R extends RouteDefinition,
  Q = R['query'] extends z.ZodType<infer T> ? T : never
>(route: R, query: unknown): Q {
  if (!route.query) {
    throw new Error(`Route ${route.path} does not have query schema defined`);
  }
  
  return route.query.parse(query) as Q;
} 