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

import { Repository, Collaborator, User, Credentials, PullRequest, Organization } from "./github-model";

export const githubKeyServicePath = '/services/github';
export const GithubService = Symbol("GithubService");

/**
 * Representation of JSON-RPC service for GitHub communication.
 */
export interface GithubService {

    /**
     * Get specified repository.
     * 
     * @param {string} owner Owner of the repository.
     * @param {string} repository Name of the repository.
     */
    getRepository(credentials: Credentials, owner: string, repository: string): Promise<Repository>;

    /**
     * Get repositories owned by a user.
     * 
     * @param {string} user Owner of the repository.
     * @param {number} [pageNumber=0] Number of the page (optional, 0 by default).
     * @param {number} [pageSize=0] Size of the page (optional, 0 by default).
     */
    getUserRepositories(credentials: Credentials, user: string, pageNumber?: number, pageSize?: number): Promise<Repository[]>;

    /**
     * Get repositories owned by an organization.
     * 
     * @param {string} organization Organization witch repository belongs to.
     * @param {number} [pageNumber=0] Number of the page (optional, 0 by default).
     * @param {number} [pageSize=0] Size of the page (optional, 0 by default).
     */
    getOrganizationRepositories(credentials: Credentials, organization: string, pageNumber: number, pageSize: number): Promise<Repository[]>;

    /**
     * Get all repositories from logged in user.
     * 
     * @param {number} [pageNumber=0] Number of the page (optional, 0 by default).
     * @param {number} [pageSize=0] Size of the page (optional, 0 by default).
     */
    getAllRepositories(credentials: Credentials, pageNumber: number, pageSize: number): Promise<Repository[]>;

    /**
     * Get Forks of the repository.
     * 
     * @param {string} owner Owner of the repository.
     * @param {string} repository Name of the repository.
     * @param {number} [pageNumber=0] Number of the page (optional, 0 by default).
     * @param {number} [pageSize=0] Size of the page (optional, 0 by default).
     */
    getForks(credentials: Credentials, owner: string, repository: string, pageNumber: number, pageSize: number): Promise<Repository[]>;

    /**
     * Create fork of the repository.
     * 
     * @param {string} owner Owner of the repository.
     * @param {string} repository Name of the repository.
     */
    createFork(credentials: Credentials, owner: string, repository: string): Promise<void>;

    /**
     * Comment issue of the repository.
     * 
     * @param {string} owner Owner of the repository.
     * @param {string} repository Name of the repository.
     * @param {number} id Id of the issue.
     * @param {string} comment Comment.
     */
    commentIssue(credentials: Credentials, owner: string, repository: string, id: number, comment: string): Promise<void>;

    /**
     * Get specified pull-request of the repository.
     * 
     * @param {string} owner Owner of the repository.
     * @param {string} repository Name of the repository.
     * @param {number} id Id of the pull-request.
     */
    getPullRequest(credentials: Credentials, owner: string, repository: string, id: number): Promise<PullRequest>;

    /**
     * Get pull-requests of the repository.
     * 
     * @param {string} owner Owner of the repository.
     * @param {string} repository Name of the repository.
     * @param {number} [pageNumber=0] Number of the page (optional, 0 by default).
     * @param {number} [pageSize=0] Size of the page (optional, 0 by default).
     */
    getPullRequests(credentials: Credentials, owner: string, repository: string, pageNumber: number, pageSize: number): Promise<PullRequest[]>;

    /**
     * Create pull-request for repository.
     * 
     * @param {string} owner Owner of the repository.
     * @param {string} repository Name of the repository.
     * @param {string} head Branch (or git ref) where the changes are implemented.
     * @param {string} base Branch (or git ref) where the changes are going to be pulled into.
     * @param {string} title Title of the pull request.
     */
    createPullRequest(credentials: Credentials, owner: string, repository: string, head: string, base: string, title: string): Promise<void>;

    /**
     * Update the pull-request.
     * 
     * @param {string} owner Owner of the repository.
     * @param {string} repository Name of the repository.
     * @param {string} id Id of the pull-request.
     * @param pullRequest Pull-Request object that contains updated fields.
     */
    updatePullRequest(credentials: Credentials, owner: string, repository: string, id: string, pullRequest: PullRequest): Promise<void>;

    /**
     * Get organizations of the logined user.
     *
     * @param {number} [pageNumber=0] Number of the page (optional, 0 by default).
     * @param {number} [pageSize=0] Size of the page (optional, 0 by default).
     */
    getOrganizations(credentials: Credentials, pageNumber: number, pageSize: number): Promise<Organization[]>;

    /**
     * Get current logined user.
     */
    getCurrentUser(credentials: Credentials): Promise<User>;

    /**
     * Get collaborators of the repository.
     * 
     * @param {string} owner Owner of the repository.
     * @param {string} repository Name of the repository.
     * @param {number} [pageNumber=0] Number of the page (optional, 0 by default).
     * @param {number} [pageSize=0] Size of the page (optional, 0 by default).
     */
    getCollaborators(credentials: Credentials, owner: string, repository: string, pageNumber: number, pageSize: number): Promise<Collaborator[]>;

    /**
     * Upload SSH key.
     * 
     * @param {string} title Tile of the key.
     */
    uploadSshKey(credentials: Credentials, title: string): Promise<void>;
}

export const SshKeyServer = Symbol("SshKeyServer");

/**
 * Representation of JSON-RPC service for SSH key pair management.
 */
export interface SshKeyServer {

    generate(service: string, name: string): Promise<SshKeyPair>;

    create(sshKeyPair: SshKeyPair): Promise<void>;

    get(service: string, name: string): Promise<SshKeyPair>;

    getAll(service: string): Promise<SshKeyPair[]>;

    delete(service: string, name: string): Promise<void>;
}

/**
 * Representation of a SSH key pair.
 */
export interface SshKeyPair {
    /**
     * Che service that uses SSH key pair, e.g. workspace, machine, vcs.
     */
    service: string;
    /** 
     * Key pair identifier.
     */
    name: string;
    privateKey?: string;
    publicKey?: string;
}
