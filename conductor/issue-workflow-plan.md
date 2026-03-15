# Plan: Issue Completion Workflow

## Objective
Provide the necessary tools and documentation for an LLM agent to autonomously pick up an issue, create a working branch, make changes, and open a Merge Request that resolves the issue.

## Scope of Changes

### 1. New Issue Tools (`src/schemas/issues.ts` & `src/tools/issues.ts`)
To fully manage issues, the agent needs to be able to fetch details and update them (e.g., assigning them or changing their status).
*   **`gitlab_get_issue`**: Fetch the full description and context of a specific issue by its IID.
    *   *Schema*: `project_id`, `issue_iid`
*   **`gitlab_update_issue`**: Update an issue's state, labels, assignee, or description.
    *   *Schema*: `project_id`, `issue_iid`, `state_event` (close/reopen), `labels`, `assignee_ids`, `description`.

### 2. Branch Management (`src/schemas/repository.ts` & `src/tools/repository.ts`)
To start work, the agent should create a new branch.
*   **`gitlab_create_branch`**: Create a new branch from a specific ref (usually `main`).
    *   *Schema*: `project_id`, `branch` (new branch name), `ref` (source branch/commit).

### 3. The End-to-End Workflow Documentation
We will update `evaluations/manual_test_prompts.md` or create a new `workflow-guide.md` to demonstrate the expected chain of actions for "Completing an Issue":
1.  **Find Work**: `gitlab_list_issues` (filter by unassigned, open, or specific label).
2.  **Understand Task**: `gitlab_get_issue` to read the full acceptance criteria.
3.  **Claim Work**: `gitlab_update_issue` to add an "in-progress" label or assign it.
4.  **Create Branch**: `gitlab_create_branch` (e.g., `123-fix-login-bug`).
5.  **Implement**: Use local terminal/bash to write code, or use the MCP read tools to analyze. (If using local git, checkout branch, commit, push).
6.  **Create MR**: `gitlab_create_merge_request` (source: `123-fix-login-bug`, target: `main`, description: `Closes #123`).

## Implementation Steps
1. Add `GetIssueSchema` and `UpdateIssueSchema` to `src/schemas/issues.ts`.
2. Add `getIssue` and `updateIssue` to `src/tools/issues.ts`.
3. Add `CreateBranchSchema` to `src/schemas/repository.ts`.
4. Add `createBranch` to `src/tools/repository.ts`.
5. Register the 3 new tools in `src/index.ts`.
6. Update the documentation to reflect the new tools and workflow.