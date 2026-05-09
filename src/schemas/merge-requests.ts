import { z } from "zod";

export const CreateMergeRequestSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  source_branch: z.string().describe("The source branch"),
  target_branch: z.string().describe("The target branch"),
  title: z.string().describe("Title of the MR"),
  description: z.string().optional().describe("Description of the MR")
}).strict();

export const ListMergeRequestsSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  state: z.enum(["opened", "closed", "locked", "merged", "all"]).optional().describe("Filter by state"),
  source_branch: z.string().optional().describe("Filter by source branch"),
  target_branch: z.string().optional().describe("Filter by target branch"),
  search: z.string().optional().describe("Search query for title or description")
}).strict();

export const UpdateMergeRequestSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  merge_request_iid: z.number().describe("The internal ID (IID) of the MR"),
  title: z.string().optional().describe("New title"),
  description: z.string().optional().describe("New description"),
  state_event: z.enum(["close", "reopen"]).optional().describe("Change state (close/reopen)"),
  target_branch: z.string().optional().describe("New target branch"),
  remove_source_branch: z.boolean().optional().describe("Flag to remove source branch on merge")
}).strict();

export const GetMergeRequestChangesSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  merge_request_iid: z.number().describe("The internal ID (IID) of the MR")
}).strict();

export const CreateReviewCommentSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  merge_request_iid: z.number().describe("The internal ID (IID) of the MR"),
  file_path: z.string().describe("The relative path to the file being commented on"),
  line: z.number().describe("The line number in the changed file to comment on"),
  body: z.string().describe("The text content of the comment")
}).strict();
