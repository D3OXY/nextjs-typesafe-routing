import type { z } from "zod";
import type React from "react";

/**
 * Configuration for a single route.
 * @template Path - The URL path pattern (e.g., "/users/:id").
 * @template Params - Zod schema for path parameters.
 * @template Search - Zod schema for query parameters.
 * @template Meta - Optional metadata for the route.
 */
export interface RouteConfig<
  Path extends string = string,
  Params extends z.AnyZodObject | undefined = undefined,
  Search extends z.AnyZodObject | undefined = undefined,
  Meta = unknown,
> {
  path: Path;
  paramsSchema?: Params;
  searchSchema?: Search;
  meta?: Meta;
}

// Helper types to extract parts of a RouteConfig
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RoutePath<R extends RouteConfig<any, any, any, any>> = R["path"];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteParamsSchema<R extends RouteConfig<any, any, any, any>> =
  R["paramsSchema"];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteSearchSchema<R extends RouteConfig<any, any, any, any>> =
  R["searchSchema"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteParams<R extends RouteConfig<any, any, any, any>> =
  R["paramsSchema"] extends z.AnyZodObject
    ? z.infer<R["paramsSchema"]>
    : Record<string, never>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteSearch<R extends RouteConfig<any, any, any, any>> =
  R["searchSchema"] extends z.AnyZodObject
    ? z.infer<R["searchSchema"]>
    : Record<string, never>;

// Generic type for any route configuration, used in collections
export type AnyRoute = RouteConfig<
  string,
  z.AnyZodObject | undefined,
  z.AnyZodObject | undefined,
  unknown
>;
export type AnyAppRoutes = ReadonlyArray<AnyRoute>;

// Types for Link component properties and router functions
export type PathParamsInput<P extends z.AnyZodObject | undefined> =
  P extends z.AnyZodObject ? z.input<P> : Record<string, never>;
export type SearchParamsInput<S extends z.AnyZodObject | undefined> =
  S extends z.AnyZodObject ? z.input<S> : Record<string, never>;

// Props for the Link component, making params/search conditional
type BaseLinkProps<Path extends string> = {
  to: Path;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export type RouteLinkProps<
  Path extends string,
  ParamsSchema extends z.AnyZodObject | undefined,
  SearchSchema extends z.AnyZodObject | undefined,
> = BaseLinkProps<Path> &
  (ParamsSchema extends z.AnyZodObject
    ? { params: PathParamsInput<ParamsSchema> }
    : { params?: never }) &
  (SearchSchema extends z.AnyZodObject
    ? { search?: SearchParamsInput<SearchSchema> }
    : { search?: never });

// Router context value
export interface RouterContextValue<
  AppRoutes extends AnyAppRoutes = AnyAppRoutes,
> {
  routes: AppRoutes;
}

// Types used by routerParser, inspired by reference
export interface RouteNode<R extends AnyRoute = AnyRoute> {
  id: RoutePath<R>;
  path: RoutePath<R>;
  paramsSchema: RouteParamsSchema<R>;
  searchSchema: RouteSearchSchema<R>;
  meta: R["meta"];
  original: R;
}

export type AnyRouteNode = RouteNode<AnyRoute>;

export type ExtractPathParams<TPath extends string> = string extends TPath
  ? Record<string, string>
  : TPath extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractPathParams<Rest>]: string }
    : TPath extends `${infer _Start}:${infer Param}`
      ? { [K in Param]: string }
      : Record<string, never>;
