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
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry } from "@theia/core/lib/common";
import { CommonMenus } from "@theia/core/lib/browser";
import { GithubService } from "../common/github-service";

export const GetReposCommand = {
    id: 'get-repos',
    label: "Get-Repos"
};

export const UploadSshKeyCommand = {
    id: 'upload-key',
    label: "Upload-SSH-Key"
};

@injectable()
export class GithubFrontendContribution implements CommandContribution, MenuContribution {

    constructor(@inject(GithubService) private githubService: GithubService) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(GetReposCommand, {
            execute: () => {
                this.githubService.getUserRepositories({ username: 'username', password: 'password' }, 'vinokurig', 2, 3);
            }
        });
        registry.registerCommand(UploadSshKeyCommand, {
            execute: () => {
                this.githubService.uploadSshKey({ username: 'username', password: 'password' }, 'newSshKey');
            }
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: GetReposCommand.id,
            label: GetReposCommand.label
        });
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: UploadSshKeyCommand.id,
            label: UploadSshKeyCommand.label
        });
    }
}
