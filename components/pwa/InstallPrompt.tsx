"use client";

import { useEffect, useState } from "react";

/**
 * The `beforeinstallprompt` event is a Chromium-only PWA API, not part of
 * the standard DOM lib types — declared locally with just the two members
 * this component reads.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

/**
 * Small install-CTA banner. Browsers that support PWA installation
 * (desktop/Android Chrome, Edge) fire `beforeinstallprompt` once the
 * manifest + a registered service worker with a fetch handler are present
 * (both already true — `app/manifest.ts` + `app/sw.ts` via Serwist); this
 * component captures that event, suppresses the browser's default mini-bar,
 * and offers its own "Instalar" CTA. Renders nothing on browsers that never
 * fire the event (Safari/iOS, or an already-installed app) or before it
 * fires.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, []);

  if (!deferredPrompt) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setDeferredPrompt(null);
  }

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 border-b border-black/10 bg-zinc-50 px-4 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
    >
      <span>Instalá la app en tu dispositivo para acceso rápido.</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded px-3 py-1 text-zinc-600 dark:text-zinc-400"
        >
          Ahora no
        </button>
        <button
          type="button"
          onClick={handleInstall}
          className="rounded bg-zinc-900 px-3 py-1 text-white dark:bg-white dark:text-zinc-900"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}
