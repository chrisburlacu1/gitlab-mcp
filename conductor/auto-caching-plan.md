# Plan: Persistent Project ID Auto-Caching

## Objective
Improve the speed and reliability of project resolution by automatically building a persistent local registry of project names, paths, and aliases to their numeric GitLab IDs.

## Scope of Changes

### 1. Refactor `ProjectResolver` (`src/services/project-resolver.ts`)
*   **Rename Storage:** Change the persistent file from `aliases.json` to `project-cache.json`.
*   **Unify Cache:** Use a single internal `registry` map that combines manual aliases and automatic discovery results.
*   **Auto-Learning Logic:**
    1.  When `resolve(identifier)` is called and the ID is not in the local `registry`, perform the GitLab API search.
    2.  Once a project is found, store its ID in the `registry` map using multiple keys:
        - The `identifier` string the user actually used (e.g., "ollama widget").
        - The project's `name` (e.g., "Ollama Widget").
        - The project's `path` (e.g., "ollama-widget").
        - The project's `path_with_namespace` (e.g., "mygroup/ollama-widget").
    3.  Immediately save this expanded registry to `project-cache.json`.
*   **Efficient Lookup:** Normalize all keys to lowercase and trim whitespace.

### 2. Rename Tool and Schema
*   Rename the tool `gitlab_set_project_alias` to `gitlab_set_project_shortcut` (or similar) to reflect the broader "Registry" concept, or keep it as is if "alias" is still considered a subset of the registry.
*   *Decision:* Let's rename the tool to `gitlab_set_project_shortcut` to be more descriptive of a user-defined mapping.

## Implementation Steps
1.  Rename `aliases.json` to `project-cache.json` if it exists.
2.  Update `src/services/project-resolver.ts`:
    - Rename `ALIASES_FILE` to `CACHE_FILE`.
    - Rename `aliases` map to `registry`.
    - Implement the "Auto-Learning" logic in `resolve()`.
3.  Update `src/schemas/projects.ts` and `src/tools/projects.ts` to reflect the name change from "Alias" to "Shortcut".
4.  Update `src/index.ts` to register the renamed tool.
5.  Update `README.md` and `GEMINI.md`.

## Verification
- Resolve a project by name once.
- Check `project-cache.json` to see multiple keys generated.
- Resolve by path and verify it hits the cache.
