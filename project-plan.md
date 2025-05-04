# nextjs-typesafe-routing: Project Plan

## Overview

Create a Next.js package that provides type-safe routing with minimal manual configuration. The package will offer:

1. Type-safe route definitions
2. Type-safe navigation components and hooks
3. Seamless integration with Next.js app router
4. Minimal manual configuration

## Package Goals

- Provide type safety for routes, parameters, and query parameters
- Minimize boilerplate and manual configuration required by users
- Support app router and pages router architectures
- Leverage TypeScript's type system for autocompletion and error checking
- No runtime performance penalties

## Core Architecture

The package will use a combination of:

1. Type-level programming
2. Code generation (optional)
3. React context for sharing route information
4. File system scanning for route discovery

### Main Components

1. **Route Definition API**
   - `defineRoute` function for explicit route typing
   - Automatic route discovery from file system (optional)

2. **Routing Components**
   - Enhanced `Link` component (extends Next.js Link)
   - Navigation utilities that are type-safe

3. **Routing Hooks**
   - Enhanced `useRouter` hook with type-safe methods
   - Enhanced `usePathname` hook with type comparisons

## API Design

### 1. Route Definition

#### Manual Route Definition

```typescript
// src/app/routes.ts
import { defineRoute } from 'nextjs-typesafe-routing';
import { z } from 'zod';

export const routes = {
  home: defineRoute('/'),
  about: defineRoute('/about'),
  user: defineRoute('/user/:id', {
    params: z.object({
      id: z.string()
    })
  }),
  blog: defineRoute('/blog/:slug', {
    params: z.object({
      slug: z.string()
    }),
    query: z.object({
      page: z.coerce.number().optional()
    })
  })
};
```

#### Setup

```typescript
// Somewhere in your app (e.g., layout.tsx or _app.tsx)
import { RouteProvider } from 'nextjs-typesafe-routing';
import { routes } from './routes';

export default function Layout({ children }) {
  return (
    <RouteProvider routes={routes}>
      {children}
    </RouteProvider>
  );
}
```

### 2. Navigation Components

#### Link Component

```tsx
import { Link } from 'nextjs-typesafe-routing';

// Static route
<Link href={routes.about} />

// Dynamic route with params
<Link 
  href={routes.user} 
  params={{ id: '123' }}
/>

// With query params
<Link 
  href={routes.blog} 
  params={{ slug: 'hello-world' }}
  query={{ page: 2 }}
/>
```

### 3. Routing Hooks

#### useRouter

```tsx
import { useRouter } from 'nextjs-typesafe-routing';

function Component() {
  const router = useRouter();
  
  const handleClick = () => {
    // Type-safe navigation
    router.push(routes.user, { 
      params: { id: '123' }
    });
    
    // With query params
    router.push(routes.blog, {
      params: { slug: 'hello-world' },
      query: { page: 2 }
    });
  };
  
  return <button onClick={handleClick}>Navigate</button>;
}
```

#### usePathname

```tsx
import { usePathname } from 'nextjs-typesafe-routing';

function Component() {
  const pathname = usePathname();
  
  // Type-safe path comparison
  if (pathname === routes.about) {
    return <div>About Page</div>;
  }
  
  // Type-safe path pattern matching
  if (pathname.startsWith(routes.blog)) {
    return <div>Blog Page</div>;
  }
  
  return <div>Other Page</div>;
}
```

#### Redirect

```typescript
import { redirect } from 'nextjs-typesafe-routing';

// Server Component or Server Action
export async function action() {
  // Do something
  redirect(routes.home);
  // Or with params
  redirect(routes.user, { params: { id: '123' } });
}
```

## Core Types

