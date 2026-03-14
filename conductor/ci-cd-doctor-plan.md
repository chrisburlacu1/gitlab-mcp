# Plan: Implement CI/CD Pipeline "Doctor" with Comprehensive Auto-Analysis

## Objective
Enable the agent to monitor continuous integration pipelines, inspect failed jobs, and extract precise error logs. The job log tool will be structured to prompt the agent to automatically deduce the root cause—whether it's a source code error, a test failure, or a fundamental CI/CD configuration issue—and suggest a fix.

## Scope of Changes

We will introduce three new tools under the CI/CD category:
1.  `gitlab_list_pipelines`: View the high-level status of recent pipelines.
2.  `gitlab_get_pipeline_jobs`: Drill down into a specific pipeline to see which individual jobs passed or failed.
3.  `gitlab_get_job_log`: Fetch the raw trace/log of a specific job. **This tool will be designed to encourage the LLM to auto-analyze the failure holistically.**

### 1. Schema Definitions (`src/schemas/ci-cd.ts`)
*   `ListPipelinesSchema`: `project_id`, `status` (optional), `ref` (optional), `limit`.
*   `GetPipelineJobsSchema`: `project_id`, `pipeline_id`, `scope` (optional array of statuses like 'failed').
*   `GetJobLogSchema`: `project_id`, `job_id`, `tail_lines` (optional, default 200).

### 2. Tool Implementations (`src/tools/ci-cd.ts`)
*   **`listPipelines`**: Calls `GET /projects/:id/pipelines`. Formats output to show pipeline ID, status, ref, and URL.
*   **`getPipelineJobs`**: Calls `GET /projects/:id/pipelines/:pipeline_id/jobs`. Formats output to show job ID, name, stage, and status.
*   **`getJobLog`**: 
    *   Calls `GET /projects/:id/jobs/:job_id/trace`. 
    *   Job traces can be massive. We must split the text by newlines and return only the last `N` lines (controlled by `tail_lines`).
    *   **Holistic Auto-Analysis Prompting:** In the formatted text returned by `gitlab_get_job_log`, we will append a comprehensive system-level prompt/instruction block directly into the Markdown.
        *Example Output:*
        ```markdown
        ### Log Trace (Last 200 lines):
        [... raw log data ...]

        ---
        **ANALYSIS REQUIRED:** Based on the log trace above, please identify the root cause of the failure. Consider all possibilities:
        1. **Source Code/Logic Error:** If a specific file and line number are mentioned, use the `gitlab_get_file_contents` tool to inspect the application code.
        2. **Test Failure:** If tests are failing, inspect the relevant test file and the code it covers.
        3. **CI/CD Configuration Issue:** If the failure is related to environment variables, missing dependencies, or runner environments, consider inspecting the `.gitlab-ci.yml` or related build scripts (e.g., `package.json`, `Dockerfile`).
        
        Once you have identified the root cause, propose a concrete fix.
        ```
    This explicit instruction within the tool's return value nudges the LLM to consider infrastructure and configuration issues alongside standard code bugs.

### 3. Server Registration (`src/index.ts`)
*   Import schemas and functions.
*   Register `gitlab_list_pipelines`, `gitlab_get_pipeline_jobs`, and `gitlab_get_job_log`.

## Implementation Steps
1.  Create `src/schemas/ci-cd.ts`.
2.  Create `src/tools/ci-cd.ts` with the comprehensive auto-analysis prompting logic built into `getJobLog`.
3.  Update `src/index.ts`.
4.  Update `README.md` to document the new CI/CD tools.