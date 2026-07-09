import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PigletCounter } from "@/components/farrowings/PigletCounter";

describe("PigletCounter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the initial live piglet count", () => {
    render(<PigletCounter initialCount={8} onDecrement={vi.fn()} />);

    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("optimistically decrements on click before the debounced persist fires", () => {
    const onDecrement = vi.fn().mockResolvedValue({ ok: true });

    render(<PigletCounter initialCount={8} onDecrement={onDecrement} />);

    fireEvent.click(screen.getByRole("button", { name: /-1/i }));

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(onDecrement).not.toHaveBeenCalled();
  });

  it("persists the decremented count only after the debounce window elapses", async () => {
    const onDecrement = vi.fn().mockResolvedValue({ ok: true });

    render(
      <PigletCounter
        initialCount={8}
        onDecrement={onDecrement}
        debounceMs={500}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /-1/i }));
    expect(onDecrement).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(onDecrement).toHaveBeenCalledWith(7);
  });

  it("does not allow decrementing below zero — the button disables at 0", () => {
    render(<PigletCounter initialCount={0} onDecrement={vi.fn()} />);

    expect(screen.getByRole("button", { name: /-1/i })).toBeDisabled();
  });

  it("rolls back and shows an error when the persisted update is rejected", async () => {
    const onDecrement = vi.fn().mockResolvedValue({
      ok: false,
      error: "El conteo de lechones solo puede disminuir.",
    });

    render(
      <PigletCounter
        initialCount={8}
        onDecrement={onDecrement}
        debounceMs={500}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /-1/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "El conteo de lechones solo puede disminuir.",
    );
  });
});
