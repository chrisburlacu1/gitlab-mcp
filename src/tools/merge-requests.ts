import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { GitLabMergeRequest } from "../types.js";
import {
  CreateMergeRequestSchema,
  ListMergeRequestsSchema,
  UpdateMergeRequestSchema,
  GetMergeRequestChangesSchema,
  CreateReviewCommentSchema,
} from "../schemas/merge-requests.js";

export async function createMergeRequest(
  params: z.infer<typeof CreateMergeRequestSchema>,
) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const mrData = await gitlab.post<GitLabMergeRequest>(
      `/projects/${projectId}/merge_requests`,
      {
        source_branch: params.source_branch,
        target_branch: params.target_branch,
        title: params.title,
        description: params.description,
      },
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Merge Request created successfully: ${mrData.web_url}`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: handleApiError(error, "create_merge_request"),
        },
      ],
    };
  }
}

export async function listMergeRequests(
  params: z.infer<typeof ListMergeRequestsSchema>,
) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const mrsData = await gitlab.get<GitLabMergeRequest[]>(
      `/projects/${projectId}/merge_requests`,
      {
        params: {
          state: params.state,
          source_branch: params.source_branch,
          target_branch: params.target_branch,
          search: params.search,
        },
      },
    );

    const formattedMRs = mrsData
      .map(
        (mr) =>
          `#${mr.iid}: ${mr.title} (${mr.state}) - ${mr.web_url}\nSource: ${mr.source_branch} -> Target: ${mr.target_branch}`,
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text" as const,
          text: formattedMRs || "No merge requests found.",
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: handleApiError(error, "list_merge_requests"),
        },
      ],
    };
  }
}

export async function updateMergeRequest(
  params: z.infer<typeof UpdateMergeRequestSchema>,
) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const mrData = await gitlab.put<GitLabMergeRequest>(
      `/projects/${projectId}/merge_requests/${params.merge_request_iid}`,
      {
        title: params.title,
        description: params.description,
        state_event: params.state_event,
        target_branch: params.target_branch,
        remove_source_branch: params.remove_source_branch,
      },
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Merge Request updated successfully: ${mrData.web_url}`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: handleApiError(error, "update_merge_request"),
        },
      ],
    };
  }
}

export async function getMergeRequestChanges(
  params: z.infer<typeof GetMergeRequestChangesSchema>,
) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const changesData = await gitlab.get<any>(
      `/projects/${projectId}/merge_requests/${params.merge_request_iid}/changes`,
    );

    const changes = changesData.changes || [];
    const formattedChanges = changes
      .map((change: any) => `File: ${change.new_path}\nDiff:\n${change.diff}`)
      .join("\n\n");

    const output = (formattedChanges || "No changes found.") + "\n\n---\n**ANALYSIS REQUIRED:** Review the above changes for potential bugs, security vulnerabilities, and adherence to project conventions. If you find issues, prepare to use 'gitlab_create_review_comment' to provide inline feedback.";

    return {
      content: [
        {
          type: "text" as const,
          text: output,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: handleApiError(error, "get_merge_request_changes"),
        },
      ],
    };
  }
}

export async function createReviewComment(
  params: z.infer<typeof CreateReviewCommentSchema>,
) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    
    // 1. Fetch the MR to get the diff_refs (base_sha, start_sha, head_sha)
    const mrData = await gitlab.get<any>(
      `/projects/${projectId}/merge_requests/${params.merge_request_iid}`
    );

    if (!mrData.diff_refs) {
      throw new Error("Could not retrieve diff_refs for this Merge Request. Is there a valid diff?");
    }

    // 2. Fetch the changes to map the file path correctly (handling renames if necessary, though we assume new_path matches for simplicity here)
    const changesData = await gitlab.get<any>(
      `/projects/${projectId}/merge_requests/${params.merge_request_iid}/changes`
    );
    
    const fileChange = changesData.changes.find((c: any) => c.new_path === params.file_path || c.old_path === params.file_path);
    
    if (!fileChange) {
      throw new Error(`File '${params.file_path}' not found in the merge request changes.`);
    }

    // 3. Post the comment using the fetched SHAs
    await gitlab.post(
      `/projects/${projectId}/merge_requests/${params.merge_request_iid}/discussions`,
      {
        body: params.body,
        position: {
          base_sha: mrData.diff_refs.base_sha,
          start_sha: mrData.diff_refs.start_sha || mrData.diff_refs.base_sha,
          head_sha: mrData.diff_refs.head_sha,
          position_type: "text",
          old_path: fileChange.old_path,
          new_path: fileChange.new_path,
          new_line: params.line // Assuming commenting on the new version of the code
        },
      },
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Review comment created successfully on ${params.file_path} at line ${params.line}.`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: handleApiError(error, "create_review_comment"),
        },
      ],
    };
  }
}
