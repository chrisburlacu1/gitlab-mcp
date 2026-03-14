import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
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
    const mrData = await gitlab.post<GitLabMergeRequest>(
      `/projects/${params.project_id}/merge_requests`,
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
    const mrsData = await gitlab.get<GitLabMergeRequest[]>(
      `/projects/${params.project_id}/merge_requests`,
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
    const mrData = await gitlab.put<GitLabMergeRequest>(
      `/projects/${params.project_id}/merge_requests/${params.merge_request_iid}`,
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
    const changesData = await gitlab.get<any>(
      `/projects/${params.project_id}/merge_requests/${params.merge_request_iid}/changes`,
    );

    const changes = changesData.changes || [];
    const formattedChanges = changes
      .map((change: any) => `File: ${change.new_path}\nDiff:\n${change.diff}`)
      .join("\n\n");

    return {
      content: [
        {
          type: "text" as const,
          text: formattedChanges || "No changes found.",
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
    await gitlab.post(
      `/projects/${params.project_id}/merge_requests/${params.merge_request_iid}/discussions`,
      {
        body: params.body,
        position: {
          base_sha: params.base_sha,
          start_sha: params.start_sha,
          head_sha: params.head_sha,
          position_type: "text",
          old_path: params.old_path,
          new_path: params.new_path,
          old_line: params.old_line,
          new_line: params.new_line,
        },
      },
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Review comment created successfully.`,
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
