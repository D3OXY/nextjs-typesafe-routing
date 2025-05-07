import type { z } from "zod";
import type { RouteConfig } from "./types";

/**
 * Defines a route configuration.
 *
 * @template Path The path string for the route (e.g., "/users/:id").
 * @template Params Zod schema for path parameters.
 * @template Search Zod schema for query parameters.
 * @template Meta Optional metadata for the route.
 * @param config The route configuration object.
 * @returns The route configuration object.
 *
 * @example
 * import { z } from 'zod';
 * import { defineRoute } from './defineRoute';
 *
 * export const userRoute = defineRoute({
 *   path: "/users/:userId",
 *   paramsSchema: z.object({ userId: z.string().uuid() }),
 *   searchSchema: z.object({ tab: z.enum(["profile", "settings"]).optional() }),
 * });
 *
 * export const postRoute = defineRoute({
 *   path: "/posts/:postId",
 *   paramsSchema: z.object({ postId: z.coerce.number() })
 * });
 *
 * // Example of a route without params or search
 * export const homeRoute = defineRoute({
 *   path: "/"
 * });
 */
export function defineRoute<
  Path extends string,
  Params extends z.AnyZodObject | undefined = undefined,
  Search extends z.AnyZodObject | undefined = undefined,
  Meta = unknown,
>(
  config: RouteConfig<Path, Params, Search, Meta>,
): RouteConfig<Path, Params, Search, Meta> {
  return config;
}
