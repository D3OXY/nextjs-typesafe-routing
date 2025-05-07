// Core route definition
export { defineRoute } from "./defineRoute";
export type { RouteConfig, AnyRoute, AnyAppRoutes } from "./types";

// Router instance creation and core methods from the initialized router
export {
  initRouter, // User will call this with their routes
  getPath,
  getRoute,
  useParams,
  useSearch,
  getLinkProps, // Primarily for Link component internal use or advanced scenarios
  getDynamicPath,
  getDynamicRoute,
  useRouter,
  usePathname,
  push, // Added
  replace, // Added
  redirect, // Added
  type AppRouter, // User can use this type for their router instance
} from "./router";
export type { NextTransitionOptions } from "./routerParser"; // Added export

// UI Components
export { Link } from "./Link";
export { RouterProvider, useRouterContext } from "./RouterProvider";
export type { RouterProviderProps } from "./RouterProvider";

// Types for Link component props for external use if needed, though Link component is preferred.
export type { RouteLinkProps } from "./types";
// Exporting RoutePathLike for advanced use cases where users might need to type paths themselves.
export type { RoutePathLike } from "./routerParser";

// The Register interface is not exported here directly.
// Users augment it via module augmentation: `your-package-name/my-router`
