# React / Next.js / Redux Interview Questions & Answers

-----

## Core React

### 1. What is React and why is it used?

React is a JavaScript library built by Meta for building user interfaces, primarily single-page applications. It is used because it enables component-based architecture (reusable UI pieces), efficient DOM updates via a Virtual DOM, a large ecosystem, and a declarative programming model that makes UI state predictable.

### 2. What is Virtual DOM?

The Virtual DOM is a lightweight, in-memory JavaScript representation of the real DOM. React maintains this tree and uses it to compute the minimal set of changes needed before touching the actual browser DOM.

### 3. Difference between DOM and Virtual DOM?

|                   |Real DOM                  |Virtual DOM              |
|-------------------|--------------------------|-------------------------|
|Location           |Browser memory            |JS heap                  |
|Update cost        |Expensive (reflow/repaint)|Cheap (JS object diffing)|
|Direct manipulation|Yes                       |No — synced by React     |

### 4. What are React components?

Components are independent, reusable pieces of UI. They accept inputs (props) and return JSX describing what should appear on screen. Everything in a React app is built from components.

### 5. Difference between functional and class components?

|              |Functional     |Class            |
|--------------|---------------|-----------------|
|Syntax        |JS function    |ES6 class        |
|State         |`useState` hook|`this.state`     |
|Lifecycle     |`useEffect`    |lifecycle methods|
|`this` keyword|Not needed     |Required         |
|Performance   |Slightly better|Slightly heavier |

Functional components are the modern standard.

### 6. What are props in React?

Props (short for properties) are read-only data passed from a parent component to a child. They allow components to be configurable and reusable. Props flow **downward** (parent → child) and cannot be modified by the receiving component.

### 7. What is state?

State is mutable data managed **within** a component. When state changes, React re-renders the component. In functional components, state is managed with the `useState` hook.

```js
const [count, setCount] = useState(0);
```

### 8. Difference between props and state?

|                  |Props                 |State                 |
|------------------|----------------------|----------------------|
|Ownership         |Passed from parent    |Owned by the component|
|Mutability        |Read-only             |Mutable via setter    |
|Triggers re-render|When parent re-renders|When setter is called |

### 9. What is JSX?

JSX (JavaScript XML) is a syntax extension that lets you write HTML-like code inside JavaScript. Babel compiles it to `React.createElement()` calls. It is not required but makes component templates far more readable.

```jsx
const el = <h1>Hello</h1>;
// compiles to:
const el = React.createElement('h1', null, 'Hello');
```

### 10. Why do we use keys in lists?

Keys help React identify which items in a list have changed, been added, or removed. They make reconciliation efficient by giving each element a stable identity.

```jsx
items.map(item => <li key={item.id}>{item.name}</li>)
```

### 11. What happens if keys are not unique?

React may incorrectly reuse DOM nodes, leading to subtle UI bugs — wrong content displayed, input state mixed between items, or failed animations. Non-unique keys are a silent correctness issue, not just a performance concern.

### 12. What is reconciliation in React?

Reconciliation is the process React uses to diff the new Virtual DOM tree against the previous one and determine the minimal DOM operations needed. It uses a heuristic O(n) algorithm: same type → update, different type → unmount & remount, keys → match list items across renders.

### 13. What is React Fiber?

Fiber is the internal reimplementation of React’s reconciliation engine (shipped in React 16). It breaks rendering work into small units that can be paused, aborted, or prioritized, enabling **concurrent features** like `Suspense`, `useTransition`, and time-slicing without blocking the main thread.

-----

## React Hooks

### 1. What is a Hook?

A Hook is a special function (prefixed with `use`) that lets functional components tap into React features like state, lifecycle, context, and more. Hooks replaced the need for class components.

### 2. Explain useState

`useState` adds local state to a functional component. It returns the current value and a setter function.

```js
const [name, setName] = useState('');
// setName('Alice') triggers a re-render
```

### 3. Explain useEffect

`useEffect` runs side effects (data fetching, subscriptions, DOM mutations) after render. It accepts a callback and an optional dependency array.

```js
useEffect(() => {
  fetchData();
}, [userId]); // re-runs when userId changes
```

### 4. Difference between useEffect and useLayoutEffect?

|        |`useEffect`             |`useLayoutEffect`                    |
|--------|------------------------|-------------------------------------|
|Timing  |After paint (async)     |After DOM update, before paint (sync)|
|Use case|API calls, subscriptions|DOM measurements, preventing flicker |

Prefer `useEffect` by default; use `useLayoutEffect` only when you need to read/modify layout before the browser paints.

### 5. What are dependency arrays in useEffect?

The dependency array controls when the effect re-runs:

- `[]` — run once on mount
- `[a, b]` — re-run when `a` or `b` change
- Omitted — re-run after every render

