import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InstallPrompt } from "@/components/pwa/InstallPrompt";

/**
 * Minimal fake of the non-standard `BeforeInstallPromptEvent` browsers fire
 * before showing their native install UI. Chromium-only API, not in
 * jsdom/TS DOM lib, so it is constructed as a plain Event with the two
 * extra members the component reads (`prompt`, `userChoice`).
 */
type FakeBeforeInstallPromptEvent = Event & {
  prompt: ReturnType<typeof vi.fn<() => Promise<void>>>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function makeBeforeInstallPromptEvent(
  outcome: "accepted" | "dismissed",
): FakeBeforeInstallPromptEvent {
  const event = new Event("beforeinstallprompt", { cancelable: true });
  return Object.assign(event, {
    prompt: vi.fn(async () => {}),
    userChoice: Promise.resolve({ outcome, platform: "web" }),
  });
}

describe("InstallPrompt", () => {
  it("renders nothing until the browser fires beforeinstallprompt", () => {
    render(<InstallPrompt />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the install button after beforeinstallprompt fires", async () => {
    render(<InstallPrompt />);

    await act(async () => {
      window.dispatchEvent(makeBeforeInstallPromptEvent("accepted"));
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Instalar" }),
    ).toBeInTheDocument();
  });

  it("calls prompt() and hides itself when the user installs", async () => {
    const user = userEvent.setup();
    render(<InstallPrompt />);

    const installEvent = makeBeforeInstallPromptEvent("accepted");
    await act(async () => {
      window.dispatchEvent(installEvent);
    });

    await user.click(screen.getByRole("button", { name: "Instalar" }));

    expect(installEvent.prompt).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("hides itself without prompting when dismissed", async () => {
    const user = userEvent.setup();
    render(<InstallPrompt />);

    const installEvent = makeBeforeInstallPromptEvent("dismissed");
    await act(async () => {
      window.dispatchEvent(installEvent);
    });

    await user.click(screen.getByRole("button", { name: "Ahora no" }));

    expect(installEvent.prompt).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
