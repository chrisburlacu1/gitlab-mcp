# Plan: Project ID Resolution and Caching

## Objective
Reduce the number of steps required for the LLM agent by allowing tools to accept project names, paths, or search terms in addition to numeric IDs. The MCP server will automatically resolve these text inputs to numeric `project_id`s using a cache to minimize API calls.

## Scope of Changes

### 1. Schema Updates (`src/schemas/*.ts`)
Update the `project_id` field in all relevant schemas (`issues.ts`, `merge-requests.ts`, `notes.ts`, `projects.ts`, `repository.ts`) to accept both numbers and strings.
- **Change:** `project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve.")`

### 2. Project Resolver Service (`src/services/project-resolver.ts`)
Create a new service dedicated to resolving and caching project identifiers.
- **Features:**
  - In-memory `Map<string, number>` cache.
  - Method `resolveProjectId(identifier: number | string): Promise<number>`
    - If `identifier` is a number, return it immediately.
    - If `identifier` is a numeric string (e.g., `"123"`), parse and return it.
    - If `identifier` is in the cache, return the cached ID.
    - If not in the cache, call `gitlab.get("/projects", { params: { search: identifier, per_page: 1, simple: true } })`.
    - Take the first result, cache its `id` against the `identifier` string, and return it.
    - If no project is found, throw an Error.

### 3. Tool Implementation Updates (`src/tools/*.ts`)
Update all tool functions to resolve the `project_id` at the beginning of their execution.
- **Action:** Add `const projectId = await resolveProjectId(params.project_id);` to the top of the `try` block in each tool function.
- Replace `params.project_id` with `projectId` in the subsequent `gitlab` API calls.

## Implementation Steps

1. Create `src/services/project-resolver.ts`.
2. Update all Zod schemas in `src/schemas/` to use `z.union([z.number(), z.string()])` for `project_id`.
3. Update `src/tools/issues.ts` to resolve IDs.
4. Update `src/tools/merge-requests.ts` to resolve IDs.
5. Update `src/tools/notes.ts` to resolve IDs.
6. Update `src/tools/projects.ts` to resolve IDs (for `getProject`).
7. Update `src/tools/repository.ts` to resolve IDs.
8. Test compilation with `npm run build`.

## Verification
- Confirm that passing a string like `"ollama"` to `gitlab_list_issues` correctly resolves to an ID and fetches the issues without an explicit prior `gitlab_search_projects` step.
- Verify the compilation completes with no TypeScript errors.