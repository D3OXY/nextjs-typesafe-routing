import { z } from 'zod';
import { DynamicRoutePattern, ExtractRouteParams, RouteDefinition } from './types';
import { 
  hasParams,
  validateParams as validateRegistryParams,
  validateQuery as validateRegistryQuery,
  ValidateParamsSchema,
  ExtractPathParams
} from './registry';

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
    params?: Path extends DynamicRoutePattern 
      ? ValidateParamsSchema<Path, z.ZodType<Params>> 
      : never;
    query?: z.ZodType<Query>;
  }
): RouteDefinition<Path, Params, Query> {
  // Verify that dynamic routes have param validation
  if (hasParams(path) && !options?.params) {
    console.warn(`Route ${path} has parameters but no validation schema was provided.`);
  }

  // Verify that params match the path segments
  if (options?.params) {
    // Get expected params from path
    const pathSegments = path.split('/');
    const expectedParams: string[] = [];
    
    pathSegments.forEach(segment => {
      if (segment.startsWith(':')) {
        expectedParams.push(segment.slice(1));
      }
    });

    // Get actual params from schema
    const paramsShape = (options.params as any)._def?.shape;
    if (paramsShape) {
      const actualParams = Object.keys(paramsShape);

      // Check for missing params
      const missingParams = expectedParams.filter(param => !actualParams.includes(param));
      if (missingParams.length > 0) {
        console.error(`Route ${path} is missing parameter validations for: ${missingParams.join(', ')}`);
      }

      // Check for extra params
      const extraParams = actualParams.filter(param => !expectedParams.includes(param));
      if (extraParams.length > 0) {
        console.warn(`Route ${path} has extra parameter validations that don't appear in the path: ${extraParams.join(', ')}`);
      }
    }
  }

  return {
    path,
    ...options
  };
}

/**
 * Generates a URL string from a route definition and parameters
 * @deprecated Use generateUrl from registry instead
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
  
  // Validate parameters if schema exists
  if (route.params && params) {
    validateRegistryParams(route, params);
  } else if (hasParams(route) && !params) {
    console.warn(`Route ${route.path} has parameters but none were provided.`);
  }
  
  // Validate query if schema exists
  if (route.query && query) {
    validateRegistryQuery(route, query);
  }
  
  // Handle path parameters
  let url = route.path;
  
  if (params) {
    // Replace :param with actual values
    url = Object.entries(params as Record<string, any>).reduce(
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
  return validateRegistryParams(route, params);
}

/**
 * Validates query parameters against a route's query schema
 */
export function validateRouteQuery<
  R extends RouteDefinition,
  Q = R['query'] extends z.ZodType<infer T> ? T : never
>(route: R, query: unknown): Q {
  return validateRegistryQuery(route, query);
} 