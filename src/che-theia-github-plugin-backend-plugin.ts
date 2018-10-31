/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import * as theia from '@theia/plugin';
import { GithubServiceImpl } from './node/github-service-impl';
import { WsMasterHttpClient } from './node/ws-master-http-client';
import { Credentials, SshKeyPair } from './common/github-model';

const githubService = new GithubServiceImpl();

let credentials: Credentials;

export function start(context: theia.PluginContext) {
    const GENERATE_AND_UPLOAD: theia.Command = {
        id: 'github:generate_and_upload',
        label: 'GitHub: Generate Ssh key and upload it to GitHub ...'
    };
    const AUTHENTICATE: theia.Command = {
        id: 'github:authenticate',
        label: 'GitHub: Authenticate ...'
    };

    context.subscriptions.push(
        theia.commands.registerCommand(GENERATE_AND_UPLOAD, async () => {
            if (credentials) {
                uploadSshKey(credentials);
            } else {
                await authenticate();
                uploadSshKey(credentials);
            }
        })
    );
    context.subscriptions.push(
        theia.commands.registerCommand(AUTHENTICATE, () => {
            authenticate();
        })
    );
}

async function uploadSshKey(credentials: Credentials): Promise<void> {
    const publicKey = await getOrGenerateSshKey();
    try {
        if (publicKey) {
            await githubService.uploadSshKey(credentials, 'theia', publicKey);
            theia.window.showInformationMessage('Public SSH key was successfully uploaded to GitHub');
        }
    } catch (error) {
        theia.window.showErrorMessage(JSON.parse(error.message).message);
    }
}

async function getOrGenerateSshKey(): Promise<string | undefined> {
    const cheApi = await theia.env.getEnvVariable('CHE_API');
    try {
        const request = await new WsMasterHttpClient(cheApi).get<SshKeyPair>(`/ssh/vcs/find?name=github.com`);
        const publicKey = request.data.publicKey;
        if (publicKey) {
            return publicKey;
        } else {
            const request = await new WsMasterHttpClient(cheApi).post<SshKeyPair>('/ssh/generate', { service: 'vcs', name: 'github.com' });
            const publicKey = request.data.publicKey;
            if (publicKey) {
                return publicKey;
            }
        }
    } catch (error) {
        theia.window.showErrorMessage('Failed to retrieve SSH key.');
    }
}

async function authenticate(): Promise<void> {
    const username = await theia.window.showInputBox({ placeHolder: 'Enter GitHub username' });
    const password = await theia.window.showInputBox({ placeHolder: 'Enter GitHub password', password: true });
    if (username && password) {
        const newCredentials = { username, password };
        try {
            await githubService.getCurrentUser(newCredentials);
            credentials = newCredentials;
            theia.window.showInformationMessage('Successfully authenticated to GitHub.')
        } catch (error) {
            theia.window.showErrorMessage('Failed to authenticate to GitHub.')
        }
    }
}

export function stop() {
}
