import { z } from 'zod';

/**
 * Get user-provided routes from global interface
 */
export type UserProvidedRoutes = 
  NonNullable<NextjsTypesafeRouting['routes']> extends Record<string, RouteDefinition>
    ? NonNullable<NextjsTypesafeRouting['routes']>
    : Record<string, RouteDefinition>;

/**
 * Represents a route definition with path, optional params schema, and optional query schema
 */
export interface RouteDefinition<Path extends string = string, Params = unknown, Query = unknown> {
  path: Path;
  params?: z.ZodType<Params>;
  query?: z.ZodType<Query>;
}

/**
 * Type for routes registry - connects to user-provided routes
 */
export interface RoutesRegistry {
  routes: UserProvidedRoutes;
}

/**
 * Type for dynamic route segments in the path pattern
 * Supports Next.js dynamic route patterns like /blog/:slug, /user/:id, etc.
 */
export type DynamicRoutePattern = `${string}/:${string}${string}`;

/**
 * Type helper to extract parameter names from a route path
 */
export type ExtractRouteParams<Path extends string> = 
  Path extends `${string}/:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
    : Path extends `${string}/:${infer Param}`
      ? { [K in Param]: string }
      : {};

/**
 * Type for navigation options when using router.push() or similar methods
 */
export type NavigationOptions<
  R extends RouteDefinition,
  P = R['params'] extends z.ZodType<infer T> ? T : never,
  Q = R['query'] extends z.ZodType<infer T> ? T : never
> = (P extends never ? {} : { params: P }) & 
    (Q extends never ? {} : { query?: Q });

/**
 * Helper to get all route paths from the registry
 */
export type AllRoutePaths = RoutesRegistry extends { routes: infer R }
  ? R extends Record<string, RouteDefinition>
    ? R[keyof R]['path']
    : never
  : string;

/**
 * Helper to get params for a specific path
 */
export type ParamsForPath<
  Path extends string,
  Registry = RoutesRegistry
> = Registry extends { routes: infer R }
  ? R extends Record<string, RouteDefinition>
    ? {
        [K in keyof R]: R[K]['path'] extends Path
          ? R[K]['params'] extends z.ZodType<infer P>
            ? P
            : never
          : never;
      }[keyof R]
    : never
  : never;

/**
 * Helper to determine if a path has parameters
 */
export type HasParams<Path extends string> = Path extends DynamicRoutePattern ? true : false;

/**
 * Type for the enhanced Next.js router with type-safe methods
 */
export interface TypedRouter {
  push<R extends RouteDefinition>(
    route: R,
    options?: NavigationOptions<R>
  ): Promise<boolean>;
  
  replace<R extends RouteDefinition>(
    route: R,
    options?: NavigationOptions<R>
  ): Promise<boolean>;
  
  back(): void;
  forward(): void;
  refresh(): void;
  prefetch<R extends RouteDefinition>(
    route: R,
    options?: NavigationOptions<R>
  ): Promise<void>;
}

/**
 * Enhanced pathname type with additional methods for type-safe comparisons
 */
export interface TypedPathname {
  toString(): string;
  valueOf(): string;
  equals<R extends RouteDefinition>(route: R): boolean;
  startsWith<R extends RouteDefinition>(route: R): boolean;
  includes<R extends RouteDefinition>(route: R): boolean;
} 