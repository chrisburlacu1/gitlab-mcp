import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { GetFileContentsSchema } from "../schemas/repository.js";

export async function getFileContents(
  params: z.infer<typeof GetFileContentsSchema>,
) {
  try {
    const encodedPath = encodeURIComponent(params.file_path);
    const fileData = await gitlab.get<string>(
      `/projects/${params.project_id}/repository/files/${encodedPath}/raw`,
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
