import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { GetFileContentsSchema, GetRepositoryTreeSchema, CreateBranchSchema, GetMultipleFilesSchema } from "../schemas/repository.js";

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

    let contentString = typeof fileData === "string" ? fileData : JSON.stringify(fileData);

    if (params.start_line || params.end_line) {
      const lines = contentString.split('\n');
      const start = (params.start_line || 1) - 1; // 0-indexed
      const end = params.end_line || lines.length;
      
      const slicedLines = lines.slice(Math.max(0, start), Math.min(lines.length, end));
      
      // Add line numbers to the output for context
      contentString = slicedLines.map((line, index) => `${start + index + 1} | ${line}`).join('\n');
      contentString = `### File: \`${params.file_path}\` (Lines ${start + 1}-${end})\n\n\`\`\`\n${contentString}\n\`\`\``;
    } else {
      contentString = `### File: \`${params.file_path}\`\n\n\`\`\`\n${contentString}\n\`\`\``;
    }

    return {
      content: [
        {
          type: "text" as const,
          text: contentString,
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

export async function createBranch(params: z.infer<typeof CreateBranchSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const branchData = await gitlab.post<any>(`/projects/${projectId}/repository/branches`, null, {
      params: {
        branch: params.branch,
        ref: params.ref
      }
    });

    return {
      content: [{ type: "text" as const, text: `Branch '${branchData.name}' created successfully from '${params.ref}'.` }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "create_branch") }]
    };
  }
}

export async function getMultipleFiles(params: z.infer<typeof GetMultipleFilesSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    
    // Fetch all files concurrently
    const filePromises = params.file_paths.map(async (filePath) => {
      const encodedPath = encodeURIComponent(filePath);
      try {
        const fileData = await gitlab.get<string>(
          `/projects/${projectId}/repository/files/${encodedPath}/raw`,
          {
            params: { ref: params.ref },
            responseType: "text",
          },
        );
        const content = typeof fileData === "string" ? fileData : JSON.stringify(fileData);
        return `### File: \`${filePath}\`\n\n\`\`\`\n${content}\n\`\`\``;
      } catch (err) {
        return `### File: \`${filePath}\`\n\n*Error fetching file: ${err instanceof Error ? err.message : String(err)}*`;
      }
    });

    const results = await Promise.all(filePromises);

    return {
      content: [{ type: "text" as const, text: results.join('\n\n') }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "get_multiple_files") }]
    };
  }
}


