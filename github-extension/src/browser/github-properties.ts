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

import URI from "@theia/core/lib/common/uri";
import { UserStorageUri } from '@theia/userstorage/lib/browser/';
import { injectable, inject } from "inversify";
import { Disposable, DisposableCollection, Resource, ResourceProvider, ILogger, Emitter, Event } from "@theia/core/lib/common";
import { FrontendApplicationContribution, FrontendApplication } from "@theia/core/lib/browser";
import * as jsoncparser from "jsonc-parser";
import { ParseError } from "jsonc-parser";
import { Properties } from "../common/github-model";

export const propertiesUri: URI = new URI('github.json').withScheme(UserStorageUri.SCHEME);

export const defaultProperties: Properties = {
    credentials: {
        type: "token",
        token: "token_value"
    }
};

@injectable()
export class GitHubProperties implements Disposable, FrontendApplicationContribution {
    protected readonly toDispose = new DisposableCollection();
    protected propertiesFile: Resource | undefined;
    protected properties: Properties | undefined;
    protected readonly onPropertiesChangeEmitter = new Emitter<Properties | undefined>();

    constructor(
        @inject(ResourceProvider) protected readonly resourceProvider: ResourceProvider,
        @inject(ILogger) protected readonly logger: ILogger
    ) {}

    dispose(): void {
        this.toDispose.dispose();
    }

    onStart(app: FrontendApplication): void {
        this.resourceProvider(propertiesUri).then(resource => {
            this.propertiesFile = resource;
            this.toDispose.push(this.propertiesFile);
            if (this.propertiesFile.onDidChangeContents) {
                this.propertiesFile.onDidChangeContents(() => {
                    this.onDidConfigurationChange();
                });
            }

            resource.readContents().then(content => {
                if (content) {
                    this.parseConfiguration(content);
                } else {
                    if (resource.saveContents) {
                        resource.saveContents(JSON.stringify(defaultProperties)).then(() => {
                            this.parseConfiguration(JSON.stringify(defaultProperties));
                        });
                    }
                }
            });
        }).catch(error => {
            this.propertiesFile = undefined;
        });
    }

    getProperties(): Properties | undefined {
        return this.properties;
    }

    protected onDidConfigurationChange(): void {
        if (this.propertiesFile) {
            this.propertiesFile.readContents().then(content => {
                this.parseConfiguration(content);
            });
        }
    }

    protected parseConfiguration(content: string) {
        let strippedContent = jsoncparser.stripComments(content);
        let errors: ParseError[] = [];
        let configuration = jsoncparser.parse(strippedContent, errors);
        if (errors.length) {
            for (const error of errors) {
                this.logger.error("JSON parsing error: ", error);
            }
        }
        if (configuration) {
            this.setConfiguration(configuration);
        }
    }

    protected setConfiguration(configuration: any) {
        this.properties = configuration as Properties;

        this.fireGitHubConfigurationChange();
    }

    get onPropertiesChange(): Event<Properties | undefined> {
        return this.onPropertiesChangeEmitter.event;
    }

    protected fireGitHubConfigurationChange(): void {
        this.onPropertiesChangeEmitter.fire(this.properties);
    }
}
