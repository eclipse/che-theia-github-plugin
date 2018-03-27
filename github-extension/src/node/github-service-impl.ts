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
import { GithubService, SshKeyPair, SshKeyServer } from '../common/github-service';
import { Repository, Credentials, User, PullRequest, Organization, Collaborator } from '../common/github-model';

var GitHubApi = require('github');

@injectable()
export class GithubServiceImpl implements GithubService {

    constructor(@inject(SshKeyServer) protected readonly sshKeyServer: SshKeyServer) { }

    getRepository(credentials: Credentials, owner: string, repository: string): Promise<Repository> {
        return this.getConnection(credentials).repos.get({ owner: owner, repo: repository }).then((result: any) => {
            return new Promise<Repository>(resolve => { resolve(result.data) })
        });
    }

    getUserRepositories(credentials: Credentials, user: string, pageNumber = 0, pageSize = 0): Promise<Repository[]> {
        return this.getConnection(credentials).repos.getForUser({ username: user, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize }).then((result: any) => {
            return new Promise<Repository[]>(resolve => { resolve(result.data) })
        });
    }

    getOrganizationRepositories(credentials: Credentials, organization: string, pageNumber = 0, pageSize = 0): Promise<Repository[]> {
        return this.getConnection(credentials).repos.getForOrg({ org: organization, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize }).then((result: any) => {
            return new Promise<Repository[]>(resolve => { resolve(result.data) })
        });
    }

    getAllRepositories(credentials: Credentials, pageNumber = 0, pageSize = 0): Promise<Repository[]> {
        return this.getConnection(credentials).repos.getAll({ page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize }).then((result: any) => {
            return new Promise<Repository[]>(resolve => { resolve(result.data) })
        });
    }

    getForks(credentials: Credentials, owner: string, repository: string, pageNumber = 0, pageSize = 0): Promise<Repository[]> {
        return this.getConnection(credentials).repos.getForks({ owner, repository, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize }).then((result: any) => {
            return new Promise<Repository[]>(resolve => { resolve(result.data) })
        });
    }

    createFork(credentials: Credentials, owner: string, repository: string): Promise<void> {
        return this.getConnection(credentials).repos.fork({ owner, repository }).then((result: any) => {
            return new Promise<void>(resolve => { resolve(result.data) })
        });
    }

    commentIssue(credentials: Credentials, owner: string, repository: string, id: number, comment: string): Promise<void> {
        return this.getConnection(credentials)
            .issues.createComment({ owner: owner, repo: repository, number: id, body: comment }).then((result: any) => {
                return new Promise<void>(resolve => { resolve(result.data) })
            });
    }

    getPullRequest(credentials: Credentials, owner: string, repository: string, id: number): Promise<PullRequest> {
        return this.getConnection(credentials)
            .pullRequests.get({ owner: owner, repo: repository, number: id }).then((result: any) => {
                return new Promise<PullRequest>(resolve => { resolve(result.data) })
            });
    }

    getPullRequests(credentials: Credentials, owner: string, repository: string, pageNumber = 0, pageSize = 0): Promise<PullRequest[]> {
        return this.getConnection(credentials)
            .pullRequests.getAll({ owner: owner, repo: repository, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize }).then((result: any) => {
                return new Promise<PullRequest[]>(resolve => { resolve(result.data) })
            });
    }

    createPullRequest(credentials: Credentials, owner: string, repository: string, head: string, base: string, title: string): Promise<void> {
        return this.getConnection(credentials)
            .pullRequests.create({ owner: owner, repo: repository, head: head, base: base, title: title }).then((result: any) => {
                return new Promise<void>(resolve => { resolve(result.data) })
            });
    }

    updatePullRequest(credentials: Credentials, owner: string, repository: string, id: string, pullRequest: PullRequest): Promise<void> {
        return this.getConnection(credentials).pullRequests.update({ owner: owner, repo: repository, number: id, title: pullRequest.title, body: pullRequest.body, state: pullRequest.state, base: pullRequest.base }).then((result: any) => {
            return new Promise<void>(resolve => { resolve(result.data) })
        });
    }

    getOrganizations(credentials: Credentials, pageNumber = 0, pageSize = 0): Promise<Organization[]> {
        return this.getConnection(credentials).orgs.getAll({ page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize }).then((result: any) => {
            return new Promise<Organization[]>(resolve => { resolve(result.data) })
        });
    }

    getCurrentUser(credentials: Credentials): Promise<User> {
        return this.getConnection(credentials).users.get().then((result: any) => {
            return new Promise<User>(resolve => { resolve(result.data) })
        });
    }

    getCollaborators(credentials: Credentials, owner: string, repository: string, pageNumber = 0, pageSize = 0): Promise<Collaborator[]> {
        return this.getConnection(credentials).repos.getCollaborators({ owner: owner, repo: repository, page: pageNumber > 0 ? pageNumber : 0, per_page: pageSize }).then((result: any) => {
            return new Promise<Collaborator[]>(resolve => { resolve(result.data) })
        });
    }

    uploadSshKey(credentials: Credentials, title: string): Promise<void> {
        const service: string = 'vcs';
        const host: string = 'github.com';

        return this.sshKeyServer.get(service, host).then((SshKeyPair: SshKeyPair) => {
            if (SshKeyPair.publicKey = undefined) {
                return this.sshKeyServer.generate(service, host).then((SshKeyPair: SshKeyPair) => {
                    return this.getConnection(credentials).users.createKey({ title: title, key: SshKeyPair.publicKey });
                });
            } else {
                return this.getConnection(credentials).users.createKey({ title: title, key: SshKeyPair.publicKey });
            }
        });
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