### 6. What causes infinite re-renders?

- Updating state inside `useEffect` without (or with wrong) dependencies
- Creating a new object/array/function in the dependency array on every render
- Missing stable references for callbacks passed to child components

```js
// Bug: new object every render → infinite loop
useEffect(() => { setData({}); }, [{}]);
```

### 7. Explain useMemo

`useMemo` memoizes the **result** of an expensive computation, recomputing only when dependencies change.

```js
const sorted = useMemo(() => heavySort(list), [list]);
```

### 8. Explain useCallback

`useCallback` memoizes a **function reference**, so the same function object is returned across renders unless dependencies change.

```js
const handleClick = useCallback(() => doSomething(id), [id]);
```

### 9. Difference between useMemo and useCallback?

|        |`useMemo`             |`useCallback`                   |
|--------|----------------------|--------------------------------|
|Returns |A **value**           |A **function**                  |
|Use case|Expensive calculations|Stable callbacks for child props|

`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

### 10. Explain useRef

`useRef` returns a mutable ref object whose `.current` property persists across renders. Used for:

- Accessing DOM nodes directly
- Storing values that shouldn’t trigger re-renders (timers, previous values)

```js
const inputRef = useRef(null);
inputRef.current.focus();
```

### 11. Can changing useRef.current trigger re-render?

No. Mutating `.current` does **not** trigger a re-render. This is intentional — refs are an escape hatch for values you want to track without causing UI updates.

### 12. Explain custom hooks

Custom hooks are functions starting with `use` that extract and share stateful logic between components. They can call other hooks internally.

```js
function useFetch(url) {
  const [data, setData] = useState(null);
  useEffect(() => { fetch(url).then(r => r.json()).then(setData); }, [url]);
  return data;
}
```

### 13. What is hook cleanup?

A cleanup function returned from `useEffect` runs before the next effect execution and on unmount — used to cancel subscriptions, timers, or abort controllers.

```js
useEffect(() => {
  const sub = subscribe(id);
  return () => sub.unsubscribe(); // cleanup
}, [id]);
```

### 14. Rules of Hooks?

1. Only call hooks **at the top level** (not inside loops, conditions, or nested functions)
1. Only call hooks **in React functions** (functional components or custom hooks)

These rules ensure hooks are called in the same order every render, which React relies on for correct state association.

### 15. Explain stale closures in React

A stale closure occurs when a hook (usually `useEffect` or `useCallback`) captures a variable from a previous render and continues using it even after the variable has been updated.

```js
// Bug: count is stale — always 0
useEffect(() => {
  const id = setInterval(() => console.log(count), 1000);
  return () => clearInterval(id);
}, []); // missing count in deps
```

Fix: add the variable to the dependency array, or use the functional updater form of `setState`.

-----

## React Rendering & Performance

### 1. What triggers a re-render in React?

- `setState` / `useState` setter called
- Parent component re-renders (and child doesn’t memoize)
- Context value changes
- `useReducer` dispatch

### 2. How to optimize React performance?

- `React.memo` for components with stable props
- `useMemo` / `useCallback` for expensive values and callbacks
- Virtualize long lists (`react-window` / `react-virtual`)
- Code split with `React.lazy` + `Suspense`
- Avoid deeply nested context that changes frequently
- Move state down / colocate state

### 3. What is memoization?

Memoization caches the result of a function for given inputs, returning the cached result when the same inputs appear again — trading memory for speed.

### 4. Explain React.memo

`React.memo` is a HOC that wraps a component and shallowly compares props. If props haven’t changed, React skips re-rendering the component.

```jsx
const MyComp = React.memo(({ name }) => <div>{name}</div>);
```

### 5. Difference between controlled and uncontrolled components?

|               |Controlled              |Uncontrolled       |
|---------------|------------------------|-------------------|
|Source of truth|React state             |DOM (via ref)      |
|Value access   |`value` prop            |`ref.current.value`|
|Validation     |Easy — in change handler|Harder             |

### 6. What is prop drilling?

Prop drilling is passing data through multiple intermediate components that don’t need it, just to reach a deeply nested child. Solved by Context API, Redux, or component composition.

### 7. How do you avoid unnecessary renders?

- Wrap components in `React.memo`
- Stabilize callbacks with `useCallback`
- Memoize computed values with `useMemo`
- Split context into smaller, focused providers
- Use state management that only re-renders subscribed components

### 8. Explain lazy loading in React

`React.lazy` lets you dynamically import a component, so its code is only loaded when it’s first rendered.

```jsx
const Chart = React.lazy(() => import('./Chart'));
```

### 9. What is code splitting?

Code splitting breaks the JS bundle into smaller chunks loaded on demand. React supports it via `React.lazy` + `Suspense`, and bundlers (Webpack, Vite) split at dynamic `import()` boundaries.

### 10. Explain Suspense

`Suspense` shows a fallback UI while waiting for lazy-loaded components (or async data in React 18+) to resolve.

```jsx
<Suspense fallback={<Spinner />}>
  <Chart />
