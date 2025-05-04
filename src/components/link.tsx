"use client";

import React, { JSX } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { RouteDefinition, NavigationOptions } from '@/core/types';
import { generateUrl } from '@/core/route-builder';

/**
 * Props for the type-safe Link component
 */
export type LinkProps<R extends RouteDefinition> = Omit<NextLinkProps, 'href'> & {
  href: R;
} & NavigationOptions<R>;

/**
 * Type-safe Link component that wraps Next.js Link
 */
export function Link<R extends RouteDefinition>({
  href,
  params,
  query,
  ...props
}: LinkProps<R>): JSX.Element {
  // Generate the URL from the route definition and parameters
  const url = generateUrl(href, { 
    params, 
    query: query as Record<string, string | number | boolean | undefined> 
  });
  
  return <NextLink href={url} {...props} />;
} 