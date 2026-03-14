import { z } from "zod";

export const CreateMergeRequestSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  source_branch: z.string().describe("The source branch"),
  target_branch: z.string().describe("The target branch"),
  title: z.string().describe("Title of the MR"),
  description: z.string().optional().describe("Description of the MR")
}).strict();

export const ListMergeRequestsSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  state: z.enum(["opened", "closed", "locked", "merged", "all"]).optional().describe("Filter by state"),
  source_branch: z.string().optional().describe("Filter by source branch"),
  target_branch: z.string().optional().describe("Filter by target branch"),
  search: z.string().optional().describe("Search query for title or description")
}).strict();

export const UpdateMergeRequestSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  merge_request_iid: z.number().describe("The internal ID (IID) of the MR"),
  title: z.string().optional().describe("New title"),
  description: z.string().optional().describe("New description"),
  state_event: z.enum(["close", "reopen"]).optional().describe("Change state (close/reopen)"),
  target_branch: z.string().optional().describe("New target branch"),
  remove_source_branch: z.boolean().optional().describe("Flag to remove source branch on merge")
}).strict();

export const GetMergeRequestChangesSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  merge_request_iid: z.number().describe("The internal ID (IID) of the MR")
}).strict();

export const CreateReviewCommentSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  merge_request_iid: z.number().describe("The internal ID (IID) of the MR"),
  body: z.string().describe("The text content of the comment"),
  base_sha: z.string().describe("Base commit SHA of the merge request (the commit on the target branch)"),
  start_sha: z.string().describe("Start commit SHA (usually same as base_sha)"),
  head_sha: z.string().describe("Head commit SHA (the latest commit on the source branch)"),
  old_path: z.string().optional().describe("The path of the file before changes (needed if the file was moved or renamed)"),
  new_path: z.string().optional().describe("The path of the file after changes (usually the same as old_path)"),
  old_line: z.number().optional().describe("The line number in the original file"),
  new_line: z.number().optional().describe("The line number in the changed file")
}).strict();
