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
import { MessageService } from '@theia/core/lib/common/message-service';
import { QuickOpenItem, QuickOpenModel, QuickOpenMode } from "@theia/core/lib/browser/quick-open/quick-open-model";
import { QuickOpenService, QuickOpenOptions } from '@theia/core/lib/browser/quick-open/quick-open-service';
import { open, OpenerService } from "@theia/core/lib/browser";
import { propertiesUri, GitHubProperties } from './github-properties';
import { GithubService } from "../common/github-service";
import { Repository } from "../common/github-model";
import { Git } from "@theia/git/lib/common";
import URI from "@theia/core/lib/common/uri";
import { WorkspaceService } from "@theia/workspace/lib/browser/workspace-service";
import { FileSystem, FileStat } from "@theia/filesystem/lib/common/filesystem";
import { SelectionService } from "@theia/core/lib/common";
import { StatusBar, StatusBarAlignment } from '@theia/core/lib/browser/status-bar/status-bar';

@injectable()
export class GitHubQuickOpenService {

    private rootUri: URI | undefined;
    private gitUrlRegex = /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|#[-\d\w._]+?)$/;

    constructor(
        @inject(MessageService) protected readonly messageService: MessageService,
        @inject(QuickOpenService) protected readonly quickOpenService: QuickOpenService,
        @inject(OpenerService) protected readonly openerService: OpenerService,
        @inject(GitHubProperties) protected readonly gitHubProperties: GitHubProperties,
        @inject(GithubService) protected readonly gitHubService: GithubService,
        @inject(Git) protected readonly git: Git,
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
        @inject(FileSystem) protected readonly fileSystem: FileSystem,
        @inject(SelectionService) protected readonly selectionService: SelectionService,
        @inject(StatusBar) protected readonly statusBar: StatusBar
    ) {
        workspaceService.root.then(root => {
            if (root) {
                this.rootUri = new URI(root.uri);
            }
        });
    }

    openConfigurationFile() {
        open(this.openerService, propertiesUri);
    }

    async cloneRepository(): Promise<void> {
        const __this = this;

        let pageNumber = 1;
        let pageSize = 100;

        let user = await this.gitHubService.getCurrentUser(this.gitHubProperties.getProperties());
        let organizations = await this.gitHubService.getOrganizations(pageNumber, pageSize, this.gitHubProperties.getProperties());

        enum CLONE_PROGRESS {
            START,
            STOP
        }

        const onCloningProgress = (progress: CLONE_PROGRESS, projectName?: string) => {
            if (progress == CLONE_PROGRESS.START) {
                this.statusBar.setElement("github-cloning", {text: "$(download) Cloning: " + projectName, alignment: StatusBarAlignment.LEFT});
            } else if (progress == CLONE_PROGRESS.STOP) {
                this.statusBar.removeElement("github-cloning");
            }
        };

        const cloneRepository = (item: GitHubQuickOpenItem<Repository>) => {
            if (!__this.rootUri) {
                return;
            }

            onCloningProgress(CLONE_PROGRESS.START, item.ref.name);

            let localUri = __this.rootUri;

            __this.getDirectory(localUri).then(() => {
                __this.fileSystem.createFolder(localUri.resolve(item.ref.name).toString()).then(dumbFolder => {
                    __this.git.clone(item.ref.html_url, {localUri: dumbFolder.uri}).then(() => {
                        onCloningProgress(CLONE_PROGRESS.STOP);
                        __this.messageService.info(`Repository ${item.ref.name} successfully cloned.`);
                    });
                });
            })
        };

        const getRepositoryNameFromUrl = (url: string): string => {
            let gitUrlRegexExecution = __this.gitUrlRegex.exec(url);
            if (gitUrlRegexExecution) {
                let userAndRepositoryName = gitUrlRegexExecution[2];
                let parts = userAndRepositoryName.split("/");
                return parts[parts.length - 1];
            } else {
                //in case when project name cannot be fetched from git url
                return "project-" + Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
            }
        };

        const cloneRepositoryByUrl = (item: GitHubQuickOpenItem<string>) => {
            if (!__this.rootUri) {
                return;
            }

            let futureProjectName = getRepositoryNameFromUrl(item.ref);
            let localUri = __this.rootUri;

            onCloningProgress(CLONE_PROGRESS.START, futureProjectName);

            __this.getDirectory(localUri).then(() => {
                __this.fileSystem.createFolder(localUri.resolve(futureProjectName).toString()).then(dumbFolder => {
                    __this.git.clone(item.ref, { localUri: dumbFolder.uri }).then(() => {
                        onCloningProgress(CLONE_PROGRESS.STOP);
                        __this.messageService.info(`Repository ${futureProjectName} successfully cloned.`);
                    });
                });
            })
        };

        const loadRepositories = async (login: GitHubQuickOpenItem<string>) => {
            let repositories = await __this.gitHubService.getUserRepositories(login.ref, pageNumber, pageSize, __this.gitHubProperties.getProperties());
            let items: QuickOpenItem[] = repositories.map((repository: Repository) => {
                return new GitHubQuickOpenItem(
                    repository,
                    cloneRepository,
                    (repository: GitHubQuickOpenItem<Repository>) => {
                        return repository.ref.git_url;
                    },
                    (repository: GitHubQuickOpenItem<Repository>) => {
                        return repository.ref.description;
                    },
                    () => true
                );
            });

            const loadMore = async () => {
                pageNumber = pageNumber + 1;
                const next = await __this.gitHubService.getUserRepositories(login.ref, pageNumber, pageSize, __this.gitHubProperties.getProperties());
                const nextItems: QuickOpenItem[] = next.map(repository => new GitHubQuickOpenItem(
                    repository,
                    cloneRepository,
                    () => {
                        return repository.git_url
                    },
                    (repository: GitHubQuickOpenItem<Repository>) => {
                        return repository.ref.description;
                    },
                    () => true
                ));

                items.pop();

                for (let item of nextItems) {
                    items.push(item);
                }

                if (nextItems.length == pageSize) { //limit reached
                    items.push(new GitHubQuickOpenItem(
                        pageNumber,
                        loadMore,
                        () => "Load more...",
                        () => "",
                        () => false));
                }

                this.open(items, "Select repository to clone");
            };

            if (items.length == pageSize) {
                items.push(new GitHubQuickOpenItem(
                    pageNumber,
                    loadMore,
                    () => "Load more...",
                    () => "",
                    () => false));
            }

            __this.open(items, "Select repository to clone");
        };

        const loadUserAndOrganizations: QuickOpenModel = {
            onType(lookFor: string, acceptor: (items: QuickOpenItem[]) => void): void {
                const items: QuickOpenItem[] = [];

                if (lookFor === undefined || lookFor.length === 0) {
                    items.push(new GitHubQuickOpenItem(
                        user.login,
                        loadRepositories,
                        (item: GitHubQuickOpenItem<string>) => {
                            return item.ref;
                        },
                        () => {
                            return "user";
                        },
                        () => false
                    ));

                    for (let org of organizations) {
                        items.push(new GitHubQuickOpenItem(
                            org.login,
                            loadRepositories,
                            (item: GitHubQuickOpenItem<string>) => {
                                return item.ref;
                            },
                            () => {
                                return "organization";
                            },
                            () => false
                        ));
                    }
                } else {
                    items.push(new GitHubQuickOpenItem(
                        lookFor,
                        cloneRepositoryByUrl,
                        (item: GitHubQuickOpenItem<string>) => {
                            return getRepositoryNameFromUrl(item.ref) == undefined ? "Invalid URL" : `Clone from: ${item.ref}`;
                        },
                        () => {
                            return "";
                        },
                        () => true
                    ));
                }

                acceptor(items);
            }
        };
        this.quickOpenService.open(loadUserAndOrganizations, GitHubQuickOpenService.getOptions('Choose organization or GitHub URL', false));
    }

