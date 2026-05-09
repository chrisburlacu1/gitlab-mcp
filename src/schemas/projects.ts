import { z } from "zod";
import { DEFAULT_LIMIT } from "../constants.js";

export const SearchProjectsSchema = z.object({
  search: z.string().describe("Search query for project name or path"),
  membership: z.boolean().optional().default(true).describe("Limit to projects where current user is a member"),
  limit: z.number().optional().default(DEFAULT_LIMIT).describe("Max results to return")
}).strict();

export const GetProjectSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut (e.g., 'nds') of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
}).strict();

export const SetProjectShortcutSchema = z.object({
  shortcut: z.string().describe("The short name or shortcut to use (e.g., 'nds')"),
  project_id: z.union([z.number(), z.string()]).describe("The target project ID, name, or path that the shortcut points to")
}).strict();
