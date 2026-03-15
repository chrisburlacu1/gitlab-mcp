import { z } from "zod";
import path from "path";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { 
  GetFileContentsSchema, 
  GetRepositoryTreeSchema, 
  CreateBranchSchema, 
  GetMultipleFilesSchema,
  GetProjectStackSchema,
  ReadImportedFileSchema
} from "../schemas/repository.js";

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

export async function getProjectStack(params: z.infer<typeof GetProjectStackSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const treeData = await gitlab.get<any[]>(`/projects/${projectId}/repository/tree`, {
      params: { per_page: 100 }
    });

    const manifestFiles = [
      "package.json", "go.mod", "Cargo.toml", "requirements.txt", 
      "Gemfile", "composer.json", "Dockerfile", "docker-compose.yml",
      ".gitlab-ci.yml", "tsconfig.json"
    ];

    const foundManifests = treeData
      .filter(item => item.type === "blob" && manifestFiles.includes(item.name))
      .map(item => item.name);

    if (foundManifests.length === 0) {
      return {
        content: [{ type: "text" as const, text: "No common manifest files found in root. Could not determine tech stack." }]
      };
    }

    const filePromises = foundManifests.map(async (fileName) => {
      try {
        const content = await gitlab.get<string>(`/projects/${projectId}/repository/files/${fileName}/raw`, {
          responseType: "text"
        });
        return { name: fileName, content };
      } catch {
        return null;
      }
    });

    const fileContents = (await Promise.all(filePromises)).filter((f): f is { name: string, content: string } => f !== null);

    let report = "# Project Tech Stack Profile\n\n";
    
    for (const file of fileContents) {
      report += `### 📄 ${file.name}\n`;
      if (file.name === "package.json") {
        try {
          const pkg = JSON.parse(file.content);
          report += `- **Name:** ${pkg.name}\n`;
          report += `- **Version:** ${pkg.version}\n`;
          if (pkg.dependencies) report += `- **Dependencies:** ${Object.keys(pkg.dependencies).length} packages\n`;
          if (pkg.devDependencies) report += `- **Dev Dependencies:** ${Object.keys(pkg.devDependencies).length} packages\n`;
          if (pkg.scripts) report += `- **Scripts:** ${Object.keys(pkg.scripts).join(", ")}\n`;
        } catch {
          report += "- *Error parsing package.json*\n";
        }
      } else {
        // For others, show the first 10 lines
        const lines = file.content.split("\n").slice(0, 10).join("\n");
        report += "```\n" + lines + (file.content.split("\n").length > 10 ? "\n..." : "") + "\n```\n";
      }
      report += "\n";
    }

    return {
      content: [{ type: "text" as const, text: report }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "get_project_stack") }]
    };
  }
}

export async function readImportedFile(params: z.infer<typeof ReadImportedFileSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const sourceDir = path.dirname(params.source_file_path);
    let resolvedPath = path.posix.join(sourceDir, params.import_string).replace(/\\/g, "/");

    // Clean up paths like './utils' or '../services'
    if (resolvedPath.startsWith("./")) resolvedPath = resolvedPath.substring(2);
    
    const possibleExtensions = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.js"];
    
    for (const ext of possibleExtensions) {
      const tryPath = resolvedPath + ext;
      const encodedPath = encodeURIComponent(tryPath);
      try {
        const fileData = await gitlab.get<string>(
          `/projects/${projectId}/repository/files/${encodedPath}/raw`,
          {
            params: { ref: params.ref },
            responseType: "text",
          },
        );
        return {
          content: [{ 
            type: "text" as const, 
            text: `### Resolved Import: \`${tryPath}\`\n\n\`\`\`\n${fileData}\n\`\`\`` 
          }]
        };
      } catch {
        continue;
      }
    }

    throw new Error(`Could not resolve import '${params.import_string}' from '${params.source_file_path}' after trying multiple extensions.`);
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "read_imported_file") }]
    };
  }
}


