# [COMPLETED] Plan: Advanced Repository Navigation (Stack Profiler & Import Resolver)

## Objective
Further enhance the agent's ability to "jump" through a codebase and understand its architecture by providing a tool to profile the tech stack and a tool to resolve relative file imports.

## Scope of Changes

### 1. `gitlab_get_project_stack` (The "Project DNA" Tool)
*   **Purpose:** Automatically identify the primary language, framework, and dependencies of a project by scanning manifest files in the root.
*   **Implementation:**
    *   Fetch the root repository tree.
    *   Identify "interesting" files: `package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`, `Gemfile`, `Dockerfile`, `.gitlab-ci.yml`.
    *   Fetch the contents of these files concurrently.
    *   Extract key metadata (e.g., `dependencies` from Node, `go` version, `python` libs).
    *   Return a structured Markdown report.

### 2. `gitlab_read_imported_file` (Import Resolver)
*   **Purpose:** Allow the agent to follow a relative import path found in a file (e.g., `import { X } from "../utils"`) without manually calculating the absolute path.
*   **Implementation:**
    *   Input: `project_id`, `source_file_path` (the file being read), `import_string` (the literal string found in the code).
    *   Logic:
        1.  Calculate the base directory of `source_file_path`.
        2.  Join it with `import_string`.
        3.  **Smart Extension Guessing:** If the path doesn't exist, try appending common extensions based on the source file (e.g., if `.ts`, try `.ts`, `.tsx`, `/index.ts`).
    *   Fetch and return the content of the resolved file.

## Implementation Steps

1.  **Schema Updates (`src/schemas/repository.ts`):**
    *   Add `GetProjectStackSchema`.
    *   Add `ReadImportedFileSchema`.
2.  **Tool Implementations (`src/tools/repository.ts`):**
    *   Implement `getProjectStack`.
    *   Implement `readImportedFile`.
3.  **Registration (`src/index.ts`):**
    *   Register the two new tools.
4.  **Verification:**
    *   Run `npm run build`.
    *   Update `evaluations/manual_test_prompts.md` with new workflow tests.

## Verification
- Confirm `gitlab_get_project_stack` correctly identifies a project as "Node.js" and lists its dependencies.
- Confirm `gitlab_read_imported_file` correctly resolves `../services/auth` from `src/tools/file.ts`.
