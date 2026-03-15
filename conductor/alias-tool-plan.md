# [COMPLETED] Plan: Add Persistent Project Aliases Tool

## Objective
Create a new tool `gitlab_set_project_alias` to allow the agent to add a project shorthand alias (e.g., "nds" -> "news-data-service") and persist it across sessions using a local JSON file.

## Scope of Changes

### 1. Persistence Layer (`src/services/project-resolver.ts`)
- Modify `ProjectResolver` to read and write from a local `aliases.json` file.
- On initialization, it should load existing aliases from `aliases.json` (if it exists) into the `aliases` map.
- Remove any hardcoded default aliases.
- Update `setAlias` to write the new alias to `aliases.json` so it persists.

### 2. Schema Update (`src/schemas/projects.ts`)
- Add `SetProjectAliasSchema` with fields `alias` (string) and `project_id` (number or string).

### 3. Tool Implementation (`src/tools/projects.ts`)
- Add `setProjectAlias` function that takes `alias` and `project_id`, calls `projectResolver.setAlias`, and returns a success message.

### 4. Tool Registration (`src/index.ts`)
- Register `gitlab_set_project_alias` with the MCP server.

## Implementation Steps
1. Update `src/services/project-resolver.ts` to use `fs.promises` to read/write `aliases.json` in the root of the project.
2. Update `src/schemas/projects.ts`.
3. Update `src/tools/projects.ts`.
4. Update `src/index.ts`.
5. Run `npm run build` to verify.