</Suspense>
```

### 11. What are Higher Order Components (HOC)?

A HOC is a function that takes a component and returns an enhanced component. Used for cross-cutting concerns: authentication guards, analytics, theming.

```js
const withAuth = (Comp) => (props) =>
  isLoggedIn ? <Comp {...props} /> : <Redirect to="/login" />;
```

### 12. Render props vs HOC?

Both share logic between components, but render props pass a function as a prop instead of wrapping. Render props are more flexible and avoid HOC naming collisions, but can lead to “callback hell” nesting. Custom hooks have largely replaced both patterns.

### 13. What is Context API?

Context provides a way to share values (theme, user, locale) across the component tree without prop drilling. Created with `createContext`, provided with `<Context.Provider>`, and consumed with `useContext`.

### 14. Context API vs Redux?

|           |Context API                       |Redux                             |
|-----------|----------------------------------|----------------------------------|
|Best for   |Low-frequency global data         |Complex, frequently-changing state|
|DevTools   |No                                |Excellent                         |
|Middleware |No                                |Yes (thunk, saga)                 |
|Boilerplate|Low                               |Medium (RTK reduces it)           |
|Performance|Re-renders all consumers on change|Selective re-renders via selectors|

### 15. What are error boundaries?

Error boundaries are class components that implement `componentDidCatch` and `getDerivedStateFromError` to catch JavaScript errors in their child tree and display a fallback UI instead of crashing the whole app. (No hook equivalent yet.)

-----

## Forms & Events

### 1. How does event handling work in React?

React attaches a single event listener at the root (event delegation) rather than on individual nodes. Handlers receive a `SyntheticEvent` and are written as camelCase props.

```jsx
<button onClick={handleClick}>Click</button>
```

### 2. What is Synthetic Event?

A `SyntheticEvent` is React’s cross-browser wrapper around the native browser event. It normalizes behavior across browsers and pools event objects for performance. Access native event via `e.nativeEvent`.

### 3. Controlled vs uncontrolled forms?

**Controlled**: form values live in React state; every change goes through `onChange`. **Uncontrolled**: values live in the DOM, accessed via refs. Controlled forms are easier to validate and submit; uncontrolled forms are simpler for basic file inputs.

### 4. How do you validate forms?

- Manual: validate in `onChange` or `onSubmit`, store errors in state
- Libraries: **React Hook Form** (performant, minimal re-renders), **Formik** + **Yup** (schema-based)

### 5. Prevent default behavior in React?

Call `e.preventDefault()` inside the event handler, just as in plain JS.

```jsx
<form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
```

### 6. How to handle multiple inputs in forms?

Use a single state object and a shared handler that reads the input `name` attribute:

```js
const [form, setForm] = useState({ email: '', password: '' });
const handleChange = (e) =>
  setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
