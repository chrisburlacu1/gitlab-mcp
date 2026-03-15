# [COMPLETED] Plan: Optimize File Navigation for Free Tier GitLab

## Objective
Since the GitLab instance does not have a Premium license (Advanced Search), the current `find_definitions` tool logic is ineffective. We need to enhance the agent's ability to navigate code quickly and efficiently using standard, universally supported GitLab APIs.

## Scope of Changes

### 1. Simplify Code Search (`src/tools/search.ts`)
*   **Action:** Update the `findDefinitions` function to use a simple, exact string query.
*   **Why:** Complex boolean logic (`&&`, `||`) requires Elasticsearch. Standard GitLab search only supports basic text matching. We will modify the query to search for common exact definition patterns (e.g., `function QueryName`) instead of a boolean matrix, or just revert to a strict exact match to prevent API errors.

### 2. Add Line Range Support to File Fetching (`src/schemas/repository.ts` & `src/tools/repository.ts`)
*   **Action:** Add `start_line` and `end_line` parameters to `GetFileContentsSchema`.
*   **Action:** Update `getFileContents` to parse the returned text, slice it based on the requested line numbers, and format the output with corresponding line numbers (e.g., `45 | code...`).
*   **Why:** This allows the agent to fetch only the relevant snippet of a large file, saving tokens and processing time.

### 3. Add Multi-File Fetching (`src/schemas/repository.ts` & `src/tools/repository.ts`)
*   **Action:** Create a new tool `gitlab_get_multiple_files`.
*   **Schema:** `project_id`, `file_paths` (array of strings), `ref`.
*   **Action:** Use `Promise.all` to fetch multiple files concurrently and return them concatenated in a single Markdown block.
*   **Why:** Saves the agent from using multiple conversational turns when exploring a module or checking imports.

## Implementation Steps
1. Update `src/tools/search.ts` to remove Advanced Search boolean logic.
2. Update `src/schemas/repository.ts` with line range params and the new multi-file schema.
3. Update `src/tools/repository.ts` to implement slicing logic and the new multi-file function.
4. Register the new tool in `src/index.ts`.
5. Run `npm run build`.