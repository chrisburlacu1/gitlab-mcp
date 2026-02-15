# GitLab MCP

A Model Context Protocol (MCP) server for interacting with the GitLab API. This server enables LLMs to search projects, manage issues, merge requests, and read file contents from GitLab repositories.

## Configuration

This server requires the following environment variables:

- `GITLAB_PERSONAL_ACCESS_TOKEN`: Your GitLab Personal Access Token (requires `api` scope).
- `GITLAB_API_URL`: (Optional) The base URL for the GitLab API. Defaults to `https://gitlab.com/api/v4`.

## Tools

### Projects

- **`gitlab_search_projects`**
  - Search for projects by name or path.
  - Inputs: `search` (string), `membership` (boolean, default: true), `limit` (number, default: 20).
  - Returns: List of matching projects.

- **`gitlab_get_project`**
  - Get details of a specific project.
  - Inputs: `project_id` (number).
  - Returns: Project details (ID, name, description, URLs).

### Issues

- **`gitlab_list_issues`**
  - List issues for a project.
  - Inputs: `project_id` (number), `state` (opened/closed/all), `labels` (string), `search` (string), `limit` (number).
  - Returns: List of issues.

- **`gitlab_create_issue`**
  - Create a new issue.
  - Inputs: `project_id` (number), `title` (string), `description` (string, optional), `labels` (string, optional).
  - Returns: Created issue details.

### Merge Requests

- **`gitlab_create_merge_request`**
  - Create a new merge request.
  - Inputs: `project_id` (number), `source_branch` (string), `target_branch` (string), `title` (string), `description` (string, optional).
  - Returns: Created merge request details.

- **`gitlab_list_merge_requests`**
  - List merge requests for a project.
  - Inputs: `project_id` (number), `state` (opened/closed/locked/merged/all), `source_branch` (string, optional), `target_branch` (string, optional), `search` (string, optional).
  - Returns: List of merge requests with status and branches.

- **`gitlab_update_merge_request`**
  - Update a merge request (title, description, state, etc).
  - Inputs: `project_id` (number), `merge_request_iid` (number), `title` (string, optional), `description` (string, optional), `state_event` (close/reopen), `target_branch` (string, optional).
  - Returns: Updated merge request details.

- **`gitlab_get_merge_request_changes`**
  - Get the diff/changes of a merge request.
  - Inputs: `project_id` (number), `merge_request_iid` (number).
  - Returns: List of changed files and their diffs.

### Comments

- **`gitlab_create_note`**
  - Add a comment to an issue or merge request.
  - Inputs: `project_id` (number), `entity_type` (issue/merge_request), `entity_iid` (number), `body` (string).
  - Returns: Created comment details.

### Repository

- **`gitlab_get_file_contents`**
  - Get the raw content of a file.
  - Inputs: `project_id` (number), `file_path` (string), `ref` (string, default: "main").
  - Returns: Raw file content string.

## Features

- **Optimized Fetching**: Uses HTTP Keep-Alive with a connection pool (max 20) for improved performance.
- **Robust Error Handling**: Standardized error messages for common GitLab API failures (401, 403, 404).

## Development

1.  Install dependencies:

    ```bash
    npm install
    ```

2.  Build the project:

    ```bash
    npm run build
    ```

3.  Run the server (stdio mode):
    ```bash
    node dist/index.js
    ```
    _Note: Ensure environment variables are set before running._

## License

MIT
