# Goal-Oriented Manual Test Prompts

These prompts are designed to test the **Agentic IQ** of an LLM equipped with the GitLab MCP Server. Instead of telling the agent which tools to use, these prompts describe a high-level goal, forcing the agent to interpret the best tool chain.

## 1. The "Broken Build" Test
**Prompt:**
> "Fix the build error on my branch `feature/new-ui` in the news service project."

**Expected Behavior:**
1.  **Resolve Project:** Find the 'news service' project (using search or alias).
2.  **Find Pipeline:** Call `gitlab_list_pipelines` for that branch.
3.  **Identify Job:** Call `gitlab_get_pipeline_jobs` for the failed pipeline.
4.  **Read Log:** Call `gitlab_get_job_log` for the specific failed job.
5.  **Investigate:** Based on the log and the "ANALYSIS REQUIRED" instructions, call `gitlab_get_file_contents` to read the offending code.
6.  **Resolve:** Propose or apply a fix.

---

## 2. The "Knowledge Gap" Test
**Prompt:**
> "How do we handle database migrations in this organization? I want to see an example of a recent migration file."

**Expected Behavior:**
1.  **Global Search:** Call `gitlab_search_code` (global) for terms like "migration", "migrate", or ".sql".
2.  **Select Example:** Identify a project that has clear migration patterns.
3.  **Read Content:** Call `gitlab_get_file_contents` to read an example file.
4.  **Explain:** Provide a summary of the organizational pattern discovered.

---

## 3. The "Onboarding" Test
**Prompt:**
> "I'm new here. Can you give me a technical overview of the `ollama-widget` repository? I want to know the tech stack and what the team has been working on lately."

**Expected Behavior:**
1.  **Project Metadata:** Call `gitlab_get_project` to see basic info and recent activity (Issues/MRs).
2.  **Explore Structure:** Call `gitlab_get_repository_tree` to understand the folder layout.
3.  **Identify Stack:** Read `package.json`, `Dockerfile`, or similar manifest files using `gitlab_get_file_contents`.
4.  **Synthesize:** Combine the structural, metadata, and activity data into a coherent onboarding report.

---

## 4. The "Audit" Test
**Prompt:**
> "Check if we have any open security issues across our projects that mention 'expired tokens' and let me know which project is most affected."

**Expected Behavior:**
1.  **Global Search:** Use `gitlab_search_code` (global) or potentially project search if looking for issue descriptions.
2.  **Filter Issues:** Call `gitlab_list_issues` across suspected projects or use a broad search term.
3.  **Aggregate:** Count the occurrences and provide a ranked list.

---

## 5. The "Code Review" Test
**Prompt:**
> "There's a merge request from `@john_doe` that I need to review. Can you summarize what he's trying to do and tell me if it looks safe to merge?"

**Expected Behavior:**
1.  **Find Author:** Resolve `@john_doe` to an MR list.
2.  **Read MR:** Call `gitlab_list_merge_requests` to find the specific MR.
3.  **Inspect Diff:** Call `gitlab_get_merge_request_changes`.
4.  **Evaluate:** Look for logical errors or security risks and provide a summary.

---

## 6. The "Refactor" Test
**Prompt:**
> "We need to rename the `user_auth` table to `account_auth`. Find every place in the `core-api` project that might be affected by this database change."

**Expected Behavior:**
1.  **Scoped Search:** Call `gitlab_search_code` specifically for the `core-api` project.
2.  **Query Pattern:** Search for strings matching the table name.
3.  **Report:** List every file and line number where the table is referenced.

---

## 7. The "Persistence & Alias" Test
**Prompt:**
> "From now on, every time I mention 'the core', I'm talking about the `project-alpha-v2-final` repository. Make sure you remember that for next time, and then show me the latest pipeline for 'the core'."

**Expected Behavior:**
1.  **Set Alias:** Call `gitlab_set_project_alias` with `alias="the core"` and `project_id="project-alpha-v2-final"`.
2.  **Verify Resolution:** Immediately use the new alias `the core` to call `gitlab_list_pipelines`.
3.  **Confirm:** Tell the user the alias is saved and provide the pipeline status.
