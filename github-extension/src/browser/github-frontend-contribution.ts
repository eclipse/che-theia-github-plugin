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

import { injectable, inject } from 'inversify';
import { StatusBar, StatusBarAlignment } from '@theia/core/lib/browser/status-bar/status-bar';
import { GithubService } from '../common/github-service';
import { GitHubProperties } from './github-properties';
import { User } from '../common/github-model';
import { GITHUB_COMMANDS } from './github-commands';
import { FrontendApplicationContribution, FrontendApplication } from '@theia/core/lib/browser';

@injectable()
export class GitHubFrontendContribution implements FrontendApplicationContribution {

    constructor(
        @inject(StatusBar) protected readonly statusBar: StatusBar,
        @inject(GitHubProperties) protected readonly gitHubProperties: GitHubProperties,
        @inject(GithubService) protected readonly gitHubService: GithubService
    ) {
        this.gitHubProperties.onPropertiesChange(() => {
            this.updateStatusBar();
        });
    }

    onStart(app: FrontendApplication): void {
    }

    protected updateStatusBar() {
        this.gitHubService.getCurrentUser(this.gitHubProperties.getProperties())
            .then(user => this.onUserChanged(user))
            .catch(error => this.onUserChanged(undefined));
    }

    protected onUserChanged(user: User | undefined): void {
        if (user) {
            this.statusBar.setElement(
                "github",
                {text: "$(github-alt) " + user.login, alignment: StatusBarAlignment.LEFT});
        } else {
            this.statusBar.setElement(
                "github",
                {text: "$(github-alt) not authorized", alignment: StatusBarAlignment.LEFT, command: GITHUB_COMMANDS.OPEN_CONFIGURATION.id});
        }
    }
}
