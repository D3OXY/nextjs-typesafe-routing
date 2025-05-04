import { z } from 'zod';
import { RouteDefinition, DynamicRoutePattern } from './types';

/**
 * Internal registry for storing all routes
 */
export const routeRegistry: Record<string, RouteDefinition> = {};

/**
 * Internal registry for path-indexed routes
 */
export const pathRegistry: Record<string, RouteDefinition> = {};

/**
 * Type for extracting path parameters from a route path
 */
export type ExtractPathParams<Path extends string> =
  Path extends `${string}/:${infer Param}/${infer Rest}`
    ? Param | ExtractPathParams<`/${Rest}`>
    : Path extends `${string}/:${infer Param}`
      ? Param
      : never;

/**
 * Validates that a params schema contains all required keys from the path
 */
export type ValidateParamsSchema<
  Path extends string,
  Schema extends z.ZodType<any>
> = Schema extends z.ZodObject<infer Shape> 
  ? keyof Shape extends ExtractPathParams<Path>
    ? ExtractPathParams<Path> extends keyof Shape
      ? Schema
      : never // Missing required keys
    : never // Contains extra keys
  : never;

/**
 * Registers routes automatically and provides strong typing
 * @param routes Object containing route definitions
 * @returns The same routes object with proper typing
 */
export function createRouteRegistry<T extends Record<string, RouteDefinition>>(
  routes: T
): T {
  // Register all routes
  Object.entries(routes).forEach(([key, route]) => {
    routeRegistry[key] = route;
    pathRegistry[route.path] = route;
  });
  
  return routes;
}

/**
 * Gets a route by its path string
 * @param path The path to look up
 * @returns The route definition or undefined if not found
 */
export function getRouteByPath(path: string): RouteDefinition | undefined {
  return pathRegistry[path];
}

/**
 * Gets a route by name
 * @param name The route name to look up
 * @returns The route definition or undefined if not found
 */
export function getRouteByName(name: string): RouteDefinition | undefined {
  return routeRegistry[name];
}

/**
 * Checks if a route has parameters
 * @param route The route to check
 * @returns True if the route has parameters
 */
export function hasParams(route: RouteDefinition | string): boolean {
  const path = typeof route === 'string' ? route : route.path;
  return path.includes('/:');
}

/**
 * Validates parameters against a route
 * @param route The route to validate against
 * @param params The parameters to validate
 * @returns Validated parameters
 * @throws Error if validation fails
 */
export function validateParams<R extends RouteDefinition>(
  route: R,
  params: unknown
): any {
  if (!route.params) {
    if (hasParams(route)) {
      throw new Error(`Route ${route.path} has parameters but no validation schema`);
    }
    return {};
  }
  
  return route.params.parse(params);
}

/**
 * Validates query parameters against a route
 * @param route The route to validate against
 * @param query The query parameters to validate
 * @returns Validated query parameters
 * @throws Error if validation fails
 */
export function validateQuery<R extends RouteDefinition>(
  route: R,
  query: unknown
): any {
  if (!route.query) {
    return {};
  }
  
  return route.query.parse(query);
}

/**
 * Generates a URL from a route and parameters
 * @param route The route to generate a URL for
 * @param options Parameters and query options
 * @returns The generated URL
 */
export function generateUrl(
  routeOrPath: RouteDefinition | string,
  options?: { 
    params?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | undefined>;
  }
): string {
  const { params, query } = options || {};
  
  // Get the path string
  let path: string;
  if (typeof routeOrPath === 'string') {
    path = routeOrPath;
  } else {
    path = routeOrPath.path;
    
    // Validate params if we have a schema
    if (routeOrPath.params && params) {
      try {
        validateParams(routeOrPath, params);
      } catch (error) {
        console.error(`Invalid params for route ${path}:`, error);
        throw error;
      }
    }
    
    // Validate query if we have a schema
    if (routeOrPath.query && query) {
      try {
        validateQuery(routeOrPath, query);
      } catch (error) {
        console.error(`Invalid query for route ${path}:`, error);
        throw error;
      }
    }
  }
  
  // Replace path parameters
  if (params) {
    path = Object.entries(params).reduce(
      (acc, [key, value]) => acc.replace(`:${key}`, String(value)),
      path
    );
  } else if (hasParams(path)) {
    console.warn(`Route ${path} has parameters but none were provided`);
  }
  
  // Add query parameters
  if (query) {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      path = `${path}?${queryString}`;
    }
  }
  
  return path;
} 