```

-----

## State Management

### 1. What are different ways to manage state in React?

- **Local state** — `useState` / `useReducer`
- **Lifted state** — shared in a common ancestor
- **Context API** — global, low-frequency data
- **Redux / Redux Toolkit** — complex, high-frequency global state
- **Zustand / Jotai / Recoil** — lightweight alternatives
- **React Query / SWR** — server/async state

### 2. When should you use Context API?

When you need to share data across many components that doesn’t change frequently — e.g., theme, authenticated user, language/locale. Avoid using it for state that updates on every keystroke or frame.

### 3. When is Redux preferred?

When the app has complex state interactions, many components need the same data, you need powerful DevTools (time-travel debugging), or you need middleware for async/side-effect control.

### 4. Local state vs global state?

Local state lives in one component and is only relevant there (form inputs, toggles). Global state is shared across unrelated parts of the app (user session, cart, notifications) and needs a centralized store.

### 5. What problems does Redux solve?

- Predictable state mutations via pure reducers
- Single source of truth for global data
- Middleware for async operations
- Time-travel debugging via Redux DevTools
- Decoupled state logic from UI components

-----

## Next.js Basics

### 1. What is Next.js?

Next.js is a React framework by Vercel that adds server-side rendering, static generation, file-based routing, API routes, image optimization, and more — turning React into a full-stack solution out of the box.

### 2. Advantages of Next.js over React?

- Built-in SSR, SSG, and ISR
- File-based routing (no router config)
- API routes (backend in the same repo)
- Automatic code splitting
- Image, font, and script optimization
- Better SEO by default

### 3. What is file-based routing?

Every file inside `app/` (or `pages/`) automatically becomes a route. No router configuration needed. `app/about/page.tsx` → `/about`.

### 4. Difference between React Router and Next.js routing?

React Router is a client-side library you configure manually. Next.js routing is file-system based, supports server rendering, nested layouts, parallel routes, and intercepting routes — far more powerful for production apps.

### 5. What is App Router?

The App Router (introduced in Next.js 13) uses the `app/` directory and enables React Server Components, nested layouts, streaming, and the `use` cache primitives. It is the current recommended approach.

### 6. Difference between App Router and Pages Router?

|                      |App Router                 |Pages Router                          |
|----------------------|---------------------------|--------------------------------------|
|Directory             |`app/`                     |`pages/`                              |
|Default component type|Server Component           |Client Component                      |
|Layouts               |Nested, persistent         |`_app.tsx` only                       |
|Data fetching         |`async` components, `fetch`|`getServerSideProps`, `getStaticProps`|
|Streaming             |Yes                        |No                                    |

### 7. What are layouts in Next.js?

A `layout.tsx` file wraps all pages in its segment and persists across navigations (no re-mount). Layouts can be nested, enabling shared UI (sidebars, navbars) at different route levels.

### 8. What are server components?

Server Components render exclusively on the server. They can directly access databases, file systems, and secrets without shipping any JS to the client. They are the default in the App Router.

### 9. What are client components?

Client Components are marked with `"use client"` and run in the browser. They are needed for interactivity (event handlers, hooks, browser APIs). Their JS is bundled and sent to the client.

### 10. Difference between server and client components?

|                   |Server Component|Client Component          |
|-------------------|----------------|--------------------------|
|Runs on            |Server only     |Browser (+ server for SSR)|
|Can use hooks      |No              |Yes                       |
|Bundle contribution|None            |Yes                       |
|Data access        |Direct (DB, fs) |Via API                   |
|Directive          |None (default)  |`"use client"`            |

-----

## Rendering Strategies

### 1. What is SSR?

**Server-Side Rendering** — the HTML is generated on the server for each request and sent to the browser. The page is always up to date. Useful for personalized or real-time pages.

### 2. What is CSR?

**Client-Side Rendering** — an empty HTML shell is sent; JavaScript fetches data and renders the UI in the browser. Fast after hydration, but poor initial load and SEO.

### 3. What is SSG?

**Static Site Generation** — HTML is generated at build time and served as static files. Extremely fast; ideal for content that doesn’t change per request (blogs, docs, marketing pages).

### 4. What is ISR?

**Incremental Static Regeneration** — SSG pages are regenerated in the background after a set interval without a full rebuild. Combines the speed of static with the freshness of SSR.

### 5. Difference between SSR and SSG?

|             |SSR               |SSG                             |
|-------------|------------------|--------------------------------|
|When rendered|Each request      |Build time                      |
|Freshness    |Always fresh      |Stale until rebuild / revalidate|
|Performance  |Slower TTFB       |Very fast (CDN cached)          |
|Use case     |User-specific data|Shared, stable content          |

### 6. When would you use ISR?

When content changes occasionally (product pages, blog posts, news) and you want static performance without re-deploying after every update. Set `revalidate` to how many seconds the cached version is valid.

### 7. What is hydration?

Hydration is the process where React attaches event listeners and makes the server-rendered HTML interactive on the client. The client receives static HTML (fast paint) then React “hydrates” it by reconciling the server tree with the client render.

### 8. Hydration mismatch causes?

- Content that differs between server and client (e.g., `Date.now()`, `Math.random()`, `window` access)
- Incorrect nesting of HTML elements
- Browser extensions modifying the DOM before React hydrates
- Conditional rendering based on `typeof window`

-----

## Data Fetching (Next.js)

### 1. How does data fetching work in Next.js?

In the App Router, Server Components are `async` functions that `await fetch()` directly. Next.js extends the native `fetch` with caching and revalidation options. Client Components use hooks (`useEffect`, SWR, React Query).

### 2. Difference between getServerSideProps, getStaticProps, and getStaticPaths?

- `getStaticProps` — runs at build time, generates static HTML
- `getStaticPaths` — used with `getStaticProps` for dynamic routes; defines which paths to pre-render
- `getServerSideProps` — runs on every request, always fresh
  *(These are Pages Router APIs; the App Router replaces them with async Server Components.)*

### 3. How do server components fetch data?

Directly with `async/await` — no API layer needed:

```js
async function Page() {
  const data = await db.query('SELECT * FROM posts');
  return <PostList posts={data} />;
}
```

### 4. How do you cache API calls in Next.js?

Next.js extends `fetch` with a `cache` option:

- `fetch(url, { cache: 'force-cache' })` — cache indefinitely (SSG behaviour)
- `fetch(url, { cache: 'no-store' })` — never cache (SSR behaviour)
- `fetch(url, { next: { revalidate: 60 } })` — ISR behaviour (revalidate every 60 s)

### 5. What is revalidation?

Revalidation is the process of refreshing a cached response after a time-to-live expires (time-based) or when explicitly triggered via `revalidatePath()` / `revalidateTag()` (on-demand). It keeps static content fresh without full redeploys.

-----

## API & Backend Features (Next.js)

### 1. What are API routes?

API routes are server-side endpoints defined as files in `app/api/**/route.ts`. They export HTTP method handlers and run on the server, allowing you to build a backend within the Next.js project.

```ts
// app/api/users/route.ts
export async function GET() {
  return Response.json({ users });
}
```

### 2. How do middleware work in Next.js?

`middleware.ts` at the project root runs before every matched request — used for auth checks, redirects, header manipulation, A/B testing. It runs on the **Edge Runtime** for ultra-low latency.

### 3. What is edge runtime?

A lightweight, V8-based runtime (no Node.js APIs) that runs on CDN edge nodes globally. It has near-zero cold start and minimal latency, but limited APIs (no `fs`, limited `crypto`).

### 4. Difference between edge and node runtime?

|              |Edge                |Node                         |
|--------------|--------------------|-----------------------------|
|Location      |CDN edge            |Single-region server         |
|Cold start    |Near zero           |Higher                       |
|APIs available|Limited             |Full Node.js                 |
|Use case      |Auth, redirects, A/B|DB queries, heavy computation|

### 5. How do you implement authentication in Next.js?

Common approaches:

- **NextAuth.js / Auth.js** — handles OAuth, credentials, sessions
- **Clerk / Supabase Auth** — managed auth services
- **Custom JWTs** — sign tokens in API routes, store in `httpOnly` cookies
  Middleware is used to protect routes by checking session/token before render.

### 6. How do cookies work in Next.js?

Use the `cookies()` helper from `next/headers` in Server Components and Route Handlers. For client-side, use `document.cookie` or libraries like `js-cookie`. Always use `httpOnly` + `secure` + `SameSite` flags for auth cookies.

### 7. How do you secure APIs?

- Validate and sanitize all input
- Authenticate via JWT or session cookie on every protected route
- Use CORS headers to restrict origins
- Rate-limit endpoints
- Never expose secrets — use environment variables
- CSRF protection for mutations

-----

## Performance & Optimization (Next.js)

### 1. How does image optimization work in Next.js?

The `<Image>` component from `next/image` automatically serves modern formats (WebP/AVIF), resizes to the required dimensions, lazy-loads by default, and prevents layout shift with reserved dimensions.

### 2. What is dynamic import?

`next/dynamic` is Next.js’s wrapper around `React.lazy` that also supports SSR control:

```js
const Chart = dynamic(() => import('./Chart'), { ssr: false });
```

### 3. What is route prefetching?

Next.js automatically prefetches linked pages when the `<Link>` component is visible in the viewport, so navigation feels instant. Disable with `prefetch={false}`.

### 4. How does Next.js improve SEO?

- SSR/SSG delivers fully-rendered HTML to crawlers
- `<head>` metadata via the Metadata API
- `<Image>` prevents layout shift (good CLS)
- Fast TTFB improves Core Web Vitals
- Built-in sitemap/robots support

### 5. How does Next.js handle caching?

Next.js has four cache layers:

1. **Request Memoization** — deduplicates same `fetch` in one render pass
1. **Data Cache** — persists `fetch` responses across requests (revalidatable)
1. **Full Route Cache** — caches rendered HTML/RSC payloads at build time
1. **Router Cache** — client-side cache of visited route segments

### 6. How to reduce bundle size?

- Use `dynamic()` imports for heavy components
- Audit with `@next/bundle-analyzer`
- Tree-shake large libraries (use specific imports)
- Replace heavy libraries with lighter alternatives
- Enable `experimental.optimizePackageImports` for common packages

### 7. What are common Next.js performance issues?

- Large third-party scripts blocking render
- Not using `<Image>` for images
- Over-fetching data in Server Components
- Missing `loading.tsx` causing blocking waterfalls
- Client Components higher up the tree than necessary

-----

## Redux Basics

### 1. What is Redux?

Redux is a predictable state management library based on three principles: single store, read-only state, and pure reducers. State can only change by dispatching actions.

### 2. Why do we need Redux?

When multiple unrelated components need shared state, passing props becomes unmanageable. Redux provides a single source of truth, predictable updates, and excellent DevTools.

### 3. What are reducers?

Reducers are pure functions `(state, action) => newState` that specify how state changes in response to an action. They must not mutate state or have side effects.

### 4. What is an action?

An action is a plain object with a `type` field describing what happened, and an optional `payload` with data.

```js
{ type: 'cart/addItem', payload: { id: 1, name: 'Book' } }
```

### 5. What is a store?

The store holds the entire application state tree, exposes `getState()`, `dispatch()`, and `subscribe()`. Created once, usually via `configureStore()` in Redux Toolkit.

### 6. Explain Redux flow

1. **Component** dispatches an action
1. **Store** passes (currentState, action) to the **reducer**
1. Reducer returns **new state**
1. Store notifies subscribed components
1. Connected components re-render with new data

### 7. What is immutability?

Immutability means never mutating existing state objects — always returning new ones. This lets Redux detect changes via reference equality (`===`) and enables time-travel debugging.

### 8. Why should reducers be pure functions?

Pure functions are predictable and testable: given the same inputs, always the same output, with no side effects. This makes Redux state changes fully reproducible — essential for debugging and time travel.

-----

## Redux Toolkit

### 1. What is Redux Toolkit?

Redux Toolkit (RTK) is the official, opinionated toolset for Redux that reduces boilerplate and enforces best practices. It includes `createSlice`, `configureStore`, `createAsyncThunk`, and RTK Query.

### 2. Why is Redux Toolkit preferred?

- Dramatically less boilerplate than vanilla Redux
- Immer built in (write “mutating” code safely)
- `createAsyncThunk` for async actions
- RTK Query for data fetching
- Sane defaults (Redux DevTools, thunk middleware)

### 3. What is createSlice?

`createSlice` generates action creators and a reducer from a single object. The `reducers` field contains case reducers; Immer lets you write mutating syntax safely.

```js
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; }
  }
});
export const { increment } = counterSlice.actions;
```

### 4. What is configureStore?

`configureStore` creates the Redux store with sensible defaults: Redux DevTools Extension, `redux-thunk` middleware, and Immer integration.

```js
const store = configureStore({ reducer: { counter: counterSlice.reducer } });
```

### 5. What is createAsyncThunk?

`createAsyncThunk` creates a thunk that dispatches `pending`, `fulfilled`, and `rejected` actions around an async operation. Handle those states in `extraReducers`.

```js
const fetchUser = createAsyncThunk('user/fetch', async (id) => {
  return await api.getUser(id);
});
```

### 6. Difference between Redux and Redux Toolkit?

RTK is not a different library — it wraps Redux with utilities. Vanilla Redux requires manual action types, action creators, immutable updates, and middleware setup. RTK handles all of that with much less code.

### 7. How does Immer work in Redux Toolkit?

Immer uses a JavaScript `Proxy` to track mutations on a draft copy of state. When the reducer returns, Immer produces a new immutable state from the recorded mutations — so you write `state.value++` but the actual state is never mutated.

-----

## Async Handling (Redux)

### 1. How do you handle API calls in Redux?

With Redux Toolkit: use `createAsyncThunk` to wrap the API call and `extraReducers` in the slice to handle `pending`, `fulfilled`, and `rejected` states. For complex flows, RTK Query eliminates most of this boilerplate entirely.

### 2. What is middleware?

Middleware is a function that intercepts dispatched actions before they reach the reducer. It can log, cancel, delay, or transform actions, and is where async logic lives.

### 3. What is Redux Thunk?

Thunk middleware allows you to dispatch **functions** (thunks) instead of plain action objects. The function receives `dispatch` and `getState`, enabling async logic like API calls.

```js
const fetchData = () => async (dispatch) => {
  dispatch(loading());
  const data = await api.get();
  dispatch(loaded(data));
};
```

### 4. Difference between Thunk and Saga?

|                   |Redux Thunk               |Redux Saga                     |
|-------------------|--------------------------|-------------------------------|
|Paradigm           |Async functions / Promises|Generator functions            |
|Learning curve     |Low                       |High                           |
|Complex async flows|Difficult                 |Excellent                      |
|Testing            |Harder                    |Easy (effects are descriptions)|
|Bundle size        |Tiny                      |Larger                         |

### 5. When would you use Saga over Thunk?

- Complex async flows: race conditions, cancellation, retry logic
- Long-running background tasks
- When you need fine-grained control over concurrent requests
- When testability of async logic is a priority

-----

## Redux + React

### 1. Explain useSelector

`useSelector` reads a value from the Redux store and subscribes the component to it. The component re-renders only when the selected value changes.

```js
const count = useSelector((state) => state.counter.value);
```

### 2. Explain useDispatch

`useDispatch` returns the store’s `dispatch` function, letting you send actions from a component.

```js
const dispatch = useDispatch();
dispatch(increment());
```

### 3. What causes Redux-connected components to re-render?

A component re-renders when the value returned by its `useSelector` callback changes (via reference equality). If the selector returns a new object/array on every call (even with same data), the component re-renders unnecessarily.

### 4. How do you optimize Redux performance?

- Write granular selectors that return primitives or stable references
- Use `shallowEqual` as the second argument to `useSelector` for object comparisons
- Memoize selectors with Reselect
- Normalize state shape to avoid deep nesting and duplicated data

### 5. What is selector memoization?

Selector memoization caches a selector’s output and recomputes it only when its input selectors return new values — preventing unnecessary re-renders when unrelated state changes.

### 6. Explain Reselect

Reselect is a library for creating memoized selectors. `createSelector` takes input selectors and a result function; it only recomputes when inputs change.

```js
const selectTotal = createSelector(
  [selectItems],
  (items) => items.reduce((sum, i) => sum + i.price, 0)
);
```

-----

## Scenario-Based Questions

### 1. How would you optimize a slow React application?

Profile with React DevTools Profiler to identify expensive renders → memoize components (`React.memo`) and values (`useMemo`) → virtualize long lists → code split heavy routes → move state closer to where it’s used → avoid anonymous functions/objects in JSX props.

### 2. How would you handle authentication in Next.js?

Use Auth.js (NextAuth): configure providers, store session in a signed `httpOnly` cookie, protect routes in `middleware.ts` by checking the session, expose session to Server Components via `auth()`, and use `useSession` in Client Components.

### 3. How would you structure a large React project?

```
src/
  features/          # feature-based modules (auth, cart, profile)
    auth/
      components/
      hooks/
      store/
  shared/            # reusable across features
    components/
    hooks/
    utils/
  app/               # root providers, router
