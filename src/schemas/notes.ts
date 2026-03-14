import { z } from "zod";

export const CreateNoteSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  entity_type: z.enum(["issue", "merge_request"]).describe("The type of entity to comment on"),
  entity_iid: z.number().describe("The IID (internal ID) of the issue or MR"),
  body: z.string().describe("The content of the comment")
}).strict();
