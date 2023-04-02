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

import { Uint32 } from "weeg-types";
import { CookieStoreParams } from "./CookieStoreParams";

export class CookieStore {
  private static readonly DEFAULT_STORE = 'firefox-default';
  private static readonly PRIVATE_STORE = 'firefox-private';
  private static readonly CONTAINER_STORE = 'firefox-container-';

  /**
   * Default cookie store.
   */
  public static readonly DEFAULT = new CookieStore(CookieStore.DEFAULT_STORE);

  /**
   * Private cookie store.
   */
  public static readonly PRIVATE = new CookieStore(CookieStore.PRIVATE_STORE);

  /**
   * Cookie store ID.
   */
  public readonly id: string;

  /**
   * Whether the cookie store ID could be parsed using Firefox algorithm.
   */
  public readonly isParsed: boolean;

  /**
   * Parsed user context ID.
   */
  public readonly userContextId: Uint32.Uint32;

  /**
   * Parsed private browsing ID.
   */
  public readonly privateBrowsingId: Uint32.Uint32;

  public static parse(id: string): CookieStoreParams {
    if (id === CookieStore.DEFAULT_STORE) {
      return {
        userContextId: 0 as Uint32.Uint32,
        privateBrowsingId: 0 as Uint32.Uint32,
      };
    } else if (id === CookieStore.PRIVATE_STORE) {
      return {
        userContextId: 0 as Uint32.Uint32,
        privateBrowsingId: 1 as Uint32.Uint32,
      };
    } else if (id.startsWith(CookieStore.CONTAINER_STORE)) {
      const userContextId = Uint32.fromString(id.slice(CookieStore.CONTAINER_STORE.length));
      return {
        userContextId,
        privateBrowsingId: 0 as Uint32.Uint32,
      };
    }
    throw new Error(`CookieStore.parse(): invalid cookieStoreId: ${id}`);
  }

  /**
   * Creates a CookieStore from CookieStoreParams.
   */
  public static fromParams(params: CookieStoreParams): CookieStore {
    if (params.privateBrowsingId != 0 as Uint32.Uint32) {
      return CookieStore.PRIVATE;
    } else if (params.userContextId != 0 as Uint32.Uint32) {
      return new CookieStore(`${CookieStore.CONTAINER_STORE}${params.userContextId}`);
    }
    return CookieStore.DEFAULT;
  }

  public constructor(id: string) {
    this.id = id;
    try {
      const { userContextId, privateBrowsingId } = CookieStore.parse(id);
      this.userContextId = userContextId;
      this.privateBrowsingId = privateBrowsingId;
      this.isParsed = true;
    } catch (e) {
      this.userContextId = 0 as Uint32.Uint32;
      this.privateBrowsingId = 0 as Uint32.Uint32;
      this.isParsed = false;
    }
  }

  /**
   * true if this is a private cookie store.
   */
  public get isPrivate(): boolean {
    return this.privateBrowsingId !== 0;
  }

  /**
   * Returns cookie store ID.
   */
  public toString(): string {
    return this.id;
  }
}
