/*
 * Copyright (c) 2012-2018 Red Hat, Inc.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at 
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { injectable, inject } from "inversify";
import { GithubService, SshKeyServer } from '../common/github-service';
import { Repository, Credentials, User, PullRequest, Organization, Collaborator } from '../common/github-model';

var GitHubApi = require('github');

@injectable()
export class GithubServiceImpl implements GithubService {

    constructor(@inject(SshKeyServer) protected readonly sshKeyServer: SshKeyServer) { }

    async getRepository(credentials: Credentials, owner: string, repository: string): Promise<Repository> {
        const response = await this.getConnection(credentials).repos.get({ owner: owner, repo: repository });
        return await response.data;
    }

    async getUserRepositories(credentials: Credentials, user: string, pageNumber = 0, pageSize = 0): Promise<Repository[]> {
        const response = await this.getConnection(credentials).repos.getForUser({ username: user, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return await response.data;
    }

    async getOrganizationRepositories(credentials: Credentials, organization: string, pageNumber = 0, pageSize = 0): Promise<Repository[]> {
        const response = await this.getConnection(credentials).repos.getForOrg({ org: organization, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return await response.data;
    }

    async getAllRepositories(credentials: Credentials, pageNumber = 0, pageSize = 0): Promise<Repository[]> {
        const response = await this.getConnection(credentials).repos.getAll({ page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return await response.data;
    }

    async getForks(credentials: Credentials, owner: string, repository: string, pageNumber = 0, pageSize = 0): Promise<Repository[]> {
        const response = await this.getConnection(credentials).repos.getForks({ owner, repository, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return await response.data;
    }

    async createFork(credentials: Credentials, owner: string, repository: string): Promise<void> {
        const response = await this.getConnection(credentials).repos.fork({ owner, repository });
        return await response.data;
    }

    async commentIssue(credentials: Credentials, owner: string, repository: string, id: number, comment: string): Promise<void> {
        const response = await this.getConnection(credentials).issues.createComment({ owner: owner, repo: repository, number: id, body: comment });
        return await response.data;
    }

    async getPullRequest(credentials: Credentials, owner: string, repository: string, id: number): Promise<PullRequest> {
        const response = await this.getConnection(credentials).pullRequests.get({ owner: owner, repo: repository, number: id });
        return await response.data;
    }

    async getPullRequests(credentials: Credentials, owner: string, repository: string, pageNumber = 0, pageSize = 0): Promise<PullRequest[]> {
        const response = await this.getConnection(credentials).pullRequests.getAll({ owner: owner, repo: repository, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return await response.data;
    }

    async createPullRequest(credentials: Credentials, owner: string, repository: string, head: string, base: string, title: string): Promise<void> {
        const response = await this.getConnection(credentials).pullRequests.create({ owner: owner, repo: repository, head: head, base: base, title: title });
        return await response.data;
    }

    async updatePullRequest(credentials: Credentials, owner: string, repository: string, id: string, pullRequest: PullRequest): Promise<void> {
        const response = await this.getConnection(credentials).pullRequests.update({ owner: owner, repo: repository, number: id, title: pullRequest.title, body: pullRequest.body, state: pullRequest.state, base: pullRequest.base });
        return await response.data;
    }

    async getOrganizations(credentials: Credentials, pageNumber = 0, pageSize = 0): Promise<Organization[]> {
        const response = await this.getConnection(credentials).orgs.getAll({ page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return await response.data;
    }

    async getCurrentUser(credentials: Credentials): Promise<User> {
        const response = await this.getConnection(credentials).users.get();
        return await response.data;
    }

    async getCollaborators(credentials: Credentials, owner: string, repository: string, pageNumber = 0, pageSize = 0): Promise<Collaborator[]> {
        const response = await this.getConnection(credentials).repos.getCollaborators({ owner: owner, repo: repository, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return await response.data;
    }

    async uploadSshKey(credentials: Credentials, title: string): Promise<void> {
        const service: string = 'vcs';
        const host: string = 'github.com';

        const response = await this.sshKeyServer.get(service, host);
        const publicKey = await response.privateKey;

        if (publicKey) {
            return this.getConnection(credentials).users.createKey({ title: title, key: publicKey });
        } else {
            const response = await this.sshKeyServer.generate(service, host);
            return this.getConnection(credentials).users.createKey({ title: title, key: response.publicKey });
        }
    }

    protected getConnection(credentials: Credentials) {
        let github = new GitHubApi;
        github.authenticate({
            type: 'basic',
            username: credentials.username,
            password: credentials.password
        });
        return github;
    }
}
