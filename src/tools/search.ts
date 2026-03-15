import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { SearchCodeSchema, FindDefinitionsSchema } from "../schemas/search.js";

export async function searchCode(params: z.infer<typeof SearchCodeSchema>) {
  try {
    let endpoint = "/search";

    if (params.project_id) {
      const projectId = await projectResolver.resolve(params.project_id);
      endpoint = `/projects/${projectId}/search`;
    } else if (params.group_id) {
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
        return `### File: \`${result.filename}\` (Project ID: ${result.project_id})\nLine ${result.startline}: \`${result.data}\``;
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

export async function findDefinitions(params: z.infer<typeof FindDefinitionsSchema>) {
  try {
    let endpoint = "/search";
    if (params.project_id) {
      const projectId = await projectResolver.resolve(params.project_id);
      endpoint = `/projects/${projectId}/search`;
    } else if (params.group_id) {
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
        content: [{ type: "text" as const, text: `No definitions found for '${params.query}'.` }],
      };
    }

    // Filter results to find the most likely definition line
    const formattedResults = searchResults
      .map((result: any) => {
        return `### Definition in: \`${result.filename}\` (Project ID: ${result.project_id})\nLine ${result.startline}: \`${result.data}\``;
      })
      .join("\n\n");

    return {
      content: [{ type: "text" as const, text: formattedResults }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "find_definitions") }],
    };
  }
}
