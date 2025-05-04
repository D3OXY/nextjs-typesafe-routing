"use client";

import { useRouter as useNextRouter } from 'next/navigation';
import { 
  RouteDefinition, 
  TypedRouter, 
  NavigationOptions, 
  StringRouteOptions 
} from '@/core/types';
import { generateUrl } from '@/core/registry';

/**
 * Custom router hook with type-safe methods
 */
export function useRouter(): TypedRouter {
  const nextRouter = useNextRouter();
  
  return {
    /**
     * Navigate to a new route with type safety
     */
    push<R extends RouteDefinition>(
      route: R | string,
      options?: R extends RouteDefinition ? NavigationOptions<R> : StringRouteOptions
    ): Promise<boolean> {
      const url = generateUrl(route, options as any);
      nextRouter.push(url);
      return Promise.resolve(true);
    },
    
    /**
     * Replace current route with a new one
     */
    replace<R extends RouteDefinition>(
      route: R | string,
      options?: R extends RouteDefinition ? NavigationOptions<R> : StringRouteOptions
    ): Promise<boolean> {
      const url = generateUrl(route, options as any);
      nextRouter.replace(url);
      return Promise.resolve(true);
    },
    
    /**
     * Go back to the previous route
     */
    back(): void {
      nextRouter.back();
    },
    
    /**
     * Go forward to the next route
     */
    forward(): void {
      nextRouter.forward();
    },
    
    /**
     * Refresh the current route
     */
    refresh(): void {
      nextRouter.refresh();
    },
    
    /**
     * Prefetch a route for faster navigation
     */
    prefetch<R extends RouteDefinition>(
      route: R | string,
      options?: R extends RouteDefinition ? NavigationOptions<R> : StringRouteOptions
    ): Promise<void> {
      const url = generateUrl(route, options as any);
      nextRouter.prefetch(url);
      return Promise.resolve();
    }
  };
} 