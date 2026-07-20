# `useFetch`

Client-side React hook that loads data with the browser’s native [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). It manages loading and error state, aborts in-flight requests when inputs change or the component unmounts, and exposes a manual `refetch`.

**Import**

```ts
import { useFetch } from "@/hooks/use-fetch"
import type { UseFetchOptions, UseFetchResult } from "@/hooks/use-fetch"
```

Requires a Client Component (`"use client"`) — the hook uses React state and effects.

---

## `useFetch<T>`

```ts
function useFetch<T>(
  url: string | null,
  options?: UseFetchOptions
): UseFetchResult<T>
```

Generic typed fetch hook. `T` is the shape of the parsed response body.

| Parameter | Type | Description |
| --- | --- | --- |
| `url` | `string \| null` | Request URL. Pass `null` to skip the request entirely (conditional fetch). |
| `options` | `UseFetchOptions` (optional) | Fetch settings plus hook-specific flags. See below. |

**Returns:** [`UseFetchResult<T>`](#usefetchresultt)

### Behavior

| Situation | What happens |
| --- | --- |
| `url` is a string and `enabled` is `true` | Starts a request; `isLoading` is `true` until it settles. |
| `url` is `null` or `enabled` is `false` | No request; status is idle; `isLoading` is `false`. |
| `url` or `enabled` changes | Clears `data` / `error`, aborts the previous request, starts fresh if still allowed to fetch. |
| `refetch()` with existing `data` | Re-requests the same URL; previous `data` stays visible; `isLoading` stays `false`. |
| `refetch()` with no `data` yet | Re-requests and sets `isLoading` to `true`. |
| Non-OK HTTP status | Sets `error` to `Error` with message like `HTTP 404: Not Found`. |
| Unmount / dependency change | Aborts the in-flight request via `AbortController`; aborted errors are ignored. |

### Example

```tsx
"use client"

import { useFetch } from "@/hooks/use-fetch"

type User = { id: string; name: string }

export function UsersList() {
  const { data, error, isLoading, refetch } = useFetch<User[]>("/api/users", {
    headers: { Accept: "application/json" },
  })

  if (isLoading) return <p>Loading…</p>
  if (error) return <p>{error.message}</p>

  return (
    <div>
      <button type="button" onClick={refetch}>
        Refresh
      </button>
      <ul>
        {data?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Conditional fetch

```ts
// Skip until an id exists
const { data } = useFetch<User>(userId ? `/api/users/${userId}` : null)

// Or gate with enabled
const { data } = useFetch<User[]>(`/api/users`, { enabled: isOpen })
```

---

## `UseFetchOptions`

```ts
type UseFetchOptions = RequestInit & {
  enabled?: boolean
  parseJson?: boolean
}
```

Extends the standard [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit) passed to `fetch`, and adds two hook-only fields.

### Hook-specific fields

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | When `false`, the hook does not fetch (even if `url` is set). Useful for dialogs, tabs, or feature flags. |
| `parseJson` | `boolean` | `true` | When `true`, the body is parsed with `response.json()` and typed as `T`. When `false`, the body is read with `response.text()` and cast to `T` (typically `string`). |

### Inherited `RequestInit` fields (common)

Any standard `fetch` option is allowed. Frequently used:

| Field | Description |
| --- | --- |
| `method` | HTTP method (`GET`, `POST`, …). Defaults to `GET`. |
| `headers` | Request headers (`HeadersInit`). |
| `body` | Request body (string, `FormData`, `Blob`, etc.). |
| `credentials` | Cookie / auth behavior (`omit`, `same-origin`, `include`). |
| `cache` | Cache mode (`default`, `no-store`, …). |
| `mode` | CORS mode (`cors`, `no-cors`, `same-origin`). |

**Notes**

- Inline `options` objects are safe: the hook reads the latest options through a React Effect Event, so changing object identity every render does not cause fetch loops.
- A caller-provided `signal` is ignored. The hook always attaches its own `AbortController` signal so cleanup stays correct.
- `enabled` and `parseJson` are stripped before the remaining fields are passed to `fetch`.

---

## `UseFetchResult<T>`

```ts
type UseFetchResult<T> = {
  data: T | null
  error: Error | null
  isLoading: boolean
  refetch: () => void
}
```

Object returned by `useFetch`.

| Property | Type | Description |
| --- | --- | --- |
| `data` | `T \| null` | Last successful parsed response body, or `null` before the first success / after a URL change. |
| `error` | `Error \| null` | Last failure (`HTTP …` for non-OK responses, or a network/`TypeError`), or `null` when there is no error. Cleared when a new request starts or inputs change. |
| `isLoading` | `boolean` | `true` only while status is `pending` — typically the first load for a URL when there is no data yet. Stays `false` during background refetch when `data` is already present. |
| `refetch` | `() => void` | Imperative re-request for the current `url`. Increments an internal counter so the effect re-runs. Safe to pass to event handlers (`onClick={refetch}`). |

---

## Internal pieces (not exported)

These exist only inside the hook implementation. They are documented so the file is easier to maintain.

### `Status`

```ts
type Status = "idle" | "pending" | "success" | "error"
```

| Value | Meaning |
| --- | --- |
| `idle` | No fetch should run (`url` is `null` or `enabled` is `false`). |
| `pending` | A request is in flight for a load that should show loading UI. |
| `success` | Last request completed with an OK response. |
| `error` | Last request failed (after abort filtering). |

`isLoading` is derived as `status === "pending"`.

### Input tracking state

| State | Role |
| --- | --- |
| `prevUrl` / `prevEnabled` / `prevRefetchIndex` | Detect input changes **during render** so data/error/status can reset without calling `setState` synchronously inside `useEffect` (required by React 19’s `react-hooks` lint rules). |
| `refetchIndex` | Monotonic counter bumped by `refetch()` to retrigger the effect without changing `url`. |

### `readOptions` (Effect Event)

```ts
const readOptions = useEffectEvent(() => { … })
```

Built with React 19 [`useEffectEvent`](https://react.dev/reference/react/useEffectEvent). Called only from inside the fetch effect to read the **latest** `options` (including `parseJson` and `RequestInit`) without listing `options` in the effect dependency array — avoiding infinite refetch loops from unstable option object identities.

Returns `{ parseJson, init }` where `init` is the `RequestInit` passed to `fetch`.

### `run` (inner async function)

Performs the actual `fetch`, parses the body, and updates `data` / `error` / `status`. Errors from abort or a cancelled run are ignored so a superseded request cannot overwrite newer state.

### Cleanup

On unmount or when `url` / `enabled` / `refetchIndex` change, the effect cleanup sets `cancelled = true` and calls `controller.abort()` so the previous request stops and cannot commit state.

---

## Design constraints

- Native `fetch` only — no axios, SWR, or TanStack Query.
- No shared cache or request deduplication across components.
- No mutation helper; use `fetch` directly (or a future hook) for writes.
- Prefer Server Components + async `fetch` for data that can load on the server; use this hook for client-driven or interactive loading.
