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
import { ContextualIdentityParams } from "./ContextualIdentityParams";
import { DisplayedContainerParams } from "../DisplayedContainer/DisplayedContainerParams";
import { CookieStore } from "../CookieStore/CookieStore";
import { DisplayedContainer } from "../DisplayedContainer/DisplayedContainer";

export type ThemeCallback = (attributes: ContextualIdentityParams) => DisplayedContainerParams;

export class ContextualIdentity implements DisplayedContainer {
  // TODO: allow theming, or consider syncing with Firefox's theme
  private static readonly _COLORS: { [color: string]: string } = {
    "blue": "#37adff",
    "green": "#51cd00",
    "pink": "#ff4bda",
    "turquoise": "#00c79a",
    "yellow": "#ffcb00",
    "red": "#ff613d",
    "toolbar": "#7c7c7d",
    "orange": "#ff9f00",
    "purple": "#af51f5"
  };

  private static readonly _DEFAULT_THEME_CALLBACK: ThemeCallback = (attributes: ContextualIdentityParams): DisplayedContainerParams => {
    return {
      name: attributes.name,
      iconUrl: `resource://usercontext-content/${attributes.icon}`,
      colorCode: ContextualIdentity._COLORS[attributes.color] ?? (ContextualIdentity._COLORS["toolbar"] as string),
    };
  };

  public static fromWebExtensionsContextualIdentity(identity: browser.ContextualIdentities.ContextualIdentity, themeCallback?: ThemeCallback): ContextualIdentity {
    return new ContextualIdentity(new CookieStore(identity.cookieStoreId), {
      name: identity.name,
      icon: identity.icon,
      color: identity.color,
    }, themeCallback);
  }

  public static checkForApi(): void {
    if (!browser.contextualIdentities) {
      throw new Error("ContextualIdentities API is not available");
    }
  }

  public readonly cookieStore: CookieStore;
  public readonly icon: string;
  public readonly color: string;
  public readonly name: string;

  public readonly iconUrl: string;
  public readonly colorCode: string;

  public constructor(cookieStore: CookieStore, attributes: ContextualIdentityParams, themeCallback?: ThemeCallback) {
    this.cookieStore = cookieStore;
    this.icon = attributes.icon;
    this.color = attributes.color;
    this.name = attributes.name;
    if (!themeCallback) {
      themeCallback = ContextualIdentity._DEFAULT_THEME_CALLBACK;
    }
    const displayedParams = themeCallback(attributes);
    this.iconUrl = displayedParams.iconUrl;
    this.colorCode = displayedParams.colorCode;
  }
}
