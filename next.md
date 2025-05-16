Dynamic Routes
When you don't know the exact segment names ahead of time and want to create routes from dynamic data, you can use Dynamic Segments that are filled in at request time or prerendered at build time.

Convention
A Dynamic Segment can be created by wrapping a folder's name in square brackets: [folderName]. For example, [id] or [slug].

Dynamic Segments are passed as the params prop to layout, page, route, and generateMetadata functions.

Example
For example, a blog could include the following route app/blog/[slug]/page.js where [slug] is the Dynamic Segment for blog posts.

app/blog/[slug]/page.tsx
TypeScript

TypeScript

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <div>My Post: {slug}</div>
}
Route	Example URL	params
app/blog/[slug]/page.js	/blog/a	{ slug: 'a' }
app/blog/[slug]/page.js	/blog/b	{ slug: 'b' }
app/blog/[slug]/page.js	/blog/c	{ slug: 'c' }
See the generateStaticParams() page to learn how to generate the params for the segment.

Good to know
Since the params prop is a promise. You must use async/await or React's use function to access the values.
In version 14 and earlier, params was a synchronous prop. To help with backwards compatibility, you can still access it synchronously in Next.js 15, but this behavior will be deprecated in the future.
Dynamic Segments are equivalent to Dynamic Routes in the pages directory.
Generating Static Params
The generateStaticParams function can be used in combination with dynamic route segments to statically generate routes at build time instead of on-demand at request time.

app/blog/[slug]/page.tsx
TypeScript

TypeScript

export async function generateStaticParams() {
  const posts = await fetch('https://.../posts').then((res) => res.json())
 
  return posts.map((post) => ({
    slug: post.slug,
  }))
}
The primary benefit of the generateStaticParams function is its smart retrieval of data. If content is fetched within the generateStaticParams function using a fetch request, the requests are automatically memoized. This means a fetch request with the same arguments across multiple generateStaticParams, Layouts, and Pages will only be made once, which decreases build times.

Use the migration guide if you are migrating from the pages directory.

See generateStaticParams server function documentation for more information and advanced use cases.

Catch-all Segments
Dynamic Segments can be extended to catch-all subsequent segments by adding an ellipsis inside the brackets [...folderName].

For example, app/shop/[...slug]/page.js will match /shop/clothes, but also /shop/clothes/tops, /shop/clothes/tops/t-shirts, and so on.

Route	Example URL	params
app/shop/[...slug]/page.js	/shop/a	{ slug: ['a'] }
app/shop/[...slug]/page.js	/shop/a/b	{ slug: ['a', 'b'] }
app/shop/[...slug]/page.js	/shop/a/b/c	{ slug: ['a', 'b', 'c'] }
Optional Catch-all Segments
Catch-all Segments can be made optional by including the parameter in double square brackets: [[...folderName]].

For example, app/shop/[[...slug]]/page.js will also match /shop, in addition to /shop/clothes, /shop/clothes/tops, /shop/clothes/tops/t-shirts.

The difference between catch-all and optional catch-all segments is that with optional, the route without the parameter is also matched (/shop in the example above).

Route	Example URL	params
app/shop/[[...slug]]/page.js	/shop	{ slug: undefined }
app/shop/[[...slug]]/page.js	/shop/a	{ slug: ['a'] }
app/shop/[[...slug]]/page.js	/shop/a/b	{ slug: ['a', 'b'] }
app/shop/[[...slug]]/page.js	/shop/a/b/c	{ slug: ['a', 'b', 'c'] }
TypeScript
When using TypeScript, you can add types for params depending on your configured route segment.

app/blog/[slug]/page.tsx
TypeScript

TypeScript

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return <h1>My Page</h1>
}
Route	params Type Definition
app/blog/[slug]/page.js	{ slug: string }
app/shop/[...slug]/page.js	{ slug: string[] }
app/shop/[[...slug]]/page.js	{ slug?: string[] }
app/[categoryId]/[itemId]/page.js	{ categoryId: string, itemId: string }
Good to know: This may be done automatically by the TypeScript plugin in the future.

