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

import { ContainerModule } from "inversify";
import { GithubService, githubKeyServicePath } from '../common/github-service';
import { WebSocketConnectionProvider, FrontendApplicationContribution } from "@theia/core/lib/browser";
import { GitHubQuickOpenService } from "./github-quick-open-service";
import { CommandContribution } from "@theia/core";
import { GitHubCommandHandlers } from "./github-commands";
import { GitHubFrontendContribution } from "./github-frontend-contribution";
import { GitHubProperties } from "./github-properties";

export default new ContainerModule(bind => {
    bind(GitHubProperties).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toDynamicValue(c => c.container.get(GitHubProperties));
    bind(GitHubFrontendContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toDynamicValue(c => c.container.get(GitHubFrontendContribution));
    bind(CommandContribution).to(GitHubCommandHandlers);
    bind(GitHubQuickOpenService).toSelf().inSingletonScope();

    bind(GithubService).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<GithubService>(githubKeyServicePath);
    }).inSingletonScope();
});
