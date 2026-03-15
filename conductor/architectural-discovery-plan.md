# Plan: Enable Deep Architectural Discovery

## Objective
Enable the agent to answer complex "How does X work?" questions by providing tools to map out the codebase's logical domains and find specific implementation patterns across multiple files.

## Scope of Changes

### 1. `gitlab_list_all_files` (Flat File Index)
*   **Purpose:** Provide a flat list of all file paths in the project. This allows the agent to search for files by name/path without navigating nested tree structures.
*   **Implementation:**
    *   Call `GET /projects/:id/repository/tree` with `recursive=true`.
    *   Return a simple, newline-separated list of file paths.
    *   **Optimization:** Filter out noise like `node_modules`, `.git`, and binary files.

### 2. `gitlab_search_usages` (Snippet Pattern Matcher)
*   **Purpose:** Find concrete examples of how a specific domain (e.g., "orders") interacts with a specific technology (e.g., "SQL", "query", "API").
*   **Implementation:**
    *   Input: `project_id`, `domain` (primary keyword), `pattern` (implementation keyword).
    *   Logic: Perform a search for the `domain` string, then filter the results locally to return only snippets that also contain the `pattern`.
    *   **Benefit:** This acts as a "Usage Cheat Sheet" for the agent.

## Implementation Steps

1.  **Schema Updates (`src/schemas/search.ts` & `src/schemas/repository.ts`):**
    *   Add `ListAllFilesSchema` to `repository.ts`.
    *   Add `SearchUsagesSchema` to `search.ts`.
2.  **Tool Implementations:**
    *   Implement `listAllFiles` in `src/tools/repository.ts`.
    *   Implement `searchUsages` in `src/tools/search.ts`.
3.  **Registration:**
    *   Register the tools in `src/index.ts`.
4.  **Verification:**
    *   Update `evaluations/manual_test_prompts.md` with a "How does it work?" scenario.

## Verification
- Confirm `gitlab_list_all_files` returns a complete list of relevant source files.
- Confirm `gitlab_search_usages` with `domain="order"` and `pattern="GET"` finds the controller logic.
