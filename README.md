# Next.js Type-Safe Routing

[![npm version](https://badge.fury.io/js/nextjs-typesafe-routing.svg)](https://badge.fury.io/js/nextjs-typesafe-routing) <!-- Replace with your actual package name if different -->

A TypeScript package to enable robust type-safe routing for Next.js applications. Get autocompletion for route paths and type safety for path and query parameters in your `<Link>` components and router hooks.

## Features

- **Type-Safe Links**: Autocompletion and type checking for `href` in `<Link>` components.
- **Type-Safe Navigation**: Typed programmatic navigation with `push`, `replace`, and `redirect`.
- **Type-Safe Parameters**: Safety for `params` and `search` (query) parameters with `useParams`, `useSearch`.
- **Zod Schemas**: Define path and query parameter schemas using Zod for validation and type inference.
- **Centralized Route Definitions**: Define all your routes in a structured way.
- **Module Augmentation**: Extend the router's type information with your app-specific routes for full type safety.
- **Standard Next.js Hooks**: Provides typed versions or re-exports of common Next.js routing hooks like `usePathname` and `useRouter`.

## Installation

```bash
pnpm add nextjs-typesafe-routing zod next react
# or
yarn add nextjs-typesafe-routing zod next react
# or
npm install nextjs-typesafe-routing zod next react
```

(`zod`, `next`, and `react` are peer dependencies. Ensure `typescript` is also installed in your project.)

## Core Concepts

### 1. Defining Routes

Routes are defined using the `defineRoute` function, where you specify the `path` and optionally `paramsSchema` and `searchSchema` using Zod objects.

**Example (`src/app/routes.ts`):**

```typescript
import { defineRoute } from "nextjs-typesafe-routing"; // Adjust import path if needed
import { z } from "zod";

export const homeRoute = defineRoute({
  path: "/",
});

export const userProfileRoute = defineRoute({
  path: "/users/:userId",
  paramsSchema: z.object({
    userId: z.string().uuid(),
  }),
  searchSchema: z.object({
    tab: z.enum(["profile", "settings"]).optional(),
    r: z.string().optional(), // Example: referral code
  }),
});

export const postRoute = defineRoute({
  path: "/blog/:postId",
  paramsSchema: z.object({
    postId: z.coerce.number(), // Coerces string param to number
  }),
});

// Collect all routes into an array
export const appRoutes = [homeRoute, userProfileRoute, postRoute] as const;
```

### 2. Module Augmentation for Type Safety

To make your defined routes available to the type system globally (for `<Link>`, hooks, etc.), you need to augment the `Register` interface from the package.

Create a declaration file (e.g., `src/my-router.d.ts` or `src/env.d.ts`) in your project:

```typescript
// src/my-router.d.ts
import type { appRoutes } from "./app/routes"; // Path to your routes file

declare module "nextjs-typesafe-routing/my-router" {
  // Use 'your-package-name/my-router' if installed from npm
  interface Register {
    routes: typeof appRoutes;
  }
}
```

**Important:** The module path for augmentation (`nextjs-typesafe-routing/my-router`) should match how the package is resolved. If you are working locally, it might be relative. If installed from npm, it will be the package name.
Make sure this `d.ts` file is included in your `tsconfig.json`.

## API Usage

### 1. Initialize the Router

In your application (e.g., `src/app/router-instance.ts` or wherever you manage global instances), initialize the router with your defined routes:

```typescript
// src/app/router-instance.ts
import { initRouter } from "nextjs-typesafe-routing";
import { appRoutes } from "./routes"; // Your defined routes

export const router = initRouter(appRoutes);

// You can then export the typed utilities for use throughout your app:
export const {
  getPath,
  Link, // The type-safe Link component
  useParams,
  useSearch,
  usePathname,
  useRouter, // Re-exported from next/router
  push, // Typed navigation function
  replace, // Typed navigation function
  redirect, // Typed navigation function
  // getRoute, getDynamicPath, getDynamicRoute for more advanced use cases
  // type NextTransitionOptions // If you need to type Next.js router options
} = router;
```

### 2. `RouterProvider` (Optional Context Provider)

If you plan to use `useRouterContext` (e.g., for advanced scenarios where components deep in the tree need access to all route configurations), you can wrap your app or relevant part with `RouterProvider`:

```tsx
// src/app/_app.tsx or your main layout
import { RouterProvider } from "nextjs-typesafe-routing";
import { appRoutes } from "./app/routes"; // Your defined routes

function MyApp({ Component, pageProps }) {
  return (
    <RouterProvider routes={appRoutes}>
      <Component {...pageProps} />
    </RouterProvider>
  );
}

export default MyApp;
```

Most common usage (Link, getPath, hooks, navigation functions) does not require `RouterProvider` as they use the initialized instance directly.

### 3. `<Link>` Component

The `Link` component provides type-safe navigation. It expects a `to` prop for the path, and automatically types `params` and `search` based on your route definition.

```tsx
import {
  Link,
  homeRoute,
  userProfileRoute,
} from "../path/to/your/router-instance"; // Or wherever you export them

function Navigation() {
  return (
    <nav>
      <Link to={homeRoute.path}>Home</Link>
      <Link
        to={userProfileRoute.path}
        params={{ userId: "your-uuid-here" }}
        search={{ tab: "profile" }}
      >
        My Profile
      </Link>
      {/* If a route has no params/search, they are not allowed: */}
      {/* <Link to={homeRoute.path} params={{ id: 1 }}>Error!</Link> */}
    </nav>
  );
}
```

### 4. `getPath` Function

Programmatically generate type-safe URLs.

```typescript
import { getPath, userProfileRoute } from "../path/to/your/router-instance";

const userUrl = getPath(
  userProfileRoute.path,
  { userId: "another-uuid" },
  { tab: "settings" },
);
// userUrl = "/users/another-uuid?tab=settings"

const homeUrl = getPath(homeRoute.path);
// homeUrl = "/"
```

### 5. Hooks

#### `useParams<Path>()`

Access type-safe path parameters for the current route. You pass the route's path string for type inference.

```tsx
// pages/users/[userId].tsx
import { useParams, userProfileRoute } from "@/app/router-instance"; // Adjust path

function UserPage() {
  // Pass the path string of the current route to get typed params
  const params = useParams(userProfileRoute.path);
  // params will be: { userId: string }

  return <div>User ID: {params.userId}</div>;
}
```

#### `useSearch<Path>()`

Access type-safe query parameters for the current route. Pass the route's path string for type inference.

```tsx
// pages/users/[userId].tsx
import { useSearch, userProfileRoute } from "@/app/router-instance";

function UserPageWithSearch() {
  const search = useSearch(userProfileRoute.path);
  // search will be: { tab?: "profile" | "settings", r?: string }

  return <div>Tab: {search.tab ?? "default"}</div>;
}
```

#### `usePathname()`

Returns the current route's pathname string (from `next/router`).

```tsx
import { usePathname } from "@/app/router-instance";

function CurrentPath() {
  const pathname = usePathname();
  return <p>Current path: {pathname}</p>;
}
```

#### `useRouter()`

Re-exported from `next/router`. Provides access to the standard Next.js router instance.

```tsx
import { useRouter } from "@/app/router-instance";

function MyComponent() {
  const router = useRouter();
  // ... use router.push, router.replace, etc. with standard Next.js API if preferred
}
```

### 6. Navigation Functions

These functions provide type-safe programmatic navigation. They are available from your initialized router instance.

```typescript
import {
  push,
  replace,
  redirect,
  userProfileRoute,
  homeRoute,
  // type NextTransitionOptions // Import if you need to pass options
} from "../path/to/your/router-instance";

// Example usage in a component or utility function
async function navigateToUserProfile(userId: string) {
  // push(path, params, search, options)
  await push(
    userProfileRoute.path,
    { userId },
    { tab: "profile" },
    { scroll: false }, // Optional: Next.js TransitionOptions
  );
}

function goHomeAndReplace() {
  // replace(path, params, search, options)
  replace(homeRoute.path);
}

function performRedirect() {
  // redirect(path, params, search)
  // This is a client-side redirect, typically implemented with router.push
  redirect(homeRoute.path);
}
```

## Advanced

### `getRoute(path)`

Retrieves the full `RouteNode` object (including parsed schemas, meta, etc.) for a given path string.

### `getDynamicPath(path, params)` and `getDynamicRoute(path)`

These are available but are currently simplified stubs. For fully featured dynamic segment handling beyond basic replacement, further development might be needed.

### `NextTransitionOptions`

The type `NextTransitionOptions` (re-exported from the package) can be used if you need to provide the `options` argument to `push` or `replace` with full type safety for Next.js's transition options (e.g., `scroll`, `shallow`, `locale`).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
