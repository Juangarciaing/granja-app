/// <reference lib="webworker" />
// This file is excluded from tsconfig.json (see `exclude`) because the
// webworker lib globals (e.g. `self: ServiceWorkerGlobalScope`) conflict
// with the app-wide `dom` lib globals (`self: Window`) if both are
// type-checked in the same `tsc` program. @serwist/next bundles this file
// with its own webpack pass, so it does not need the main tsc program.

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
