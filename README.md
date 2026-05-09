# GitLab MCP Server

A Model Context Protocol (MCP) server that provides a comprehensive interface for interacting with GitLab. This server enables LLMs to search projects, navigate repositories, manage issues and merge requests, and perform advanced code searches.

## Features

- **Smart Project Resolution**: Use project names, full paths, or custom shortcuts instead of numeric IDs.
- **Persistent Shortcuts**: Create shorthand names for projects (e.g., `nds` for `news-data-service`) that persist across sessions.
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
- **`gitlab_get_project_stack`**: Analyze root manifest files to determine the tech stack and dependencies.
- **`gitlab_read_imported_file`**: Follow and read relative imports from a source file automatically.
- **`gitlab_create_branch`**: Create a new branch for development.
- **`gitlab_set_project_shortcut`**: Create a persistent shorthand shortcut for a project ID or path.
- **`gitlab_get_file_blame`**: Get line-by-line attribution and commit history for a file.
- **`gitlab_list_commits`**: Get recent commits for a project or specific branch/path.
- **`gitlab_get_commit`**: Get details and diff for a specific commit.
- **`gitlab_batch_commit`**: Perform multiple file actions (create, update, delete) in a single commit directly via the GitLab API.

### Code & Search

- **`gitlab_get_file_contents`**: Read the raw content of any file. Supports `start_line` and `end_line` for targeted reading.
- **`gitlab_get_multiple_files`**: Fetch the contents of multiple files concurrently in a single request.
- **`gitlab_search_code`**: Search for code snippets globally, or scoped to a specific group/project.
- **`gitlab_find_definitions`**: Find where a class, function, or symbol is declared.
- **`gitlab_find_usages`**: Find where a symbol is referenced across a project (intelligently filters out definitions).

### Issues

- **`gitlab_list_issues`**: List and filter issues for a project.
- **`gitlab_get_issue`**: Get full details, description, and status of a specific issue.
- **`gitlab_create_issue`**: Create a new issue with labels and description.
- **`gitlab_update_issue`**: Update an issue's state, labels, or assignment.
- **`gitlab_get_discussions`**: Fetch all comments and review threads for an issue.

### Merge Requests

- **`gitlab_list_merge_requests`**: List and filter MRs for a project.
- **`gitlab_create_merge_request`**: Open a new merge request between branches.
- **`gitlab_update_merge_request`**: Update MR details or change its state.
- **`gitlab_get_merge_request_changes`**: View file diffs for an MR with automated analysis prompts.
- **`gitlab_create_review_comment`**: Add an inline code comment on a specific line within an MR.
- **`gitlab_get_discussions`**: Fetch all comments and review threads for an MR.

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
