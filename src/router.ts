import type { Register } from "./my-router";
import {
  createRouter as createRouterCore,
  createDynamicRouter as createDynamicRouterCore,
} from "./routerParser";
import type { AnyAppRoutes, RouteConfig } from "./types";

// Infer the AppRoutes type from the user's Register interface
export type AppRouter = Register extends { routes: infer R }
  ? R extends AnyAppRoutes // Ensure R conforms to AnyAppRoutes
    ? R
    : AnyAppRoutes // Fallback to AnyAppRoutes if R is not compatible
  : AnyAppRoutes; // Fallback if routes are not registered

// Create a router instance. For this to be truly useful,
// const registeredRoutes = [] as unknown as AppRouter; // Placeholder REMOVED

// Note: In a real app, `registeredRoutes` would be populated by the user's augmented `Register` interface.
// This typically requires some build-time or runtime mechanism to collect routes,
// or relies purely on TypeScript's module augmentation for type inference.
// For a library, we often export the creation function and let the user call it with their routes array.

// Option 1: Export a function to be called by the user with their routes
export function initRouter<UserRoutes extends AnyAppRoutes>(
  routes: UserRoutes,
) {
  const routerInstance = createRouterCore(routes);
  const dynamicRouterInstance = createDynamicRouterCore(routes);
  return {
    ...routerInstance,
    ...dynamicRouterInstance,
  };
}

// Option 2: Attempt to use a global/singleton pattern (can be tricky with tree-shaking and module augmentation timing)
// This is closer to the reference's implicit style but harder to manage robustly.
// For simplicity and robustness, Option 1 (initRouter) is generally preferred for libraries.

// For now, let's assume a placeholder/example router will be created.
// Users will need to replace this by calling initRouter with their actual routes.

const placeholderRouter = initRouter(
  [] as RouteConfig<string, undefined, undefined, unknown>[],
);

export const getPath = placeholderRouter.getPath;
export const getRoute = placeholderRouter.getRoute;
export const useParams = placeholderRouter.useParams;
export const useSearch = placeholderRouter.useSearch;
export const getLinkProps = placeholderRouter.getLinkProps;
export const getDynamicPath = placeholderRouter.getDynamicPath;
export const getDynamicRoute = placeholderRouter.getDynamicRoute;
export const push = placeholderRouter.push;
export const replace = placeholderRouter.replace;
export const redirect = placeholderRouter.redirect;

// Re-exporting Next.js router hooks for convenience
export { useRouter } from "next/router";

// Custom usePathname hook
import { useRouter as useNextRouter } from "next/router";

export function usePathname(): string {
  const router = useNextRouter();
  return router.pathname;
}

// The hooks like usePathname and a general useRouter that mirrors next/router
// but potentially adds typed parsing for the current route could also be added here.

// Example of how a user might define their routes and initialize:
// routes.ts
// import { defineRoute } from 'your-package';
// import { z } from 'zod';
// export const homeRoute = defineRoute({ path: '/' });
// export const userProfileRoute = defineRoute({
//   path: '/users/:userId',
//   paramsSchema: z.object({ userId: z.string() }),
//   searchSchema: z.object({ tab: z.string().optional() })
// });
// export const appRoutes = [homeRoute, userProfileRoute] as const;

// main.ts or router-setup.ts
// import { initRouter } from 'your-package';
// import { appRoutes } from './routes';
// declare module 'your-package/my-router' {
//   interface Register {
//     routes: typeof appRoutes;
//   }
// }
// export const router = initRouter(appRoutes);
// export const { getPath, Link, useParams } = router; // etc.
