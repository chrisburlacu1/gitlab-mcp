# [COMPLETED] Plan: Implement Repository Tree and Symbol Definition Search

## Objective
Enhance the agent's ability to navigate and understand the repository by providing a tool to view the project structure and a tool to find code definitions (classes, functions, etc.).

## Scope of Changes

### 1. `gitlab_get_repository_tree`
*   **Purpose:** Recursive file and folder listing to help the agent build a mental model of the project.
*   **Schema (`src/schemas/repository.ts`):** 
    - `GetRepositoryTreeSchema`:
      - `project_id` (number or string): The target project.
      - `path` (string, optional): Sub-directory to start the tree from.
      - `ref` (string, optional): Branch/tag/SHA (default to `main`/`master`).
      - `recursive` (boolean, optional, default: true).
*   **Implementation (`src/tools/repository.ts`):**
    - Call `GET /projects/:id/repository/tree`.
    - Format the result as a hierarchical Markdown list or a simple folder/file tree.
    - Example:
      ```markdown
      📁 src/
        📁 tools/
          📄 issues.ts
          📄 projects.ts
        📄 index.ts
      ```

### 2. `gitlab_find_definitions`
*   **Purpose:** Precision search to find where a specific class, function, or variable is defined.
*   **Schema (`src/schemas/search.ts`):**
    - `FindDefinitionsSchema`:
      - `query` (string): The symbol name (e.g., "processPayment").
      - `project_id` (number or string, optional): Project scope.
      - `group_id` (number or string, optional): Group scope.
*   **Implementation (`src/tools/search.ts`):**
    - This will wrap the `searchCode` logic but refine the search query to focus on definitions.
    - It will automatically prepend common definition keywords based on the query, e.g., searching for `class Query`, `function Query`, `export const Query`, `interface Query`.
    - It will use GitLab's Search API with `scope=blobs`.
    - It will filter results to prioritize those that look like declarations.

## Implementation Steps

1.  **Repository Tree:**
    - Update `src/schemas/repository.ts` to add `GetRepositoryTreeSchema`.
    - Update `src/tools/repository.ts` to add `getRepositoryTree`.
    - Register `gitlab_get_repository_tree` in `src/index.ts`.
2.  **Definition Search:**
    - Update `src/schemas/search.ts` to add `FindDefinitionsSchema`.
    - Update `src/tools/search.ts` to add `findDefinitions`.
    - Register `gitlab_find_definitions` in `src/index.ts`.
3.  **Verification:**
    - Run `npm run build` and ensure no type errors.

## Verification
- Confirm `gitlab_get_repository_tree` correctly lists files recursively.
- Confirm `gitlab_find_definitions` successfully identifies where a function or class is declared.
