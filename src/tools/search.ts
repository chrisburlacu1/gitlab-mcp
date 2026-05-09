import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { SearchCodeSchema, FindDefinitionsSchema, FindUsagesSchema } from "../schemas/search.js";

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

export async function findUsages(params: z.infer<typeof FindUsagesSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const endpoint = `/projects/${projectId}/search`;

    const searchResults = await gitlab.get<any[]>(endpoint, {
      params: {
        scope: "blobs",
        search: params.query,
      },
    });

    if (!searchResults || searchResults.length === 0) {
      return {
        content: [{ type: "text" as const, text: `No usages found for '${params.query}'.` }],
      };
    }

    // Heuristics for definitions to filter out
    // These patterns vary by language, but we cover the most common ones
    const definitionPatterns = [
      new RegExp(`(class|function|interface|type|enum|struct)\\s+${params.query}`, 'i'),
      new RegExp(`(const|let|var|func|def)\\s+${params.query}\\s*[=:(]`, 'i'),
      new RegExp(`^\\s*${params.query}\\s*[:(]`, 'i'), // Likely a method or property definition in a class/object
    ];

    const filteredResults = searchResults.filter((result: any) => {
      // Filter by extension if provided
      if (params.file_extension && !result.filename.endsWith(`.${params.file_extension}`)) {
        return false;
      }

      const lineContent = result.data.trim();
      
      // Check if the line matches any common definition pattern
      const isDefinition = definitionPatterns.some(pattern => pattern.test(lineContent));
      
      return !isDefinition;
    });

    if (filteredResults.length === 0) {
      return {
        content: [{ type: "text" as const, text: `Matches for '${params.query}' were found, but they all appear to be definitions rather than usages.` }],
      };
    }

    const formattedResults = filteredResults
      .map((result: any) => {
        return `### Usage in: \`${result.filename}\`\nLine ${result.startline}: \`${result.data.trim()}\``;
      })
      .join("\n\n");

    return {
      content: [
        { 
          type: "text" as const, 
          text: `## Usages of '${params.query}'\n\n${formattedResults}\n\n---\n**TIP:** Use \`gitlab_get_file_contents\` to see the full context around these usages.` 
        }
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "find_usages") }],
    };
  }
}
