# GitLab MCP Server

A Model Context Protocol (MCP) server that provides a comprehensive interface for interacting with GitLab. It enables LLMs to search projects, manage issues and merge requests, add comments, and read file contents from GitLab repositories.

## Project Overview

- **Purpose:** Bridges the gap between LLMs and GitLab's rich feature set using the Model Context Protocol.
- **Main Technologies:** TypeScript, Node.js, `@modelcontextprotocol/sdk`, Axios, Zod, Dotenv.
- **Architecture:**
  - `src/index.ts`: The entry point that initializes the MCP server and registers all tools.
  - `src/tools/`: Contains the implementation logic for each GitLab interaction category (Issues, MRs, Projects, Notes, Repository).
  - `src/schemas/`: Defines the Zod input schemas for each tool, ensuring strict type safety and clear documentation for the LLM.
  - `src/services/`: Contains the GitLab API client (`gitlab.ts`) configured with Axios and centralized error handling.
  - `src/types.ts`: Shared TypeScript interfaces for GitLab API responses.

## Key Capabilities

- **Projects:** Search for projects and retrieve detailed project metadata.
- **Issues:** List, filter, and create issues within specific projects.
- **Merge Requests:** List MRs, create new ones, update existing ones, and retrieve diff changes.
- **Notes:** Add comments to issues or merge requests.
- **Repository:** Fetch raw file contents from any branch or tag.

## Building and Running

### Environment Setup
Create a `.env` file based on `.env.example` with the following:
- `GITLAB_PERSONAL_ACCESS_TOKEN`: Your GitLab PAT (requires `api` scope).
- `GITLAB_API_URL`: (Optional) Defaults to `https://gitlab.com/api/v4`.

### Commands
- **Install Dependencies:** `npm install`
- **Build Project:** `npm run build` (Compiles TypeScript to `dist/`)
- **Run Server (Stdio):** `npm start` (Runs `node dist/index.js`)
- **Development Mode:** `npm run dev` (Uses `tsx watch` for auto-reloading)
- **Clean Build:** `npm run clean` (Removes `dist/` directory)

## Development Conventions

- **Tool Registration:** All tools are registered in `src/index.ts` with descriptive titles, input schemas, and operational annotations (e.g., `readOnlyHint`).
- **Input Validation:** Every tool uses a Zod schema defined in `src/schemas/` to validate incoming arguments.
- **API Interaction:** All external calls should use the central `gitlab` Axios instance in `src/services/gitlab.ts`.
- **Error Handling:** Use the `handleApiError` utility to provide standardized and informative error messages to the LLM.
- **Naming:** Follow the `gitlab_<action>_<entity>` pattern for tool names for consistency.
- **Keep-Alive:** The server uses an HTTPS agent with `keepAlive: true` and a connection pool (`maxSockets: 20`) to optimize high-frequency API requests.
