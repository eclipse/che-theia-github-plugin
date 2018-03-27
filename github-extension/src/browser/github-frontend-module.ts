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

import { ContainerModule } from "inversify";
import { GithubService, githubKeyServicePath } from '../common/github-service';
import { WebSocketConnectionProvider } from "@theia/core/lib/browser";

export default new ContainerModule(bind => {
    bind(GithubService).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<GithubService>(githubKeyServicePath);
    }).inSingletonScope();
});