```

Feature-based colocation over type-based (`all components/`, `all hooks/`) for scalability.

### 4. When would you choose Context API over Redux?

For infrequently updated global data (theme, locale, user preferences) in a small-to-medium app without complex async state or DevTools requirements.

### 5. How would you avoid prop drilling?

- Context API for global/shared data
- Component composition (pass components as children/props)
- Redux or Zustand for complex shared state
- Custom hooks to encapsulate data fetching close to usage

### 6. Explain a difficult bug you solved in React.

*Example answer framework:* Stale closure in a `useEffect` caused a WebSocket message handler to always read the initial state value. Debugged with `console.log` inside the handler showing stale data. Fixed by using a `useRef` to hold the latest state value so the closure always read `.current`, and updated the ref on every state change.

### 7. How would you implement infinite scrolling?

Use an `IntersectionObserver` on a sentinel element at the bottom of the list. When the sentinel enters the viewport, fetch the next page and append to the list. Alternatively, use `react-query`’s `useInfiniteQuery` which handles pagination state automatically.

### 8. How would you implement debouncing in search?

```js
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
// Then: useEffect(() => fetchResults(debouncedQuery), [debouncedQuery]);
```

### 9. How would you prevent unnecessary API calls?

- Debounce/throttle input-triggered calls
- Cache responses (React Query, SWR, RTK Query) with stale-while-revalidate
- Deduplicate concurrent identical requests
- Use `AbortController` to cancel in-flight requests when dependencies change
- Only fetch when dependencies actually change (useEffect deps)

### 10. How would you manage WebSocket state in React?

Create a custom hook `useWebSocket` that opens the connection, stores messages in `useRef` or state, and closes on cleanup. Expose message state globally via Context or Redux so any component can subscribe. Use `useRef` for the socket instance to avoid re-creating it on re-renders.

### 11. How would you implement role-based access?

Store the user’s role in auth state (Context or Redux). Create a `<ProtectedRoute role="admin">` wrapper component that checks the role and redirects if unauthorized. In Next.js, also enforce roles in `middleware.ts` on the server before the page is even rendered.

### 12. How would you handle global error handling?

- React Error Boundaries for render errors (wrap page-level components)
- A global axios/fetch interceptor for API errors → dispatch to an error slice in Redux
- A toast/notification system connected to that error slice
- Log errors to a monitoring service (Sentry) in the boundary’s `componentDidCatch`

### 13. How would you implement dark mode globally?

Store preference in `localStorage` (or user profile). Provide it via Context. Apply a `data-theme="dark"` attribute to `<html>` and define CSS custom properties for each theme. Avoid flash of wrong theme by reading `localStorage` in a blocking script before React hydrates.

### 14. How would you optimize Redux store structure?

- Normalize relational data (entities as flat maps, not nested arrays)
- Split into feature slices
- Store only serializable, minimal data — derive computed values in selectors
- Keep UI-only state (modal open, selected tab) local — not in Redux

### 15. How would you cache API responses?

Use RTK Query or React Query — both implement stale-while-revalidate, deduplication, background refetching, and cache invalidation out of the box. For manual caching: store responses in Redux with a timestamp, and skip fetching if `Date.now() - fetchedAt < TTL`.

-----

## Advanced Questions (Senior Level)

### 1. Explain React reconciliation deeply

React’s diffing algorithm compares two Virtual DOM trees. Rules: (1) Elements of different types produce entirely different trees; (2) Elements of the same type update only changed attributes; (3) `key` props identify stable children across renders. React Fiber decomposes this work into units that can be interrupted by higher-priority updates.

### 2. How does React batching work?

React 18 automatically batches all state updates (including those in `setTimeout`, Promises, and native events) into a single re-render. Before React 18, batching only occurred inside React event handlers. Use `flushSync` when you need an update to render synchronously and immediately.

### 3. What are concurrent features in React?

React 18 concurrent features allow React to work on multiple state updates simultaneously, interrupt low-priority renders for urgent ones, and defer non-critical updates. Key APIs: `useTransition`, `useDeferredValue`, `Suspense` for data fetching, and streaming SSR.

### 4. Explain Suspense for data fetching

In React 18+ (especially with server components), a component can “suspend” by throwing a Promise. React catches it, shows the nearest `<Suspense fallback>`, and retries when the Promise resolves. This enables declarative loading states without manual `isLoading` flags.

### 5. What are transitions in React?

`useTransition` marks a state update as non-urgent. React can interrupt it to handle urgent updates (e.g., typing) first, then resume the transition. This keeps the UI responsive during heavy re-renders (e.g., filtering a large list).

```js
const [isPending, startTransition] = useTransition();
startTransition(() => setFilter(value));
```

### 6. How does Next.js streaming work?

Next.js uses React’s `renderToPipeableStream` to stream HTML chunks to the browser as they become ready. Wrapped in `<Suspense>`, slow server components stream in after fast ones, so the browser can show and hydrate the fast parts immediately without waiting for the slowest data fetch.

### 7. Explain partial prerendering

Partial Prerendering (PPR, experimental in Next.js 14+) generates a static HTML shell at build time and streams dynamic “holes” in at request time. The browser receives a fully-rendered static frame instantly, while personalized/dynamic content fills in via streaming.

### 8. How would you design scalable frontend architecture?

- Feature-based folder structure (colocate by domain)
- Strict layer separation: UI components → feature hooks → services/API layer
- Shared design system / component library
- Single state management strategy (RTK or React Query per concern)
- CI linting, type checking, component testing (Vitest + Testing Library)
- Module federation or monorepo (Turborepo/Nx) for large teams

### 9. How do you monitor frontend performance?

- **Real User Monitoring (RUM)**: Vercel Analytics, Datadog RUM, web-vitals library
- **Error tracking**: Sentry
- **Build analysis**: `@next/bundle-analyzer`
- **Lighthouse / CrUX**: Core Web Vitals in CI
- **React DevTools Profiler**: identify expensive component renders

### 10. Explain hydration lifecycle in Next.js

1. Server renders HTML + RSC payload and sends it
1. Browser paints static HTML (fast First Contentful Paint)
1. Next.js downloads the JS bundle
1. React **hydrates** — reconciles the server tree with a client render, attaches event listeners
1. Page becomes fully interactive (Time To Interactive)

If server and client renders differ, React throws a hydration warning.

### 11. What causes memory leaks in React?

- Async operations (fetch, setTimeout) that update state after the component unmounts — fix with `AbortController` or an `isMounted` flag in cleanup
- Event listeners / subscriptions not removed in `useEffect` cleanup
- Closures in global stores holding references to large objects
- Uncleared intervals/timers

### 12. How do closures affect hooks?

Hooks capture the values from the render in which they were called. If a dependency is missing from the dependency array, the hook uses a stale closure — seeing old state/prop values. Always include all reactive values in deps, or use `useRef` for values you want to read without re-subscribing.

### 13. Explain render phase vs commit phase

- **Render phase**: React calls component functions, builds the new Virtual DOM tree, diffs it against the previous one. This is **pure** and can be interrupted or restarted (in concurrent mode).
- **Commit phase**: React applies the calculated changes to the real DOM (mutations), then runs `useLayoutEffect`, then `useEffect`. The commit phase is **synchronous and cannot be interrupted**.

### 14. How would you implement micro-frontends?

- **Module Federation** (Webpack 5): host app loads remote bundles at runtime — independent deploys
- **iframes**: total isolation but poor UX and communication overhead
- **Single-SPA**: router that mounts different framework apps per route
- Use shared design tokens and auth state (via custom events or a shared store) to keep the experience cohesive

### 15. Explain optimistic updates in Redux

Optimistic updates immediately apply the expected result to the UI before the API confirms, making the app feel instant. If the API call fails, roll back to the previous state.

With RTK Query:

```js
// onQueryStarted in createApi endpoint
async onQueryStarted(arg, { dispatch, queryFulfilled }) {
  const patch = dispatch(api.util.updateQueryData('getPost', arg.id, draft => {
    draft.liked = true;
  }));
  try { await queryFulfilled; }
  catch { patch.undo(); } // rollback on failure
}
```