Next Steps
For more information on what to do next, we recommend the following sections
Linking and Navigating
Learn how navigation works in Next.js, and how to use the Link Component and `useRouter` hook.
generateStaticParams
API reference for the generateStaticParams function.
How to create layouts and pages
Next.js uses file-system based routing, meaning you can use folders and files to define routes. This page will guide you through how to create layouts and pages, and link between them.

Creating a page
A page is UI that is rendered on a specific route. To create a page, add a page file inside the app directory and default export a React component. For example, to create an index page (/):

page.js special file
app/page.tsx
TypeScript

TypeScript

export default function Page() {
  return <h1>Hello Next.js!</h1>
}
Creating a layout
A layout is UI that is shared between multiple pages. On navigation, layouts preserve state, remain interactive, and do not rerender.

You can define a layout by default exporting a React component from a layout file. The component should accept a children prop which can be a page or another layout.

For example, to create a layout that accepts your index page as child, add a layout file inside the app directory:

layout.js special file
app/layout.tsx
TypeScript

TypeScript

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Layout UI */}
        {/* Place children where you want to render a page or nested layout */}
        <main>{children}</main>
      </body>
    </html>
  )
}
The layout above is called a root layout because it's defined at the root of the app directory. The root layout is required and must contain html and body tags.

Creating a nested route
A nested route is a route composed of multiple URL segments. For example, the /blog/[slug] route is composed of three segments:

/ (Root Segment)
blog (Segment)
[slug] (Leaf Segment)
In Next.js:

Folders are used to define the route segments that map to URL segments.
Files (like page and layout) are used to create UI that is shown for a segment.
To create nested routes, you can nest folders inside each other. For example, to add a route for /blog, create a folder called blog in the app directory. Then, to make /blog publicly accessible, add a page.tsx file:

File hierarchy showing blog folder and a page.js file
app/blog/page.tsx
TypeScript

TypeScript

// Dummy imports
import { getPosts } from '@/lib/posts'
import { Post } from '@/ui/post'
 
export default async function Page() {
  const posts = await getPosts()
 
  return (
    <ul>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </ul>
  )
}
You can continue nesting folders to create nested routes. For example, to create a route for a specific blog post, create a new [slug] folder inside blog and add a page file:

File hierarchy showing blog folder with a nested slug folder and a page.js file
app/blog/[slug]/page.tsx
TypeScript

TypeScript

function generateStaticParams() {}
 
export default function Page() {
  return <h1>Hello, Blog Post Page!</h1>
}
Wrapping a folder name in square brackets (e.g. [slug]) creates a dynamic route segment which is used to generate multiple pages from data. e.g. blog posts, product pages, etc.

Nesting layouts
By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their children prop. You can nest layouts by adding layout inside specific route segments (folders).

For example, to create a layout for the /blog route, add a new layout file inside the blog folder.

File hierarchy showing root layout wrapping the blog layout
app/blog/layout.tsx
TypeScript

TypeScript

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section>{children}</section>
}
If you were to combine the two layouts above, the root layout (app/layout.js) would wrap the blog layout (app/blog/layout.js), which would wrap the blog (app/blog/page.js) and blog post page (app/blog/[slug]/page.js).

Linking between pages
You can use the <Link> component to navigate between routes. <Link> is a built-in Next.js component that extends the HTML <a> tag to provide prefetching and client-side navigation.

For example, to generate a list of blog posts, import <Link> from next/link and pass a href prop to the component:

app/ui/post.tsx
TypeScript

TypeScript

import Link from 'next/link'
 
export default async function Post({ post }) {
  const posts = await getPosts()
 
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  )
}
<Link> is the primary and recommended way to navigate between routes in your Next.js application. However, you can also use the useRouter hook for more advanced navigation.