    private open(items: QuickOpenItem | QuickOpenItem[], placeholder: string) {
        this.quickOpenService.open(GitHubQuickOpenService.getModel(Array.isArray(items) ? items : [items]), GitHubQuickOpenService.getOptions(placeholder));
    }

    private static getModel(items: QuickOpenItem | QuickOpenItem[]): QuickOpenModel {
        return {
            onType(lookFor: string, acceptor: (items: QuickOpenItem[]) => void): void {
                acceptor(Array.isArray(items) ? items : [items]);
            }
        };
    }

    private static getOptions(placeholder: string, fuzzyMatchLabel: boolean = true): QuickOpenOptions {
        return QuickOpenOptions.resolve({
            placeholder,
            fuzzyMatchLabel,
            fuzzySort: false
        });
    }

    protected async getDirectory(candidate: URI): Promise<FileStat> {
        const stat = await this.fileSystem.getFileStat(candidate.toString());
        if (stat.isDirectory) {
            return stat;
        }
        return this.getParent(candidate);
    }

    protected getParent(candidate: URI): Promise<FileStat> {
        return this.fileSystem.getFileStat(candidate.parent.toString());
    }
}

class GitHubQuickOpenItem<T> extends QuickOpenItem {

    constructor(
        public readonly ref: T,
        protected readonly execute: (item: GitHubQuickOpenItem<T>) => void,
        protected readonly toLabel: (item: GitHubQuickOpenItem<T>) => string = () => `${ref}`,
        protected readonly toDescription: (item: GitHubQuickOpenItem<T>) => string | undefined = () => undefined,
        protected readonly canClose: (mode: QuickOpenMode) => boolean = () => true) {

        super();
    }

    run(mode: QuickOpenMode): boolean {
        if (mode !== QuickOpenMode.OPEN) {
            return false;
        }
        this.execute(this);
        return this.canClose(mode);
    }

    getLabel(): string {
        return this.toLabel(this);
    }

    getDescription(): string | undefined {
        return this.toDescription(this);
    }
}
