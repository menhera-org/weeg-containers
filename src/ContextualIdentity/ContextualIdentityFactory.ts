/* -*- indent-tabs-mode: nil; tab-width: 2; -*- */
/* vim: set ts=2 sw=2 et ai : */
/**
  Copyright (C) 2023 WebExtensions Experts Group

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  @license
*/

import browser from 'webextension-polyfill';
import { ContextualIdentity } from "./ContextualIdentity";
import { ThemeCallback } from "./ContextualIdentity";
import { EventSink } from 'weeg-events';
import { ContextualIdentityParams } from "./ContextualIdentityParams";
import { CookieStore } from "../CookieStore/CookieStore";

export class ContextualIdentityFactory {
  public readonly themeCallback: ThemeCallback | undefined;

  public readonly onCreated = new EventSink<ContextualIdentity>();
  public readonly onRemoved = new EventSink<ContextualIdentity>();
  public readonly onUpdated = new EventSink<ContextualIdentity>();

  public constructor(themeCallback?: ThemeCallback) {
    this.themeCallback = themeCallback;

    if (browser.contextualIdentities) {
      browser.contextualIdentities.onCreated.addListener((changeInfo) => {
        const created = ContextualIdentity.fromWebExtensionsContextualIdentity(changeInfo.contextualIdentity, this.themeCallback);
        this.onCreated.dispatch(created);
      });

      browser.contextualIdentities.onRemoved.addListener((changeInfo) => {
        const removed = ContextualIdentity.fromWebExtensionsContextualIdentity(changeInfo.contextualIdentity, this.themeCallback);
        this.onRemoved.dispatch(removed);
      });

      browser.contextualIdentities.onUpdated.addListener((changeInfo) => {
        const updated = ContextualIdentity.fromWebExtensionsContextualIdentity(changeInfo.contextualIdentity, this.themeCallback);
        this.onUpdated.dispatch(updated);
      });
    }
  }

  public fromWebExtensionsContextualIdentity(identity: browser.ContextualIdentities.ContextualIdentity): ContextualIdentity {
    return ContextualIdentity.fromWebExtensionsContextualIdentity(identity, this.themeCallback);
  }

  public async get(cookieStoreId: string): Promise<ContextualIdentity> {
    ContextualIdentity.checkForApi();
    const identity = await browser.contextualIdentities.get(cookieStoreId);
    return ContextualIdentity.fromWebExtensionsContextualIdentity(identity, this.themeCallback);
  }

  /**
   * This returns all ContextualIdentities defined, but not all CookieStores,
   * for example, the default CookieStore is not returned.
   * @returns All ContextualIdentities
   */
  public async getAll(): Promise<ContextualIdentity[]> {
    ContextualIdentity.checkForApi();
    const identities = await browser.contextualIdentities.query({});
    return identities.map((identity) => ContextualIdentity.fromWebExtensionsContextualIdentity(identity, this.themeCallback));
  }

  public async create(params: ContextualIdentityParams): Promise<ContextualIdentity> {
    ContextualIdentity.checkForApi();
    const identity = await browser.contextualIdentities.create(params);
    return ContextualIdentity.fromWebExtensionsContextualIdentity(identity, this.themeCallback);
  }

  public async remove(cookieStoreId: string): Promise<void> {
    ContextualIdentity.checkForApi();
    await browser.contextualIdentities.remove(cookieStoreId);
  }

  public async setParams(cookieStoreId: string, params: Partial<ContextualIdentityParams>): Promise<ContextualIdentity> {
    ContextualIdentity.checkForApi();
    const identity = await browser.contextualIdentities.update(cookieStoreId, params);
    return ContextualIdentity.fromWebExtensionsContextualIdentity(identity, this.themeCallback);
  }

  public construct(cookieStore: CookieStore, attributes: ContextualIdentityParams): ContextualIdentity {
    return new ContextualIdentity(cookieStore, attributes, this.themeCallback);
  }
}
