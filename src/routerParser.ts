/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from "zod";
import type {
  AnyAppRoutes,
  AnyRouteNode,
  ExtractPathParams,
  PathParamsInput,
  RouteConfig,
  RouteLinkProps,
  RouteNode,
  RouteParams,
  RouteParamsSchema,
  RoutePath,
  RouteSearch,
  RouteSearchSchema,
  SearchParamsInput,
} from "./types";
import { useRouter as useNextRouter, type NextRouter } from "next/router";

// Define TransitionOptions type based on NextRouter
// Parameters<NextRouter["push"]>[2] gives (TransitionOptions | undefined)
// We want the TransitionOptions type itself, or undefined.
// Export this type so it can be used externally
export type NextTransitionOptions = Parameters<NextRouter["push"]>[2];

// Helper to build the structured RouteNode tree
function buildRouteTree(routes: AnyAppRoutes): AnyRouteNode[] {
  return routes.map((route) => ({
    id: route.path,
    path: route.path,
    paramsSchema: route.paramsSchema,
    searchSchema: route.searchSchema,
    meta: route.meta,
    original: route,
  }));
}

// Type for the output of createRouter
export interface RouterInstance<AppRoutes extends AnyAppRoutes> {
  routes: ReadonlyArray<RouteNode<ExtractRouteType<AppRoutes>>>;
  getPath: <Path extends RoutePathLike<AppRoutes>>(
    path: Path,
    params?: Path extends keyof RouteParamsMap<AppRoutes>
      ? PathParamsInput<RouteParamsSchemaForPath<AppRoutes, Path>>
      : undefined,
    search?: Path extends keyof RouteSearchMap<AppRoutes>
      ? SearchParamsInput<RouteSearchSchemaForPath<AppRoutes, Path>>
      : undefined,
  ) => string;
  getRoute: <Path extends RoutePathLike<AppRoutes>>(
    path: Path,
  ) => RouteNode<FindRouteConfigByPath<AppRoutes, Path>> | undefined;

  // Typed hooks
  useParams: <Path extends RoutePathLike<AppRoutes>>(
    path: Path,
  ) => RouteParams<FindRouteConfigByPath<AppRoutes, Path>>;
  useSearch: <Path extends RoutePathLike<AppRoutes>>(
    path: Path,
  ) => RouteSearch<FindRouteConfigByPath<AppRoutes, Path>>;

  // Stronger typed Link props generator (conceptual)
  getLinkProps: <Path extends RoutePathLike<AppRoutes>>(
    props: RouteLinkHelper<AppRoutes, Path>,
  ) => RouteLinkProps<
    Path,
    RouteParamsSchemaForPath<AppRoutes, Path>,
    RouteSearchSchemaForPath<AppRoutes, Path>
  >;

  // Typed navigation methods
  push: <Path extends RoutePathLike<AppRoutes>>(
    path: Path,
    params?: Path extends keyof RouteParamsMap<AppRoutes>
      ? PathParamsInput<RouteParamsSchemaForPath<AppRoutes, Path>>
      : undefined,
    search?: Path extends keyof RouteSearchMap<AppRoutes>
      ? SearchParamsInput<RouteSearchSchemaForPath<AppRoutes, Path>>
      : undefined,
    options?: NextTransitionOptions,
  ) => ReturnType<NextRouter["push"]>;

  replace: <Path extends RoutePathLike<AppRoutes>>(
    path: Path,
    params?: Path extends keyof RouteParamsMap<AppRoutes>
      ? PathParamsInput<RouteParamsSchemaForPath<AppRoutes, Path>>
      : undefined,
    search?: Path extends keyof RouteSearchMap<AppRoutes>
      ? SearchParamsInput<RouteSearchSchemaForPath<AppRoutes, Path>>
      : undefined,
    options?: NextTransitionOptions,
  ) => ReturnType<NextRouter["replace"]>;

  redirect: <Path extends RoutePathLike<AppRoutes>>(
    path: Path,
    params?: Path extends keyof RouteParamsMap<AppRoutes>
      ? PathParamsInput<RouteParamsSchemaForPath<AppRoutes, Path>>
      : undefined,
    search?: Path extends keyof RouteSearchMap<AppRoutes>
      ? SearchParamsInput<RouteSearchSchemaForPath<AppRoutes, Path>>
      : undefined,
  ) => void;
}

// Utility types for RouterInstance
type ExtractRouteType<AppRoutes extends AnyAppRoutes> = AppRoutes[number];
export type RoutePathLike<AppRoutes extends AnyAppRoutes> = RoutePath<
  ExtractRouteType<AppRoutes>
>;

type FindRouteConfigByPath<
  AppRoutes extends AnyAppRoutes,
  PathToFind extends RoutePathLike<AppRoutes>,
> = Extract<
  ExtractRouteType<AppRoutes>,
  RouteConfig<PathToFind, any, any, any>
>;

type RouteParamsSchemaForPath<
  AppRoutes extends AnyAppRoutes,
  Path extends RoutePathLike<AppRoutes>,
> = RouteParamsSchema<FindRouteConfigByPath<AppRoutes, Path>>;

type RouteSearchSchemaForPath<
  AppRoutes extends AnyAppRoutes,
  Path extends RoutePathLike<AppRoutes>,
> = RouteSearchSchema<FindRouteConfigByPath<AppRoutes, Path>>;

// Helper for getLinkProps to make it easier to call
export type RouteLinkHelper<
  AppRoutes extends AnyAppRoutes,
  Path extends RoutePathLike<AppRoutes>,
