// GitHub API 相关类型定义

// GitHub 用户类型
export interface GitHubApiUser {
  id: number;
  login: string;
  avatar_url: string;
  name?: string;
  email?: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// GitHub 仓库类型
export interface GitHubApiRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  default_branch: string;
  language?: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  owner: GitHubApiUser;
}

// GitHub 提交类型
export interface GitHubApiCommit {
  sha: string;
  url: string;
  html_url: string;
  author: GitHubApiUser;
  committer: GitHubApiUser;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    verification: {
      verified: boolean;
      reason: string;
      signature?: string;
      payload?: string;
    };
  };
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  files?: GitHubApiFile[];
}

// GitHub 文件类型
export interface GitHubApiFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
  previous_filename?: string;
}

// GitHub Pull Request 类型
export interface GitHubApiPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  html_url: string;
  state: 'open' | 'closed';
  merged: boolean;
  merged_at?: string;
  user: GitHubApiUser;
  assignee?: GitHubApiUser;
  assignees: GitHubApiUser[];
  requested_reviewers: GitHubApiUser[];
  head: {
    ref: string;
    sha: string;
    repo: GitHubApiRepository;
  };
  base: {
    ref: string;
    sha: string;
    repo: GitHubApiRepository;
  };
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  created_at: string;
  updated_at: string;
}

// GitHub Issue 类型
export interface GitHubApiIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  html_url: string;
  state: 'open' | 'closed';
  user: GitHubApiUser;
  assignee?: GitHubApiUser;
  assignees: GitHubApiUser[];
  labels: GitHubApiLabel[];
  milestone?: GitHubApiMilestone;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

// GitHub 标签类型
export interface GitHubApiLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

// GitHub 里程碑类型
export interface GitHubApiMilestone {
  id: number;
  number: number;
  title: string;
  description?: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  due_on?: string;
  closed_at?: string;
}

// GitHub 贡献者类型
export interface GitHubApiContributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: 'User' | 'Bot';
}

// GitHub Push 事件载荷类型
export interface GitHubPushPayload {
  ref: string;
  before: string;
  after: string;
  repository: GitHubApiRepository;
  pusher: {
    name: string;
    email: string;
  };
  sender: GitHubApiUser;
  commits: Array<{
    id: string;
    tree_id: string;
    distinct: boolean;
    message: string;
    timestamp: string;
    url: string;
    author: {
      name: string;
      email: string;
      username: string;
    };
    committer: {
      name: string;
      email: string;
      username: string;
    };
    added: string[];
    removed: string[];
    modified: string[];
  }>;
  head_commit: {
    id: string;
    tree_id: string;
    distinct: boolean;
    message: string;
    timestamp: string;
    url: string;
    author: {
      name: string;
      email: string;
      username: string;
    };
    committer: {
      name: string;
      email: string;
      username: string;
    };
    added: string[];
    removed: string[];
    modified: string[];
  };
}

// GitHub Pull Request 事件载荷类型
export interface GitHubPullRequestPayload {
  action: 'opened' | 'closed' | 'reopened' | 'synchronize' | 'edited' | 'assigned' | 'unassigned' | 'review_requested' | 'review_request_removed' | 'labeled' | 'unlabeled';
  number: number;
  pull_request: GitHubApiPullRequest;
  repository: GitHubApiRepository;
  sender: GitHubApiUser;
}
