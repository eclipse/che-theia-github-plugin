/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

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