> = {
  to: Path;
} & (RouteParamsSchemaForPath<AppRoutes, Path> extends z.AnyZodObject
  ? { params: PathParamsInput<RouteParamsSchemaForPath<AppRoutes, Path>> }
  : { params?: never }) &
  (RouteSearchSchemaForPath<AppRoutes, Path> extends z.AnyZodObject
    ? { search?: SearchParamsInput<RouteSearchSchemaForPath<AppRoutes, Path>> }
    : { search?: never });

// Type mapping for params and search based on path string
type RouteParamsMap<AppRoutes extends AnyAppRoutes> = {
  [R in ExtractRouteType<AppRoutes> as RoutePath<R>]: RouteParams<R>;
};
type RouteSearchMap<AppRoutes extends AnyAppRoutes> = {
  [R in ExtractRouteType<AppRoutes> as RoutePath<R>]: RouteSearch<R>;
};

export function createRouter<AppRoutes extends AnyAppRoutes>(
  routesConfig: AppRoutes,
): RouterInstance<AppRoutes> {
  const routeNodes = buildRouteTree(routesConfig) as ReadonlyArray<
    RouteNode<ExtractRouteType<AppRoutes>>
  >;
  const nextRouterHook = useNextRouter;

  const getPath: RouterInstance<AppRoutes>["getPath"] = (
    path,
    params,
    search,
  ) => {
    let populatedPath = String(path);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        populatedPath = populatedPath.replace(`:${key}`, String(value));
      }
    }
    if (search) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(search)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        populatedPath += `?${queryString}`;
      }
    }
    return populatedPath;
  };

  const getRoute: RouterInstance<AppRoutes>["getRoute"] = (path) => {
    const foundRoute = routeNodes.find((r) => r.path === path);
    return foundRoute as
      | RouteNode<FindRouteConfigByPath<AppRoutes, typeof path>>
      | undefined;
  };

  const useParams: RouterInstance<AppRoutes>["useParams"] = <
    Path extends RoutePathLike<AppRoutes>,
  >(
    pathForHook: Path,
  ): RouteParams<FindRouteConfigByPath<AppRoutes, Path>> => {
    const router = nextRouterHook();
    const routeConfig = getRoute(pathForHook as any);
    const schema = routeConfig?.paramsSchema;
    if (!schema) {
      return {};
    }
    const parsed = schema.safeParse(router.query);
    if (parsed.success) {
      return parsed.data;
    }
    console.warn(
      `[TypeSafeRouter] useParams for path "${String(pathForHook)}" failed to parse params:`,
      parsed.error.flatten(),
    );
    return {};
  };

  const useSearch: RouterInstance<AppRoutes>["useSearch"] = <
    Path extends RoutePathLike<AppRoutes>,
  >(
    pathForHook: Path,
  ): RouteSearch<FindRouteConfigByPath<AppRoutes, Path>> => {
    const router = nextRouterHook();
    const routeConfig = getRoute(pathForHook as any);
    const schema = routeConfig?.searchSchema;
    if (!schema) {
      return {};
    }
    const parsed = schema.safeParse(router.query);
    if (parsed.success) {
      return parsed.data;
    }
    return {};
  };

  const getLinkProps: RouterInstance<AppRoutes>["getLinkProps"] = (props) => {
    return props as RouteLinkProps<
      typeof props.to,
      RouteParamsSchemaForPath<AppRoutes, typeof props.to>,
      RouteSearchSchemaForPath<AppRoutes, typeof props.to>
    >;
  };

  const push: RouterInstance<AppRoutes>["push"] = (
    path,
    params,
    search,
    options,
  ) => {
    const router = nextRouterHook();
    const url = getPath(path, params, search);
    return router.push(url, undefined, options);
  };

  const replace: RouterInstance<AppRoutes>["replace"] = (
    path,
    params,
    search,
    options,
  ) => {
    const router = nextRouterHook();
    const url = getPath(path, params, search);
    return router.replace(url, undefined, options);
  };

  const redirect: RouterInstance<AppRoutes>["redirect"] = (
    path,
    params,
    search,
  ) => {
    const router = nextRouterHook();
    const url = getPath(path, params, search);
    void router.push(url);
  };

  return {
    routes: routeNodes,
    getPath,
    getRoute,
    useParams,
    useSearch,
    getLinkProps,
    push,
    replace,
    redirect,
  };
}

// --- Dynamic Routes (Simplified from reference) ---
// This part is more complex and depends on how dynamic segments are string-interpolated.
// For now, a simplified version. The reference was more extensive.

export type DynamicRoutePath<T extends string> = {
  (params: ExtractPathParams<T>): string;
};

export function createDynamicRouter<AppRoutes extends AnyAppRoutes>(
  _routes: AppRoutes,
) {
  const getDynamicPath = <Path extends RoutePathLike<AppRoutes>>(
    path: Path,
    params?: Record<string, string | number>,
  ): string => {
    let result = String(path);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, String(value));
      });
    }
    return result;
  };

  const getDynamicRoute = <Path extends RoutePathLike<AppRoutes>>(
    _path: Path,
  ): FindRouteConfigByPath<AppRoutes, Path> | undefined => {
    console.warn(
      "[TypeSafeRouter] getDynamicRoute is a simplified stub and might not find all routes correctly.",
    );
    return undefined;
  };

  return {
    getDynamicPath,
    getDynamicRoute,
  };
}
