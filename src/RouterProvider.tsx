"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { AnyAppRoutes, RouterContextValue } from "./types";

// Create a context for the router
// We use a generic type that defaults to AnyAppRoutes to allow for specific app route types.
const RouterContext = createContext<RouterContextValue<AnyAppRoutes> | null>(
  null,
);

/**
 * Hook to access the router context.
 * Throws an error if used outside of a RouterProvider.
 */
export function useRouterContext<
  AppRoutes extends AnyAppRoutes = AnyAppRoutes,
>(): RouterContextValue<AppRoutes> {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouterContext must be used within a RouterProvider");
  }
  return context as RouterContextValue<AppRoutes>;
}

/**
 * Props for the RouterProvider component.
 * @template AppRoutes The application's specific route configurations.
 */
export interface RouterProviderProps<AppRoutes extends AnyAppRoutes> {
  children: React.ReactNode;
  routes: AppRoutes; // The actual routes array passed by the user
}

/**
 * Provider component for the router context.
 * It takes the application routes and makes them available to child components.
 */
export function RouterProvider<AppRoutes extends AnyAppRoutes>(
  props: RouterProviderProps<AppRoutes>,
): React.ReactElement {
  const { children, routes } = props;

  const contextValue = useMemo<RouterContextValue<AppRoutes>>(() => {
    return {
      routes,
    };
  }, [routes]);

  return (
    <RouterContext.Provider
      value={contextValue as RouterContextValue<AnyAppRoutes>}
    >
      {children}
    </RouterContext.Provider>
  );
}
