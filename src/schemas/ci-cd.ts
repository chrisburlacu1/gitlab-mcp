import { z } from "zod";

export const ListPipelinesSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  status: z.enum(["running", "pending", "success", "failed", "canceled", "skipped", "manual"]).optional().describe("Filter pipelines by status"),
  ref: z.string().optional().describe("Filter by the ref (branch or tag)"),
  limit: z.number().optional().default(10).describe("Max results to return")
}).strict();

export const GetPipelineJobsSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  pipeline_id: z.number().describe("The ID of the pipeline"),
  scope: z.array(z.enum(["created", "pending", "running", "failed", "success", "canceled", "skipped", "manual"])).optional().describe("Filter jobs by status scope")
}).strict();

export const GetJobLogSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  job_id: z.number().describe("The ID of the job"),
  tail_lines: z.number().optional().default(200).describe("Number of lines to return from the end of the log")
}).strict();
