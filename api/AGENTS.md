# shared/api

An HTTP layer built on axios and exposed to React through context. The module is portable: the folder is copied into other projects as is.

## Hard constraints

- External dependencies are **only `react` and `axios`**. Do not import `@tanstack/react-query`, `clsx`, UI libraries, etc. Everything related to TanStack Query lives in `src/shared/query`.
- No imports from outside this folder (`../../...`, path aliases, `import.meta.env`). Use only relative imports within `shared/api`.
- Consumers import only through `index.ts`, never through deep paths.
- Import types with `import type` (`verbatimModuleSyntax`). No `any`, enums or namespaces.
- Code comments and user-facing strings are in Russian.

## Structure

| File | Purpose |
| --- | --- |
| `index.ts` | Public API of the module |
| `lib/createApiClient.ts` | `createApiClient(config)` → `AxiosInstance`: baseURL, Bearer token, shared query params, 30 s timeout, redirect to `authPath` on 401 |
| `lib/ApiContext.ts` | `ApiContext` and the `useApi()` hook (throws outside `<ApiProvider>`) |
| `ui/ApiProvider.tsx` | Creates the client from props and puts it into context. The client is recreated only when the config changes (`queryParams` are compared by value) |
| `lib/errors.ts` | `InvalidResponseError`, `isCanceledError`, `isRecord` |
| `lib/getErrorMessage.ts` | `getErrorMessage(error)` — user-facing error text |

## Public API

```ts
ApiProvider, ApiProviderProps
useApi(): AxiosInstance
createApiClient(config: ApiConfig): AxiosInstance
getErrorMessage(error: unknown): string
InvalidResponseError, isCanceledError, isRecord
type ApiConfig = { baseURL?; apiKey?; queryParams?; authPath? }
type QueryParams = Record<string, string | number | boolean>
```

## Usage

```tsx
import { ApiProvider, useApi, getErrorMessage, InvalidResponseError, isRecord } from "./shared/api";

<ApiProvider baseURL="https://api.example.com" apiKey={token} authPath="/login">
  <App />
</ApiProvider>;

/* Request with response shape validation */
const getItems = async (api: AxiosInstance, signal?: AbortSignal) => {
  const { data } = await api.get<unknown>("/items", { signal });
  if (!isRecord(data) || !Array.isArray(data.items)) throw new InvalidResponseError();
  return data.items;
};
```

Without React: `const api = createApiClient({ baseURL })`.

## Request conventions

- Treat server responses as `unknown` and validate them (`isRecord`, etc.); throw `InvalidResponseError` on mismatch.
- Pass `signal` to support cancellation; detect canceled requests with `isCanceledError` and do not show them to the user as errors.
- For UI error text always use `getErrorMessage`, not `error.message`.
- On 401 with `authPath` set, the client redirects by itself (once, without looping on the auth page); the error is still rethrown.
- The code targets the browser: the 401 interceptor accesses `window`.

## Verification after changes

```bash
bunx tsc -b
bun run lint
```

Also make sure the folder has no external imports other than `react` and `axios`.
