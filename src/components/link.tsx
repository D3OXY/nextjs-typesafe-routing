"use client";

import React, { JSX } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { 
  RouteDefinition, 
  NavigationOptions, 
  AllRoutePaths, 
  ParamsForPath,
  HasParams,
  DynamicRoutePattern
} from '@/core/types';
import { generateUrl } from '@/core/route-builder';

/**
 * Link props for string routes
 */
export type StringRouteProps<Path extends string> = Omit<NextLinkProps, 'href'> & 
  { href: Path } & 
  (Path extends DynamicRoutePattern 
    ? { params: Record<string, string>; query?: Record<string, string | number | boolean> }
    : { params?: never; query?: Record<string, string | number | boolean> }
  );

/**
 * Link props for route definition objects
 */
export type RouteDefProps<R extends RouteDefinition> = Omit<NextLinkProps, 'href'> & 
  { href: R } & 
  NavigationOptions<R>;

/**
 * Combined Link props type
 */
export type LinkProps<T> = T extends RouteDefinition 
  ? RouteDefProps<T> 
  : T extends string 
    ? StringRouteProps<T> 
    : never;

/**
 * Type-safe Link component that wraps Next.js Link
 * Supports both RouteDefinition objects and type-safe string paths
 */
export function Link<T extends RouteDefinition | string>(
  props: LinkProps<T>
): JSX.Element {
  const { href, params, query, ...rest } = props as any; // Type casting to avoid complex typing issues
  
  // Handle different href types
  let url: string;
  
  if (typeof href === 'string') {
    // String path case
    if (params) {
      url = Object.entries(params).reduce(
        (path, [key, value]) => path.replace(`:${key}`, String(value)),
        href
      );
    } else {
      url = href;
    }
    
    // Add query parameters
    if (query) {
      const searchParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
    }
  } else {
    // RouteDefinition case
    url = generateUrl(href, { params, query });
  }
  
  return <NextLink href={url} {...rest} />;
} 