API Reference
Learn more about the features mentioned in this page by reading the API Reference.
layout.js
API reference for the layout.js file.
page.js
API reference for the page.js file.
Building Your Application
Routing
Linking and Navigating
Linking and Navigating
There are four ways to navigate between routes in Next.js:

Using the <Link> Component
Using the useRouter hook (Client Components)
Using the redirect function (Server Components)
Using the native History API
This page will go through how to use each of these options, and dive deeper into how navigation works.

<Link> Component
<Link> is a built-in component that extends the HTML <a> tag to provide prefetching and client-side navigation between routes. It is the primary and recommended way to navigate between routes in Next.js.

You can use it by importing it from next/link, and passing a href prop to the component:

app/page.tsx
TypeScript

TypeScript

import Link from 'next/link'
 
export default function Page() {
  return <Link href="/dashboard">Dashboard</Link>
}
There are other optional props you can pass to <Link>. See the API reference for more.

useRouter() hook
The useRouter hook allows you to programmatically change routes from Client Components.

app/page.tsx
TypeScript

TypeScript

'use client'
 
import { useRouter } from 'next/navigation'
 
export default function Page() {
  const router = useRouter()
 
  return (
    <button type="button" onClick={() => router.push('/dashboard')}>
      Dashboard
    </button>
  )
}
For a full list of useRouter methods, see the API reference.

Recommendation: Use the <Link> component to navigate between routes unless you have a specific requirement for using useRouter.

redirect function
For Server Components, use the redirect function instead.

app/team/[id]/page.tsx
TypeScript

TypeScript

import { redirect } from 'next/navigation'
 
async function fetchTeam(id: string) {
  const res = await fetch('https://...')
  if (!res.ok) return undefined
  return res.json()
}
 
export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!id) {
    redirect('/login')
  }
 
  const team = await fetchTeam(id)
  if (!team) {
    redirect('/join')
  }
 
  // ...
}
Good to know:

redirect returns a 307 (Temporary Redirect) status code by default. When used in a Server Action, it returns a 303 (See Other), which is commonly used for redirecting to a success page as a result of a POST request.
redirect internally throws an error so it should be called outside of try/catch blocks.
redirect can be called in Client Components during the rendering process but not in event handlers. You can use the useRouter hook instead.
redirect also accepts absolute URLs and can be used to redirect to external links.
If you'd like to redirect before the render process, use next.config.js or Middleware.
See the redirect API reference for more information.

Using the native History API
Next.js allows you to use the native window.history.pushState and window.history.replaceState methods to update the browser's history stack without reloading the page.

pushState and replaceState calls integrate into the Next.js Router, allowing you to sync with usePathname and useSearchParams.

window.history.pushState
Use it to add a new entry to the browser's history stack. The user can navigate back to the previous state. For example, to sort a list of products:


'use client'
 
import { useSearchParams } from 'next/navigation'
 
export default function SortProducts() {
  const searchParams = useSearchParams()
 
  function updateSorting(sortOrder: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sortOrder)
    window.history.pushState(null, '', `?${params.toString()}`)
  }
 
  return (
    <>
      <button onClick={() => updateSorting('asc')}>Sort Ascending</button>
      <button onClick={() => updateSorting('desc')}>Sort Descending</button>
    </>
  )
}
window.history.replaceState
Use it to replace the current entry on the browser's history stack. The user is not able to navigate back to the previous state. For example, to switch the application's locale:


'use client'
 
import { usePathname } from 'next/navigation'
 
export function LocaleSwitcher() {
  const pathname = usePathname()
 
  function switchLocale(locale: string) {
    // e.g. '/en/about' or '/fr/contact'
    const newPath = `/${locale}${pathname}`
    window.history.replaceState(null, '', newPath)
  }
 
  return (
    <>
      <button onClick={() => switchLocale('en')}>English</button>
      <button onClick={() => switchLocale('fr')}>French</button>
    </>
  )
}
How Routing and Navigation Works
The App Router uses a hybrid approach for routing and navigation. On the server, your application code is automatically code-split by route segments. And on the client, Next.js prefetches and caches the route segments. This means, when a user navigates to a new route, the browser doesn't reload the page, and only the route segments that change re-render - improving the navigation experience and performance.

