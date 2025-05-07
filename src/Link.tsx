"use client";

import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import React from "react";
import type { AppRouter } from "./router"; // Assuming AppRouter is exported from router.ts
import type { RoutePathLike, RouteLinkHelper } from "./routerParser";
import { getPath as internalGetPath } from "./router"; // Using the initialized router's methods

/**
 * Type-safe Link component for Next.js applications.
 * It uses the `getPath` function from the configured router to build the href
 * and provides type checking for route paths, parameters, and search queries.
 *
 * @example
 * // Assuming homeRoute and userProfileRoute are defined and router is initialized
 * <Link to={homeRoute.path}>Home</Link>
 * <Link to={userProfileRoute.path} params={{ userId: '123' }} search={{ tab: 'profile' }}>
 *   User Profile
 * </Link>
 */

// Define a more specific type for the props accepted by our Link, combining NextLinkProps and our route props.
// RouteLinkHelper already defines `to` and conditionally `params` and `search`.
// We add `children` and other NextLinkProps.
type Props<Path extends RoutePathLike<AppRouter>> = Omit<
  NextLinkProps,
  "href" | "as"
> &
  RouteLinkHelper<AppRouter, Path> & { children?: React.ReactNode };

export function Link<Path extends RoutePathLike<AppRouter>>(
  props: Props<Path>,
): React.ReactElement {
  const {
    // to, // Use props.to directly
    children,
    ...rest
  } = props;

  // Directly use props.to, props.params, and props.search with internalGetPath
  // The types of props.params and props.search are determined by RouteLinkHelper
  // and should align with what internalGetPath expects.
  const href = internalGetPath(
    props.to,
    // Conditionally pass params if it exists in props (type-wise it might be optional or not present)
    "params" in props ? props.params : undefined,
    "search" in props ? props.search : undefined,
  );

  return (
    <NextLink href={href} {...rest}>
      {children}
    </NextLink>
  );
}