```typescript
// Core types for the package

// Route definition
interface RouteDefinition<Path extends string, Params = undefined, Query = undefined> {
  path: Path;
  params?: ZodSchema<Params>;
  query?: ZodSchema<Query>;
}

// Navigation options
type NavigationOptions<
  R extends RouteDefinition<any, any, any>,
  P extends R['params'] extends ZodSchema<infer T> ? T : never,
  Q extends R['query'] extends ZodSchema<infer T> ? T : never
> = {
  params: P;
  query?: Q;
}

// Link props
type LinkProps<
  R extends RouteDefinition<any, any, any>
> = Omit<NextLinkProps, 'href'> & {
  href: R;
} & (R['params'] extends ZodSchema<infer P> 
    ? { params: P }
    : {}) &
  (R['query'] extends ZodSchema<infer Q> 
    ? { query?: Q }
    : {});

// Router methods
interface TypedRouter {
  push<R extends RouteDefinition<any, any, any>>(
    route: R,
    options: NavigationOptions<R>
  ): Promise<void>;
  
  replace<R extends RouteDefinition<any, any, any>>(
    route: R,
    options: NavigationOptions<R>
  ): Promise<void>;
  
  // Other methods from Next.js router
}
```

## Implementation Steps

### 1. Setup Package Structure

```
src/
  ├── core/
  │   ├── route-builder.ts    # Route definition and parsing
  │   ├── route-provider.tsx  # React context provider
  │   └── types.ts            # Core type definitions
  ├── components/
  │   └── link.tsx            # Enhanced Link component
  ├── hooks/
  │   ├── use-router.ts       # Enhanced router hook
  │   └── use-pathname.ts     # Enhanced pathname hook
  ├── utils/
  │   ├── path-utils.ts       # Path manipulation utilities
  │   └── param-utils.ts      # Parameter handling utilities
  └── index.ts                # Main entry point
```

### 2. Setup Build and Test Configuration

- Configure TypeScript for type-safe APIs
- Setup build process with output for CJS and ESM
- Configure testing with Vitest (if needed)

### 3. Core Implementation

#### 3.1 Route Definition API

Implement the `defineRoute` function for creating type-safe routes with parameter validation.

#### 3.2 Route Provider

Create a React context provider to share route information throughout the app.

#### 3.3 Enhanced Components and Hooks

Implement the enhanced `Link` component and routing hooks that provide type safety.

### 4. Integration with Next.js

Ensure seamless integration with both the App Router and Pages Router in Next.js.

## Challenges and Solutions

### Challenge 1: File-system Based Route Discovery

**Problem**: Next.js uses file-system based routing, but we need to generate types from it.

**Solution**: 
- Provide a CLI tool that scans the `pages` or `app` directory and generates type definitions
- Use TypeScript's type system to infer routes from directory structure

### Challenge 2: Dynamic Segments Support

**Problem**: Next.js app router supports various dynamic segment formats ([slug], [...slug], [[...slug]]).

**Solution**:
- Parse these patterns in our route definition
- Provide proper type constraints for each type of dynamic segment

### Challenge 3: Minimal Configuration

**Problem**: Avoid requiring users to manually register all routes.

**Solution**:
- Auto-generate route definitions when possible
- Provide a simple API for manual route definition when needed

## API Documentation

### Route Definition

```typescript
function defineRoute<Path extends string, Params = undefined, Query = undefined>(
  path: Path,
  options?: {
    params?: ZodSchema<Params>;
    query?: ZodSchema<Query>;
  }
): RouteDefinition<Path, Params, Query>;
```

### Link Component

```typescript
function Link<R extends RouteDefinition<any, any, any>>(
  props: LinkProps<R>
): JSX.Element;
```

### Router Hook

```typescript
function useRouter(): TypedRouter;
```

### Pathname Hook

```typescript
function usePathname(): TypedPathname;
```

### Redirect Function

```typescript
function redirect<R extends RouteDefinition<any, any, any>>(
  route: R,
  options?: NavigationOptions<R>
): never;
```

## Tips for Users

1. **Define routes in a central location**: Create a `routes.ts` file where all routes are defined for better organization.

2. **Use Zod for validation**: Zod provides runtime validation in addition to type safety.

3. **Leverage autocomplete**: The types will provide autocomplete for route paths, parameters, and query parameters.

4. **Type narrowing**: Use type guards to narrow down dynamic routes when needed.

5. **Integration with server components**: The package works with both client and server components in Next.js.

## Next Steps

1. **Implement the core package structure**
2. **Build the route definition API**
3. **Create the React components and hooks**
4. **Test with real Next.js applications**
5. **Create comprehensive documentation**
6. **Publish to npm** 