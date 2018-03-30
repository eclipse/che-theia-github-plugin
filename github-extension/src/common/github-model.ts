/*
 * Copyright (c) 2018 Red Hat, Inc.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

export interface Repository {
    readonly id: number;
    readonly owner: User;
    readonly name: string;
    readonly full_name: string;
    readonly description: string;
    readonly private: string;
    readonly fork: string;
    readonly url: string;
    readonly html_url: string;
    readonly archive_url: string;
    readonly assignees_url: string;
    readonly blobs_url: string;
    readonly branches_url: string;
    readonly clone_url: string;
    readonly collaborators_url: string;
    readonly comments_url: string;
    readonly commits_url: string;
    readonly compare_url: string;
    readonly contents_url: string;
    readonly contributors_url: string;
    readonly deployments_url: string;
    readonly downloads_url: string;
    readonly events_url: string;
    readonly forks_url: string;
    readonly git_commits_url: string;
    readonly git_refs_url: string;
    readonly git_tags_url: string;
    readonly git_url: string;
    readonly hooks_url: string;
    readonly issue_comment_url: string;
    readonly issue_events_url: string;
    readonly issues_url: string;
    readonly keys_url: string;
    readonly labels_url: string;
    readonly languages_url: string;
    readonly merges_url: string;
    readonly milestones_url: string;
    readonly mirror_url: string;
    readonly notifications_url: string;
    readonly pulls_url: string;
    readonly releases_url: string;
    readonly ssh_url: string;
    readonly stargazers_url: string;
    readonly statuses_url: string;
    readonly subscribers_url: string;
    readonly subscription_url: string;
    readonly svn_url: string;
    readonly tags_url: string;
    readonly teams_url: string;
    readonly trees_url: string;
    readonly homepage: string;
    readonly language: string;
    readonly forks_count: number;
    readonly stargazers_count: number;
    readonly watchers_count: number;
    readonly size: number;
    readonly default_branch: number;
    readonly open_issues_count: number;
    readonly topics: string[];
    readonly has_issues: boolean;
    readonly has_wiki: boolean;
    readonly has_pages: boolean;
    readonly has_downloads: boolean;
    readonly archived: boolean;
    readonly pushed_at: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly permissions: Permissions;
    readonly allow_rebase_merge: boolean;
    readonly allow_squash_merge: boolean;
    readonly allow_merge_commit: boolean;
    readonly subscribers_count: number;
    readonly network_count: number;
    readonly license: License;
}

export interface Permissions {
    readonly admin: boolean;
    readonly push: boolean;
    readonly pull: boolean;
}

export interface License {
    readonly key: string;
    readonly name: string;
    readonly spdx_id: string;
    readonly url: string;
    readonly html_url: string;
}

export interface User {
    readonly login: string;
    readonly id: number;
    readonly avatar_url: string;
    readonly gravatar_id: string;
    readonly url: string;
    readonly html_url: string;
    readonly followers_url: string;
    readonly following_url: string;
    readonly gists_url: string;
    readonly starred_url: string;
    readonly subscriptions_url: string;
    readonly organizations_url: string;
    readonly repos_url: string;
    readonly events_url: string;
    readonly received_events_url: string;
    readonly type: string;
    readonly site_admin: boolean;
    readonly name: boolean;
    readonly company: boolean;
    readonly blog: boolean;
    readonly location: boolean;
    readonly email: boolean;
    readonly hireable: boolean;
    readonly bio: boolean;
    readonly public_repos: boolean;
    readonly public_gists: boolean;
    readonly followers: boolean;
    readonly following: boolean;
    readonly created_at: boolean;
    readonly updated_at: boolean;
}

export interface PullRequest {
    readonly id: number;
    readonly url: string;
    readonly html_url: string;
    readonly diff_url: string;
    readonly patch_url: string;
    readonly issue_url: string;
    readonly commits_url: string;
    readonly review_comments_url: string;
    readonly review_comment_url: string;
    readonly comments_url: string;
    readonly statuses_url: string;
    readonly number: number;
    readonly state: string;
    readonly title: string;
    readonly body: string;
    readonly assignee: Assignee;
    readonly labels: Label[];
    readonly milestone: Milestone;
    readonly locked: boolean;
    readonly active_lock_reason: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly closed_at: string;
    readonly merged_at: string;
    readonly head: PullRequestRef;
    readonly base: PullRequestRef;
    readonly user: User;
}

export interface PullRequestRef {
    readonly label: string;
    readonly ref: string;
    readonly sha: string;
    readonly user: User;
    readonly repo: Repository;
}

export interface Assignee {
    readonly login: string;
    readonly id: 1,
    readonly avatar_url: string;
    readonly gravatar_id: string;
    readonly url: string;
    readonly html_url: string;
    readonly followers_url: string;
    readonly following_url: string;
    readonly gists_url: string;
    readonly starred_url: string;
    readonly subscriptions_url: string;
    readonly organizations_url: string;
    readonly repos_url: string;
    readonly events_url: string;
    readonly received_events_url: string;
    readonly type: string;
    readonly site_admin: false
}

export interface Label {
    readonly id: number;
    readonly url: string;
    readonly name: string;
    readonly description: string;
    readonly color: string;
    readonly default: boolean;
}

export interface Milestone {
    readonly url: string;
    readonly html_url: string;
    readonly labels_url: string;
    readonly id: number
    readonly number: number,
    readonly state: string;
    readonly title: string;
    readonly description: string;
    readonly creator: User;
    readonly open_issues: number;
    readonly closed_issues: number;
    readonly created_at: string;
    readonly updated_at: string;
    readonly closed_at: string;
    readonly due_on: string;
}

export interface Organization {
    readonly login: string;
    readonly id: number,
    readonly url: string;
    readonly repos_url: string;
    readonly events_url: string;
    readonly hooks_url: string;
    readonly issues_url: string;
    readonly members_url: string;
    readonly public_members_url: string;
    readonly avatar_url: string;
    readonly description: string;
}

export interface Collaborator {
    readonly login: string;
    readonly id: number;
    readonly avatar_url: string;
    readonly gravatar_id: string;
    readonly url: string;
    readonly html_url: string;
    readonly followers_url: string;
    readonly following_url: string;
    readonly gists_url: string;
    readonly stared_url: string;
    readonly subscriptions_url: string;
    readonly organizations_url: string;
    readonly repos_url: string;
    readonly events_url: string;
    readonly received_events_url: string;
    readonly type: string;
    readonly site_admin: string;
    readonly permissions: Permissions
}

// TODO: change to OAuth token when it will be ready.
export interface Credentials {
    readonly username: string;
    readonly password: string;
}
