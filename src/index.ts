#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { SearchProjectsSchema, GetProjectSchema, SetProjectShortcutSchema } from "./schemas/projects.js";
import { ListIssuesSchema, CreateIssueSchema, GetIssueSchema, UpdateIssueSchema } from "./schemas/issues.js";
import {
  CreateMergeRequestSchema,
  ListMergeRequestsSchema,
  UpdateMergeRequestSchema,
  GetMergeRequestChangesSchema,
  CreateReviewCommentSchema,
} from "./schemas/merge-requests.js";
import { CreateNoteSchema } from "./schemas/notes.js";
import { GetFileContentsSchema, GetRepositoryTreeSchema, CreateBranchSchema, GetMultipleFilesSchema, GetProjectStackSchema, ReadImportedFileSchema, GetFileBlameSchema } from "./schemas/repository.js";
import { SearchCodeSchema, FindDefinitionsSchema, FindUsagesSchema } from "./schemas/search.js";
import { ListPipelinesSchema, GetPipelineJobsSchema, GetJobLogSchema } from "./schemas/ci-cd.js";

import { searchProjects, getProject, setProjectShortcut } from "./tools/projects.js";
import { listIssues, createIssue, getIssue, updateIssue } from "./tools/issues.js";
import {
  createMergeRequest,
  listMergeRequests,
  updateMergeRequest,
  getMergeRequestChanges,
  createReviewComment,
} from "./tools/merge-requests.js";
import { createNote } from "./tools/notes.js";
import { getFileContents, getRepositoryTree, createBranch, getMultipleFiles, getProjectStack, readImportedFile, getFileBlame } from "./tools/repository.js";
import { searchCode, findDefinitions, findUsages } from "./tools/search.js";
import { listPipelines, getPipelineJobs, getJobLog } from "./tools/ci-cd.js";

const server = new McpServer({
  name: "gitlab-mcp-server",
  version: "1.0.0",
});

