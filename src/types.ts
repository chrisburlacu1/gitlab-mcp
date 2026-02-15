export interface GitLabUser {
  id: number;
  username: string;
  name: string;
  state: string;
  avatar_url: string;
  web_url: string;
}

export interface GitLabProject {
  id: number;
  description: string;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  created_at: string;
  default_branch: string;
  web_url: string;
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  star_count: number;
  forks_count: number;
  last_activity_at: string;
}

export interface GitLabIssue {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  labels: string[];
  assignees: GitLabUser[];
  author: GitLabUser;
  web_url: string;
  references: {
    short: string;
    relative: string;
    full: string;
  };
}

export interface GitLabMergeRequest {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  target_branch: string;
  source_branch: string;
  author: GitLabUser;
  assignees: GitLabUser[];
  reviewers: GitLabUser[];
  web_url: string;
  has_conflicts: boolean;
  blocking_discussions_resolved: boolean;
}

export interface GitLabNote {
  id: number;
  body: string;
  author: GitLabUser;
  created_at: string;
  updated_at: string;
  system: boolean;
  noteable_id: number;
  noteable_type: string;
  noteable_iid: number;
}
