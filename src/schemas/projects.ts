import { z } from "zod";
import { DEFAULT_LIMIT } from "../constants.js";

export const SearchProjectsSchema = z.object({
  search: z.string().describe("Search query for project name or path"),
  membership: z.boolean().optional().default(true).describe("Limit to projects where current user is a member"),
  limit: z.number().optional().default(DEFAULT_LIMIT).describe("Max results to return")
}).strict();

export const GetProjectSchema = z.object({
  project_id: z.number().describe("The ID of the project")
}).strict();
