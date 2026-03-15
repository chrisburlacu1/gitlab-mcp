# [COMPLETED] Plan: Implement Multi-Project Code Search

## Objective
Create a new tool `gitlab_search_code` that leverages GitLab's Advanced Search API to find code snippets across a specific project, a group, or globally across all accessible projects.

## Scope of Changes

### 1. Schema Definition (`src/schemas/search.ts`)
Create a new file `src/schemas/search.ts` with:
- `SearchCodeSchema`:
  - `query` (string): The search query or symbol to find.
  - `project_id` (string | number, optional): If provided, scopes the search to this project. Uses the `ProjectResolver`.
  - `group_id` (string | number, optional): If provided, scopes the search to this group.
  - *Note: You can provide either `project_id`, `group_id`, or neither for a global search.*

### 2. Tool Implementation (`src/tools/search.ts`)
Create a new file `src/tools/search.ts` with:
- `searchCode` function:
  - Determine the correct endpoint based on inputs:
    - Project scope: `/projects/:id/search`
    - Group scope: `/groups/:id/search`
    - Global scope: `/search`
  - All endpoints will use the query parameter `scope=blobs` to specifically search file contents.
  - Map the results (which contain the `project_id`, `filename`, `startline`, and `data` (snippet)) into a clean Markdown format.
  - Example output format:
    ```markdown
    ### File: src/utils.ts (Project ID: 123)
    Line 45: `export function processPayment() {`
    ```

### 3. Tool Registration (`src/index.ts`)
- Import `SearchCodeSchema` and `searchCode`.
- Register the `gitlab_search_code` tool with the MCP server.

## Implementation Steps
1. Create `src/schemas/search.ts`.
2. Create `src/tools/search.ts`.
3. Update `src/index.ts` to register the new tool.
4. Run `npm run build` to verify compilation.

## Verification
- Test the compilation.
- Ensure the routing logic correctly handles global, group, and project-scoped searches.