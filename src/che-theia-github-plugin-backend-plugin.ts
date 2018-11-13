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

let credentialsObject: Credentials;

export function start(context: theia.PluginContext) {
    const GENERATE_AND_UPLOAD: theia.Command = {
        id: 'github:generate_and_upload',
        label: 'GitHub: Generate SSH key and upload it to GitHub ...'
    };
    const AUTHENTICATE: theia.Command = {
        id: 'github:authenticate',
        label: 'GitHub: Authenticate ...'
    };

    context.subscriptions.push(
        theia.commands.registerCommand(GENERATE_AND_UPLOAD, async () => {
            if (!credentialsObject) {
                await authenticate();
            }
            uploadSshKey(credentialsObject);
        })
    );
    context.subscriptions.push(
        theia.commands.registerCommand(AUTHENTICATE, () => {
            authenticate();
        })
    );
}

async function uploadSshKey(credentials: Credentials): Promise<void> {
    const title = 'che';
    const publicKey = await getOrGenerateSshKey();
    try {
        // Delete the SSH key in GitHub if present.
        await githubService.deleteSshKey(credentials, title);
    } catch (error) {
        // The SSH key is not present in GitHub.
    }
    try {
        if (publicKey) {
            await githubService.uploadSshKey(credentials, title, publicKey);
            theia.window.showInformationMessage('Public SSH key was successfully uploaded to GitHub');
        }
    } catch (error) {
        theia.window.showErrorMessage(JSON.parse(error.message).message);
    }
}

async function getOrGenerateSshKey(): Promise<string | undefined> {
    const cheApi = await theia.env.getEnvVariable('CHE_API_INTERNAL');
    const machineToken = await theia.env.getEnvVariable('CHE_MACHINE_TOKEN');
    try {
        const request = await new WsMasterHttpClient(cheApi).get<SshKeyPair>(
            `/ssh/vcs/find?name=github.com`,
            { headers: { 'Authorization': 'Bearer ' + machineToken } }
        );
        const publicKey = request.data.publicKey;
        if (publicKey) {
            return publicKey;
        }
    } catch (error) {
        if (error.response.status !== 404) {
            theia.window.showErrorMessage('Failed to retrieve SSH key. ' + error.message);
        }
    }
    try {
        const request = await new WsMasterHttpClient(cheApi).post<SshKeyPair>(
            '/ssh/generate', { service: 'vcs', name: 'github.com' },
            { headers: { 'Authorization': 'Bearer ' + machineToken } }
        );
        const publicKey = request.data.publicKey;
        if (publicKey) {
            return publicKey;
        }
    } catch (error) {
        theia.window.showErrorMessage('Failed to generate SSH key. ' + error.message);
    }
}

async function authenticate(): Promise<void> {
    const username = await theia.window.showInputBox({ placeHolder: 'Enter GitHub username' });
    const password = await theia.window.showInputBox({ placeHolder: 'Enter GitHub password', password: true });
    if (username && password) {
        const newCredentials = { username, password };
        try {
            await githubService.getCurrentUser(newCredentials);
            credentialsObject = newCredentials;
            theia.window.showInformationMessage('Successfully authenticated to GitHub.');
        } catch (error) {
            theia.window.showErrorMessage('Failed to authenticate to GitHub.');
        }
    }
}

export function stop() {
}
