# Plan: Optimize GitLab MCP Tools

## Objective
Implement performance optimizations for the GitLab MCP tools (selective field fetching, parallelization, connection pooling, caching, and compression) and refactor the `gitlab.ts` service into a robust class-based client to improve maintainability and speed.

## Scope of Changes

### 1. Refactor `GitLabService` (`src/services/gitlab.ts`)
Instead of exporting a raw Axios instance, we will build out a fully encapsulated `GitLabService` class.
- **Encapsulation:** Hide the Axios instance as a private property. Expose structured methods: `get`, `post`, `put`, `delete`.
- **Connection Pooling & Compression:** Configure the internal Axios instance with fine-tuned `https.Agent` settings (`timeout: 60000`, `keepAliveMsecs: 10000`, `maxFreeSockets: 10`) and explicit `Accept-Encoding: gzip, deflate, br` headers.
- **Transparent Caching:** Build an internal TTL `Map` cache directly into the `get` method. When a tool calls `gitlab.get()`, the service will transparently check the cache first (using a 30-second TTL) and return the cached response if available. We can add a `cache: boolean` option to bypass it if needed, but default to `true` for standard read operations.
- **Centralized Error Handling:** Move the `handleApiError` logic into the class methods to simplify the tool implementations, or keep it as a static helper for now, but tightly coupled with the service.

### 2. Selective Field Fetching & Pagination (`src/tools/projects.ts`)
- **Action:** Add the `simple=true` query parameter to the `searchProjects` tool. This tells the GitLab API to return a leaner payload, omitting large fields like descriptions and full repository metadata, significantly speeding up the transfer.

### 3. Parallelize Independent API Calls (`src/tools/projects.ts`)
- **Action:** Enhance the `getProject` tool to provide more value without a time penalty. We will use `Promise.all` to fetch the project details, the top 3 latest issues, and the top 3 latest merge requests in parallel. This enriches the output efficiently.

## Implementation Steps

1. **Update `src/services/gitlab.ts`:**
   - Define a `GitLabService` class.
   - Initialize the `https.Agent` and `axios` instance within the constructor.
   - Implement an in-memory `Map` cache.
   - Implement generic `get<T>`, `post<T>`, `put<T>`, etc. methods. The `get` method should include the caching logic by generating a cache key from the URL and params.
   - Export a singleton instance: `export const gitlab = new GitLabService();`.

2. **Update Tool Files (`src/tools/*.ts`):**
   - Since the exported singleton `gitlab` will have `.get`, `.post`, `.put` methods matching Axios's signature, the tools will require minimal refactoring except adjusting any Axios-specific response properties (e.g., if we decide the service should return the `.data` directly to simplify tools). 
   - *Decision:* The service methods will return the `AxiosResponse` object or just the `.data` payload. Returning just the `.data` is cleaner. Let's make `gitlab.get<T>` return `Promise<T>`. This will require updating `response.data` to just `response` in all tools.

3. **Update `src/tools/projects.ts` (Parallelization & Lean Fetching):**
   - In `searchProjects`, add `simple: true` to the `params`.
   - In `getProject`, use `Promise.all` to execute `gitlab.get` for the project, `/issues?per_page=3`, and `/merge_requests?per_page=3` simultaneously. Update the formatted output string to include the recent issues and MRs.

## Verification
- Run `npm run build` to verify TypeScript compilation.
- Ensure the cache successfully hits on repeated identical queries within the TTL.