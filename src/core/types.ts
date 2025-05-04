import { z } from 'zod';

/**
 * Represents a route definition with path, optional params schema, and optional query schema
 */
export interface RouteDefinition<Path extends string = string, Params = unknown, Query = unknown> {
  path: Path;
  params?: z.ZodType<Params>;
  query?: z.ZodType<Query>;
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