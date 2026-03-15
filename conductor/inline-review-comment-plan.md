# [COMPLETED] Plan: Add Inline Review Comment Tool

## Objective
Add a new tool `gitlab_create_review_comment` to allow LLMs to make inline code comments on specific lines within a merge request, grouped logically with the merge request tools.

## Key Files & Context
- `src/schemas/merge-requests.ts`: Schema definitions for MR operations.
- `src/tools/merge-requests.ts`: Implementation of MR tools.
- `src/index.ts`: Tool registration.

## Implementation Steps

### 1. Update `src/schemas/merge-requests.ts`
Create a new Zod schema `CreateReviewCommentSchema` that requires the necessary parameters for an inline discussion:
- `project_id` (number)
- `merge_request_iid` (number)
- `body` (string)
- `base_sha` (string)
- `start_sha` (string)
- `head_sha` (string)
- `old_path` (string, optional)
- `new_path` (string, optional)
- `old_line` (number, optional)
- `new_line` (number, optional)

### 2. Update `src/tools/merge-requests.ts`
Implement the `createReviewComment` function.
- It will make a `POST` request to `/projects/:id/merge_requests/:iid/discussions`.
- Construct the `position` object from the provided SHAs, paths, and line numbers. Set `position_type: "text"`.

### 3. Update `src/index.ts`
- Import `CreateReviewCommentSchema` and `createReviewComment`.
- Register the new tool `gitlab_create_review_comment` with the server under the "Merge Requests" category.

## Verification & Testing
- Compile the TypeScript code (`npm run build`) to ensure there are no type errors.
- Ensure the tool is correctly registered.