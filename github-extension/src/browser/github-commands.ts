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
import { CommandContribution, CommandRegistry } from "@theia/core/lib/common";
import { GitHubQuickOpenService } from "./github-quick-open-service";

export namespace GITHUB_COMMANDS {
    export const OPEN_CONFIGURATION = {
        id: 'github.open.configuration.file',
        label: 'GitHub: Open Configuration'
    };

    export const CLONE_REPOSITORY = {
        id: 'github.clone.repository',
        label: 'GitHub: Clone Repository'
    };
}

@injectable()
export class GitHubCommandHandlers implements CommandContribution {
    constructor(
        @inject(GitHubQuickOpenService) protected readonly quickOpenService: GitHubQuickOpenService
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(GITHUB_COMMANDS.OPEN_CONFIGURATION);
        registry.registerHandler(GITHUB_COMMANDS.OPEN_CONFIGURATION.id, {
            execute: () => this.quickOpenService.openConfigurationFile(),
            isEnabled: () => true
        });

        registry.registerCommand(GITHUB_COMMANDS.CLONE_REPOSITORY);
        registry.registerHandler(GITHUB_COMMANDS.CLONE_REPOSITORY.id, {
            execute: () => this.quickOpenService.cloneRepository(),
            isEnabled: () => true
        });
    }
}
