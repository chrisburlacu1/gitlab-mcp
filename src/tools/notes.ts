import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { GitLabNote } from "../types.js";
import { CreateNoteSchema } from "../schemas/notes.js";

export async function createNote(params: z.infer<typeof CreateNoteSchema>) {
  try {
    const endpoint = params.entity_type === "issue" ? "issues" : "merge_requests";
    const response = await gitlab.post<GitLabNote>(`/projects/${params.project_id}/${endpoint}/${params.entity_iid}/notes`, {
      body: params.body
    });

    return {
      content: [{ type: "text" as const, text: `Comment added successfully: ${response.data.body}` }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "create_note") }]
    };
  }
}