server.registerTool(
  "gitlab_search_projects",
  {
    title: "Search Projects",
    description: "Search for GitLab projects by name or path.",
    inputSchema: SearchProjectsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  searchProjects,
);

server.registerTool(
  "gitlab_get_project",
  {
    title: "Get Project",
    description: "Get details of a specific GitLab project by ID.",
    inputSchema: GetProjectSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getProject,
);

server.registerTool(
  "gitlab_set_project_shortcut",
  {
    title: "Set Project Shortcut",
    description: "Create or update a shorthand shortcut for a GitLab project (e.g., 'nds' -> 'news-data-service'). This shortcut will persist across sessions.",
    inputSchema: SetProjectShortcutSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  setProjectShortcut,
);

server.registerTool(
  "gitlab_list_issues",
  {
    title: "List Issues",
    description: "List issues for a project with optional filtering.",
    inputSchema: ListIssuesSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  listIssues,
);

server.registerTool(
  "gitlab_create_issue",
  {
    title: "Create Issue",
    description: "Create a new issue in a project.",
    inputSchema: CreateIssueSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  createIssue,
);

server.registerTool(
  "gitlab_create_merge_request",
  {
    title: "Create Merge Request",
    description: "Create a new merge request.",
    inputSchema: CreateMergeRequestSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  createMergeRequest,
);

server.registerTool(
  "gitlab_list_merge_requests",
  {
    title: "List Merge Requests",
    description: "List merge requests for a project with optional filtering.",
    inputSchema: ListMergeRequestsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  listMergeRequests,
);

server.registerTool(
  "gitlab_update_merge_request",
  {
    title: "Update Merge Request",
    description: "Update a merge request (title, description, state, etc).",
    inputSchema: UpdateMergeRequestSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  updateMergeRequest,
);

server.registerTool(
  "gitlab_get_merge_request_changes",
  {
    title: "Get Merge Request Changes",
    description: "Get the diff/changes of a merge request.",
    inputSchema: GetMergeRequestChangesSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getMergeRequestChanges,
);

server.registerTool(
  "gitlab_create_review_comment",
  {
    title: "Create Review Comment",
    description: "Add an inline code comment on a specific line within a merge request.",
    inputSchema: CreateReviewCommentSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  createReviewComment,
);

server.registerTool(
  "gitlab_create_note",
  {
    title: "Create Note",
    description: "Add a comment (note) to an issue or merge request.",
    inputSchema: CreateNoteSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  createNote,
);

server.registerTool(
  "gitlab_get_file_contents",
  {
    title: "Get File Contents",
    description: "Get the raw contents of a file from the repository.",
    inputSchema: GetFileContentsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getFileContents,
);

server.registerTool(
  "gitlab_get_multiple_files",
  {
    title: "Get Multiple Files",
    description: "Get the raw contents of multiple files from the repository concurrently.",
    inputSchema: GetMultipleFilesSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getMultipleFiles,
);

server.registerTool(
  "gitlab_get_repository_tree",
  {
    title: "Get Repository Tree",
    description: "Get a recursive list of files and directories in the repository.",
    inputSchema: GetRepositoryTreeSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getRepositoryTree,
);

server.registerTool(
  "gitlab_search_code",
  {
    title: "Search Code",
    description: "Search for code snippets globally, or scoped to a specific group or project.",
    inputSchema: SearchCodeSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  searchCode,
);

server.registerTool(
  "gitlab_find_definitions",
  {
    title: "Find Definitions",
    description: "Find the definition of a class, function, or symbol (e.g., where it is declared).",
    inputSchema: FindDefinitionsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  findDefinitions,
);

server.registerTool(
  "gitlab_find_usages",
  {
    title: "Find Usages",
    description: "Find where a class, function, or symbol is used/referenced in the project.",
    inputSchema: FindUsagesSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  findUsages,
);

server.registerTool(
  "gitlab_list_pipelines",
  {
    title: "List Pipelines",
    description: "List recent CI/CD pipelines for a project.",
    inputSchema: ListPipelinesSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  listPipelines,
);

server.registerTool(
  "gitlab_get_pipeline_jobs",
  {
    title: "Get Pipeline Jobs",
    description: "List the individual jobs within a specific pipeline.",
    inputSchema: GetPipelineJobsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getPipelineJobs,
);

server.registerTool(
  "gitlab_get_job_log",
  {
    title: "Get Job Log",
    description: "Fetch the trace/log for a specific CI/CD job. Useful for diagnosing pipeline failures.",
    inputSchema: GetJobLogSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getJobLog,
);

server.registerTool(
  "gitlab_get_issue",
  {
    title: "Get Issue",
    description: "Get full details of a specific issue including its description and status.",
    inputSchema: GetIssueSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getIssue,
);

server.registerTool(
  "gitlab_update_issue",
  {
    title: "Update Issue",
    description: "Update an issue's state, labels, or assignment.",
    inputSchema: UpdateIssueSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  updateIssue,
);

server.registerTool(
  "gitlab_create_branch",
  {
    title: "Create Branch",
    description: "Create a new branch from an existing reference.",
    inputSchema: CreateBranchSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  createBranch,
);

server.registerTool(
  "gitlab_get_project_stack",
  {
    title: "Get Project Stack",
    description: "Analyze the project's root manifest files to determine the technology stack and dependencies.",
    inputSchema: GetProjectStackSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getProjectStack,
);

server.registerTool(
  "gitlab_read_imported_file",
  {
    title: "Read Imported File",
    description: "Follow a relative import path from a source file and read its content. Handles common extensions and index files automatically.",
    inputSchema: ReadImportedFileSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  readImportedFile,
);

server.registerTool(
  "gitlab_get_file_blame",
  {
    title: "Get File Blame",
    description: "Get line-by-line attribution for a file to see who last changed each part.",
    inputSchema: GetFileBlameSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getFileBlame,
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GitLab MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
