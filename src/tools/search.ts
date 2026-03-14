import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { SearchCodeSchema } from "../schemas/search.js";

export async function searchCode(params: z.infer<typeof SearchCodeSchema>) {
  try {
    let endpoint = "/search";

    if (params.project_id) {
      const projectId = await projectResolver.resolve(params.project_id);
      endpoint = `/projects/${projectId}/search`;
    } else if (params.group_id) {
      // NOTE: We don't have a groupResolver yet, so we assume group_id is either a numeric ID or a URL-encoded path.
      let groupId = params.group_id;
      if (typeof groupId === "string" && isNaN(Number(groupId))) {
        groupId = encodeURIComponent(groupId);
      }
      endpoint = `/groups/${groupId}/search`;
    }

    const searchResults = await gitlab.get<any[]>(endpoint, {
      params: {
        scope: "blobs",
        search: params.query,
      },
    });

    if (!searchResults || searchResults.length === 0) {
      return {
        content: [{ type: "text" as const, text: "No code matches found for the given query." }],
      };
    }

    const formattedResults = searchResults
      .map((result: any) => {
        return `### File: 
${result.filename}
 (Project ID: ${result.project_id})
Line ${result.startline}: 
${result.data}`;
      })
      .join("\n\n");

    return {
      content: [{ type: "text" as const, text: formattedResults }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "search_code") }],
    };
  }
}
