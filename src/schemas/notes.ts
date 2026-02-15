import { z } from "zod";

export const CreateNoteSchema = z.object({
  project_id: z.number().describe("The ID of the project"),
  entity_type: z.enum(["issue", "merge_request"]).describe("The type of entity to comment on"),
  entity_iid: z.number().describe("The IID (internal ID) of the issue or MR"),
  body: z.string().describe("The content of the comment")
}).strict();
