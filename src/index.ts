#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { SearchProjectsSchema, GetProjectSchema, SetProjectAliasSchema } from "./schemas/projects.js";
import { ListIssuesSchema, CreateIssueSchema } from "./schemas/issues.js";
import {
  CreateMergeRequestSchema,
  ListMergeRequestsSchema,
  UpdateMergeRequestSchema,
  GetMergeRequestChangesSchema,
  CreateReviewCommentSchema,
} from "./schemas/merge-requests.js";
import { CreateNoteSchema } from "./schemas/notes.js";
import { GetFileContentsSchema } from "./schemas/repository.js";
import { SearchCodeSchema } from "./schemas/search.js";

import { searchProjects, getProject, setProjectAlias } from "./tools/projects.js";
import { listIssues, createIssue } from "./tools/issues.js";
import {
  createMergeRequest,
  listMergeRequests,
  updateMergeRequest,
  getMergeRequestChanges,
  createReviewComment,
} from "./tools/merge-requests.js";
import { createNote } from "./tools/notes.js";
import { getFileContents } from "./tools/repository.js";
import { searchCode } from "./tools/search.js";

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
  "gitlab_set_project_alias",
  {
    title: "Set Project Alias",
    description: "Create or update a shorthand alias for a GitLab project (e.g., 'nds' -> 'news-data-service'). This alias will persist across sessions.",
    inputSchema: SetProjectAliasSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  setProjectAlias,
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GitLab MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
