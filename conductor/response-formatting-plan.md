# Plan: Improve MCP Tool Responses

## Objective
To reduce token consumption and improve readability by refactoring the GitLab MCP tools to return concise, human-readable text (Markdown) rather than full, raw JSON dumps. This addresses the problem where simple requests like "get project" overwhelm the LLM with unnecessary data.

## Scope of Changes

### 1. `src/tools/projects.ts`
- **`searchProjects`:** 
  - *Current behavior:* Maps to an array of objects and returns `JSON.stringify`.
  - *Target behavior:* Format the array into a concise Markdown list. 
  - *Example output:* `- [Namespace / Project Name](url) (ID: 123) - Description`
- **`getProject`:**
  - *Current behavior:* Returns the entire raw `response.data` object as a JSON string, which is massive.
  - *Target behavior:* Extract only the most relevant fields (e.g., `id`, `name`, `web_url`, `description`, `default_branch`, `ssh_url_to_repo`, `http_url_to_repo`, `star_count`) and format them into a clean Markdown block or list.

### 2. `src/tools/issues.ts`
- **`listIssues`:**
  - *Current behavior:* Maps to an array of objects and returns `JSON.stringify`.
  - *Target behavior:* Format into a concise Markdown list.
  - *Example output:* `- #IID: [Issue Title](url) (State: open) - @author - Labels: bug, p1`
- **`createIssue`:**
  - *Current behavior:* Already concise. Keep as is.

### 3. `src/tools/merge-requests.ts`
- **`listMergeRequests`:**
  - *Current behavior:* Already mapped to a clean string format. Minor formatting tweaks if necessary to align with the list styles above.
- **Other MR tools:**
  - Already concise strings. Keep as is.

### 4. `src/tools/notes.ts` & `src/tools/repository.ts`
- *Current behavior:* Both return concise text or raw string content. Keep as is.

## Implementation Steps
1. Refactor `projects.ts` to implement the Markdown list formatting for `searchProjects` and field extraction + formatting for `getProject`.
2. Refactor `issues.ts` to implement the Markdown list formatting for `listIssues`.
3. Verify that the changes correctly compile and type-check.

## Verification
- We can manually test the output of the refactored tools by reading the generated strings to ensure they contain only the necessary information in a clean format.