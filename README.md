# nextjs-typesafe-routing

Type-safe routing utilities for Next.js projects.

## Features

- Type-safe route definitions
- Type-safe navigation with autocomplete
- Seamless integration with Next.js app and pages router
- Zod schema validation for route parameters
- Minimal configuration required

## Installation

```bash
npm install nextjs-typesafe-routing zod
# or
yarn add nextjs-typesafe-routing zod
# or
pnpm add nextjs-typesafe-routing zod
```

## Quick Start

### 1. Define Your Routes

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

### 2. Set Up the Provider

```tsx
// src/app/layout.tsx
import { RouteProvider } from 'nextjs-typesafe-routing';
import { routes } from './routes';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RouteProvider routes={routes}>
          {children}
        </RouteProvider>
      </body>
    </html>
  );
}
```

### 3. Use the Type-Safe Components and Hooks

```tsx
// src/app/components/navigation.tsx
"use client";

import { Link, useRouter, usePathname } from 'nextjs-typesafe-routing';
import { routes } from '../routes';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  return (
    <nav>
      <ul>
        <li>
          <Link 
            href={routes.home}
            className={pathname.equals(routes.home) ? 'active' : ''}
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            href={routes.about}
            className={pathname.equals(routes.about) ? 'active' : ''}
          >
            About
          </Link>
        </li>
        <li>
          <button
            onClick={() => router.push(routes.user, { params: { id: '123' } })}
          >
            User Profile
          </button>
        </li>
      </ul>
    </nav>
  );
}
```

## API Reference

### `defineRoute`

Defines a type-safe route.

```typescript
const userRoute = defineRoute('/user/:id', {
  params: z.object({
    id: z.string()
  }),
  query: z.object({
    tab: z.enum(['profile', 'settings']).optional()
  })
});
```

### `Link`

Type-safe version of Next.js Link component.

```tsx
// Static route
<Link href={routes.about} />

// Dynamic route with params
<Link href={routes.user} params={{ id: '123' }} />

// With query params
<Link 
  href={routes.blog} 
  params={{ slug: 'hello-world' }}
  query={{ page: 2 }}
/>
```

### `useRouter`

Type-safe version of Next.js useRouter hook.

```tsx
const router = useRouter();

// Navigate to a route
router.push(routes.user, { params: { id: '123' } });

// Replace current route
router.replace(routes.blog, {
  params: { slug: 'hello-world' },
  query: { page: 2 }
});
```

### `usePathname`

Enhanced version of Next.js usePathname hook with type-safe comparisons.

```tsx
const pathname = usePathname();

// Type-safe comparisons
if (pathname.equals(routes.about)) {
  // We're on the About page
}

if (pathname.startsWith(routes.blog)) {
  // We're somewhere in the blog section
}
```

### `redirect`

Type-safe version of Next.js redirect function.

```tsx
// In a Server Component or Server Action
redirect(routes.home);

// With params
redirect(routes.user, { params: { id: '123' } });
```

## License

MIT
