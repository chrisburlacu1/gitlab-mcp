import { z } from "zod";
import { DEFAULT_LIMIT } from "../constants.js";

export const ListIssuesSchema = z.object({
  project_id: z.number().describe("The ID of the project"),
  state: z.enum(["opened", "closed", "all"]).optional().default("opened"),
  labels: z.string().optional().describe("Comma-separated list of label names"),
  search: z.string().optional().describe("Search term in title or description"),
  limit: z.number().optional().default(DEFAULT_LIMIT)
}).strict();

export const CreateIssueSchema = z.object({
  project_id: z.number().describe("The ID of the project"),
  title: z.string().describe("Title of the issue"),
  description: z.string().optional().describe("Description of the issue"),
  labels: z.string().optional().describe("Comma-separated list of label names")
}).strict();
