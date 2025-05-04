"use client";

import React, { createContext, JSX, ReactNode, useContext } from 'react';
import { RouteDefinition } from './types';

/**
 * Context for sharing route definitions throughout the app
 */
interface RouteContextValue {
  routes: Record<string, RouteDefinition>;
}

const RouteContext = createContext<RouteContextValue | null>(null);

/**
 * Props for the RouteProvider component
 */
interface RouteProviderProps {
  routes: Record<string, RouteDefinition>;
  children: ReactNode;
}

/**
 * Provider component for sharing route definitions
 */
export function RouteProvider({ routes, children }: RouteProviderProps): JSX.Element {
  return (
    <RouteContext.Provider value={{ routes }}>
      {children}
    </RouteContext.Provider>
  );
}

/**
 * Hook to access route definitions
 */
export function useRoutes(): Record<string, RouteDefinition> {
  const context = useContext(RouteContext);
  
  if (!context) {
    throw new Error('useRoutes must be used within a RouteProvider');
  }
  
  return context.routes;
}

/**
 * Hook to access a specific route definition
 */
export function useRoute(routeName: string): RouteDefinition {
  const routes = useRoutes();
  
  if (!(routeName in routes)) {
    throw new Error(`Route "${routeName}" not found`);
  }
  
  return routes[routeName];
} 