1. Code Splitting
Code splitting allows you to split your application code into smaller bundles to be downloaded and executed by the browser. This reduces the amount of data transferred and execution time for each request, leading to improved performance.

Server Components allow your application code to be automatically code-split by route segments. This means only the code needed for the current route is loaded on navigation.

2. Prefetching
Prefetching is a way to preload a route in the background before the user visits it.

There are two ways routes are prefetched in Next.js:

<Link> component: Routes are automatically prefetched as they become visible in the user's viewport. Prefetching happens when the page first loads or when it comes into view through scrolling.
router.prefetch(): The useRouter hook can be used to prefetch routes programmatically.
The <Link>'s default prefetching behavior (i.e. when the prefetch prop is left unspecified or set to null) is different depending on your usage of loading.js. Only the shared layout, down the rendered "tree" of components until the first loading.js file, is prefetched and cached for 30s. This reduces the cost of fetching an entire dynamic route, and it means you can show an instant loading state for better visual feedback to users.

You can disable prefetching by setting the prefetch prop to false. Alternatively, you can prefetch the full page data beyond the loading boundaries by setting the prefetch prop to true.

See the <Link> API reference for more information.

Good to know:

Prefetching is not enabled in development, only in production.
3. Caching
Next.js has an in-memory client-side cache called the Router Cache. As users navigate around the app, the React Server Component Payload of prefetched route segments and visited routes are stored in the cache.

This means on navigation, the cache is reused as much as possible, instead of making a new request to the server - improving performance by reducing the number of requests and data transferred.

Learn more about how the Router Cache works and how to configure it.

4. Partial Rendering
Partial rendering means only the route segments that change on navigation re-render on the client, and any shared segments are preserved.

For example, when navigating between two sibling routes, /dashboard/settings and /dashboard/analytics, the settings page will be unmounted, the analytics page will be mounted with fresh state, and the shared dashboard layout will be preserved. This behavior is also present between two routes on the same dynamic segment e.g. with /blog/[slug]/page and navigating from /blog/first to /blog/second.

How partial rendering works
Without partial rendering, each navigation would cause the full page to re-render on the client. Rendering only the segment that changes reduces the amount of data transferred and execution time, leading to improved performance.

5. Soft Navigation
Browsers perform a "hard navigation" when navigating between pages. The Next.js App Router enables "soft navigation" between pages, ensuring only the route segments that have changed are re-rendered (partial rendering). This enables client React state to be preserved during navigation.

6. Back and Forward Navigation
By default, Next.js will maintain the scroll position for backwards and forwards navigation, and re-use route segments in the Router Cache.

7. Routing between pages/ and app/
When incrementally migrating from pages/ to app/, the Next.js router will automatically handle hard navigation between the two. To detect transitions from pages/ to app/, there is a client router filter that leverages probabilistic checking of app routes, which can occasionally result in false positives. By default, such occurrences should be very rare, as we configure the false positive likelihood to be 0.01%. This likelihood can be customized via the experimental.clientRouterFilterAllowedRate option in next.config.js. It's important to note that lowering the false positive rate will increase the size of the generated filter in the client bundle.

Alternatively, if you prefer to disable this handling completely and manage the routing between pages/ and app/ manually, you can set experimental.clientRouterFilter to false in next.config.js. When this feature is disabled, any dynamic routes in pages that overlap with app routes won't be navigated to properly by default.

Next Steps
Caching
An overview of caching mechanisms in Next.js.
TypeScript
Next.js provides a TypeScript-first development experience for building your React application.
Previous
Layouts and Templates
Next
Error Handling