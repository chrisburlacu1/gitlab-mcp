# GitLab MCP Server

A Model Context Protocol (MCP) server that provides a comprehensive interface for interacting with GitLab. This server enables LLMs to search projects, navigate repositories, manage issues and merge requests, and perform advanced code searches.

## Features

- **Smart Project Resolution**: Use project names, full paths, or custom aliases instead of numeric IDs.
- **Persistent Aliases**: Create shorthand names for projects (e.g., `nds` for `news-data-service`) that persist across sessions.
- **Rich Markdown Responses**: Tool outputs are formatted for maximum LLM readability and minimal token consumption.
- **Advanced Code Search**: Search for code snippets or specific symbol definitions (classes, functions) across projects or groups.
- **Performance Optimized**: Includes connection pooling, transparent 30s TTL caching, and gzip compression.
- **Recursive Navigation**: View hierarchical repository structures at a glance.

## Configuration

This server requires the following environment variables:

- `GITLAB_PERSONAL_ACCESS_TOKEN`: Your GitLab Personal Access Token (requires `api` and `read_api` scopes).
- `GITLAB_API_URL`: (Optional) The base URL for your GitLab instance. Defaults to `https://gitlab.com/api/v4`.

## Tools

### Projects & Navigation

- **`gitlab_search_projects`**: Search for projects by name or path.
- **`gitlab_get_project`**: Get detailed metadata, including recent open issues and merge requests.
- **`gitlab_get_repository_tree`**: Get a recursive list of files and directories in a repository.
- **`gitlab_create_branch`**: Create a new branch for development.
- **`gitlab_set_project_alias`**: Create a persistent shorthand alias for a project ID or path.

### Code & Search

- **`gitlab_get_file_contents`**: Read the raw content of any file. Supports `start_line` and `end_line` for targeted reading.
- **`gitlab_get_multiple_files`**: Fetch the contents of multiple files concurrently in a single request.
- **`gitlab_search_code`**: Search for code snippets globally, or scoped to a specific group/project.
- **`gitlab_find_definitions`**: Find where a class, function, or symbol is declared. Optimized for compatibility across all GitLab tiers.

### Issues

- **`gitlab_list_issues`**: List and filter issues for a project.
- **`gitlab_get_issue`**: Get full details, description, and status of a specific issue.
- **`gitlab_create_issue`**: Create a new issue with labels and description.
- **`gitlab_update_issue`**: Update an issue's state, labels, or assignment.

### Merge Requests

- **`gitlab_list_merge_requests`**: List and filter MRs for a project.
- **`gitlab_create_merge_request`**: Open a new merge request between branches.
- **`gitlab_update_merge_request`**: Update MR details or change its state.
- **`gitlab_get_merge_request_changes`**: View the file diffs for a specific merge request.
- **`gitlab_create_review_comment`**: Add an inline code comment on a specific line within an MR.

### Comments

- **`gitlab_create_note`**: Add a general comment to an issue or merge request.

### CI/CD Pipelines

- **`gitlab_list_pipelines`**: View recent pipelines for a project (filterable by status/branch).
- **`gitlab_get_pipeline_jobs`**: List the individual jobs that make up a specific pipeline.
- **`gitlab_get_job_log`**: Fetch the raw trace log of a job. Includes LLM-optimized instructions to automatically diagnose the root cause of build failures.

## Development

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Build the project**:
    ```bash
    npm run build
    ```

3.  **Run in Development Mode** (auto-reloading):
    ```bash
    npm run dev
    ```

4.  **Production Run** (stdio):
    ```bash
    node dist/index.js
    ```

## License

MIT
