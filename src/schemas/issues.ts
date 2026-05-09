import { z } from "zod";
import { DEFAULT_LIMIT } from "../constants.js";

export const ListIssuesSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  state: z.enum(["opened", "closed", "all"]).optional().default("opened"),
  labels: z.string().optional().describe("Comma-separated list of label names"),
  search: z.string().optional().describe("Search term in title or description"),
  limit: z.number().optional().default(DEFAULT_LIMIT)
}).strict();

export const CreateIssueSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  title: z.string().describe("Title of the issue"),
  description: z.string().optional().describe("Description of the issue"),
  labels: z.string().optional().describe("Comma-separated list of label names")
}).strict();

export const GetIssueSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  issue_iid: z.number().describe("The internal ID (IID) of the issue")
}).strict();

export const UpdateIssueSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  issue_iid: z.number().describe("The internal ID (IID) of the issue"),
  state_event: z.enum(["close", "reopen"]).optional().describe("Change state (close/reopen)"),
  labels: z.string().optional().describe("Comma-separated list of label names (replaces existing labels)"),
  add_labels: z.string().optional().describe("Comma-separated list of label names to add"),
  remove_labels: z.string().optional().describe("Comma-separated list of label names to remove"),
  assignee_ids: z.array(z.number()).optional().describe("Array of user IDs to assign"),
  description: z.string().optional().describe("New description of the issue")
}).strict();
