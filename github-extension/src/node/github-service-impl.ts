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

import { injectable, inject } from "inversify";
import { GithubService, SshKeyServer } from '../common/github-service';
import {
    Repository,
    User,
    PullRequest,
    Organization,
    Collaborator,
    Properties
} from '../common/github-model';

const octokit = require('@octokit/rest');

@injectable()
export class GithubServiceImpl implements GithubService {

    constructor(@inject(SshKeyServer) protected readonly sshKeyServer: SshKeyServer) { }

    async getRepository(owner: string, repository: string, properties?: Properties): Promise<Repository> {
        const response = await GithubServiceImpl.getConnection(properties).repos.get({ owner: owner, repo: repository });
        return response.data;
    }

    async getUserRepositories(user: string, pageNumber = 0, pageSize = 0, properties?: Properties): Promise<Repository[]> {
        const response = await GithubServiceImpl.getConnection(properties).repos.getForUser({ username: user, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return response.data;
    }

    async getOrganizationRepositories(organization: string, pageNumber = 0, pageSize = 0, properties?: Properties): Promise<Repository[]> {
        const response = await GithubServiceImpl.getConnection(properties).repos.getForOrg({ org: organization, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return response.data;
    }

    async getAllRepositories(pageNumber = 0, pageSize = 0, properties?: Properties): Promise<Repository[]> {
        const response = await GithubServiceImpl.getConnection(properties).repos.getAll({ page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return response.data;
    }

    async getForks(owner: string, repository: string, pageNumber = 0, pageSize = 0, properties?: Properties): Promise<Repository[]> {
        const response = await GithubServiceImpl.getConnection(properties).repos.getForks({ owner, repository, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return response.data;
    }

    async createFork(owner: string, repository: string, properties?: Properties): Promise<void> {
        const response = await GithubServiceImpl.getConnection(properties).repos.fork({ owner, repository });
        return response.data;
    }

    async commentIssue(owner: string, repository: string, id: number, comment: string, properties?: Properties): Promise<void> {
        const response = await GithubServiceImpl.getConnection(properties).issues.createComment({ owner: owner, repo: repository, number: id, body: comment });
        return response.data;
    }

    async getPullRequest(owner: string, repository: string, id: number, properties?: Properties): Promise<PullRequest> {
        const response = await GithubServiceImpl.getConnection(properties).pullRequests.get({ owner: owner, repo: repository, number: id });
        return response.data;
    }

    async getPullRequests(owner: string, repository: string, pageNumber = 0, pageSize = 0, properties?: Properties): Promise<PullRequest[]> {
        const response = await GithubServiceImpl.getConnection(properties).pullRequests.getAll({ owner: owner, repo: repository, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return response.data;
    }

    async createPullRequest(owner: string, repository: string, head: string, base: string, title: string, properties?: Properties): Promise<void> {
        const response = await GithubServiceImpl.getConnection(properties).pullRequests.create({ owner: owner, repo: repository, head: head, base: base, title: title });
        return response.data;
    }

    async updatePullRequest(owner: string, repository: string, id: string, pullRequest: PullRequest, properties?: Properties): Promise<void> {
        const response = await GithubServiceImpl.getConnection(properties).pullRequests.update({ owner: owner, repo: repository, number: id, title: pullRequest.title, body: pullRequest.body, state: pullRequest.state, base: pullRequest.base });
        return response.data;
    }

    async getOrganizations(pageNumber = 0, pageSize = 0, properties?: Properties): Promise<Organization[]> {
        const response = await GithubServiceImpl.getConnection(properties).orgs.getAll({ page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return response.data;
    }

    async getCurrentUser(properties?: Properties): Promise<User> {
        const response = await GithubServiceImpl.getConnection(properties).users.get();
        return response.data;
    }

    async getCollaborators(owner: string, repository: string, pageNumber = 0, pageSize = 0, properties?: Properties): Promise<Collaborator[]> {
        const response = await GithubServiceImpl.getConnection(properties).repos.getCollaborators({ owner: owner, repo: repository, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize });
        return response.data;
    }

    async uploadSshKey(title: string, properties?: Properties): Promise<void> {
        const service: string = 'vcs';
        const host: string = 'github.com';

        const response = await this.sshKeyServer.get(service, host);
        const publicKey = await response.privateKey;

        if (publicKey) {
            return GithubServiceImpl.getConnection(properties).users.createKey({ title: title, key: publicKey });
        } else {
            const response = await this.sshKeyServer.generate(service, host);
            return GithubServiceImpl.getConnection(properties).users.createKey({ title: title, key: response.publicKey });
        }
    }

    protected static getConnection(properties?: Properties) {
        if (properties) {
            const instance = new octokit({
                debug: true
            });
            instance.authenticate(properties.credentials);
            return instance;
        } else {
            return new octokit({});
        }
    }
}
