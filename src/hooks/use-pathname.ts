"use client";

import { usePathname as useNextPathname } from 'next/navigation';
import { RouteDefinition, TypedPathname } from '@/core/types';

/**
 * Enhanced pathname hook with type-safe comparison methods
 */
export function usePathname(): TypedPathname {
  const pathname = useNextPathname();
  
  const pathnameWithMethods: TypedPathname = {
    toString: () => pathname || '',
    valueOf: () => pathname || '',
    
    /**
     * Compare pathname with a route definition
     */
    equals: <R extends RouteDefinition>(route: R): boolean => {
      return pathname === route.path;
    },
    
    /**
     * Check if pathname starts with a route definition's path
     */
    startsWith: <R extends RouteDefinition>(route: R): boolean => {
      const routePath = route.path.endsWith('/')
        ? route.path
        : `${route.path}/`;
      
      const currentPath = pathname?.endsWith('/')
        ? pathname
        : `${pathname}/`;
      
      return currentPath?.startsWith(routePath) || false;
    },
    
    /**
     * Check if pathname includes a route definition's path
     */
    includes: <R extends RouteDefinition>(route: R): boolean => {
      return pathname?.includes(route.path) || false;
    }
  };
  
  return pathnameWithMethods;
} 