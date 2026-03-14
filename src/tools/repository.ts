import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { GetFileContentsSchema, GetRepositoryTreeSchema } from "../schemas/repository.js";

export async function getFileContents(
  params: z.infer<typeof GetFileContentsSchema>,
) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const encodedPath = encodeURIComponent(params.file_path);
    const fileData = await gitlab.get<string>(
      `/projects/${projectId}/repository/files/${encodedPath}/raw`,
      {
        params: { ref: params.ref },
        responseType: "text",
      },
    );

    return {
      content: [
        {
          type: "text" as const,
          text:
            typeof fileData === "string"
              ? fileData
              : JSON.stringify(fileData),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: handleApiError(error, "get_file_contents"),
        },
      ],
    };
  }
}

export async function getRepositoryTree(
  params: z.infer<typeof GetRepositoryTreeSchema>,
) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const treeData = await gitlab.get<any[]>(`/projects/${projectId}/repository/tree`, {
      params: {
        path: params.path,
        ref: params.ref,
        recursive: params.recursive,
        per_page: 100 // Limit to 100 items per request for sanity
      }
    });

    if (!treeData || treeData.length === 0) {
      return {
        content: [{ type: "text" as const, text: "Repository tree is empty." }]
      };
    }

    const formattedTree = treeData.map(item => {
      const icon = item.type === "tree" ? "📁" : "📄";
      const depth = item.path.split("/").length - 1;
      const indent = "  ".repeat(depth);
      return `${indent}${icon} ${item.name}${item.type === "tree" ? "/" : ""}`;
    }).join("\n");

    return {
      content: [{ type: "text" as const, text: formattedTree }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "get_repository_tree") }]
    };
  }
}
