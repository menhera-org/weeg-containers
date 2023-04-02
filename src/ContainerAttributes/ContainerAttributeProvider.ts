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

import { ExtensibleAttributeDictionary, ExtensibleAttributeProvider, ExtensibleAttributeSet } from "weeg-utils";
import { StorageItem } from "weeg-storage";
import { ContextualIdentityFactory } from "../ContextualIdentity/ContextualIdentityFactory";
import { CookieStore } from "../CookieStore/CookieStore";

type StorageType = Map<string, ExtensibleAttributeDictionary>;

const storage = new StorageItem<StorageType>("weeg.containerAttributes", new Map(), StorageItem.AREA_LOCAL);
const contextualIdentityFactory = new ContextualIdentityFactory();
contextualIdentityFactory.onRemoved.addListener(async (identity) => {
  const value = await storage.getValue();
  value.delete(identity.cookieStore.id);
  await storage.setValue(value);
});

export class ContainerAttributeProvider implements ExtensibleAttributeProvider<CookieStore> {
  public async getAttributeSets(cookieStores: Iterable<CookieStore>): Promise<ExtensibleAttributeSet<CookieStore>[]> {
    const storageValue = await storage.getValue();
    const sets: ExtensibleAttributeSet<CookieStore>[] = [];
    for (const cookieStore of cookieStores) {
      const attributesDictionary = storageValue.get(cookieStore.id) || {};
      sets.push(new ExtensibleAttributeSet(cookieStore, attributesDictionary));
    }
    return sets;
  }

  public async saveAttributeSets(attributeSets: Iterable<ExtensibleAttributeSet<CookieStore>>): Promise<void> {
    const storageValue = await storage.getValue();
    for (const attributeSet of attributeSets) {
      storageValue.set(attributeSet.target.id, attributeSet.getAttributeDictionary());
    }
    await storage.setValue(storageValue);
  }
}
