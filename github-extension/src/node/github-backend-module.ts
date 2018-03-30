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
import { JsonRpcConnectionHandler, ConnectionHandler } from "@theia/core/lib/common";
import { GithubServiceImpl } from './github-service-impl';
import { GithubService, githubKeyServicePath } from '../common/github-service';

export default new ContainerModule(bind => {
    bind(GithubService).to(GithubServiceImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(githubKeyServicePath, () =>
            ctx.container.get(GithubService)
        )
    ).inSingletonScope();
});
