"use client";

import { useEffect, useRef, useState } from "react";

export type PigletCounterDecrementResult =
  | { ok: true }
  | { ok: false; error: string };

type PigletCounterProps = {
  initialCount: number;
  onDecrement: (nextCount: number) => Promise<PigletCounterDecrementResult>;
  /** Debounce window before the pending value is persisted. Default 500ms. */
  debounceMs?: number;
};

/**
 * Live piglet counter widget for an active farrowing. Optimistically
 * decrements local state on click, then persists the new value after a
 * debounce window so rapid successive clicks collapse into a single
 * server call. `current_piglets` is a live counter only — there is no
 * mortality event history to record (spec: "Update Live Piglet Count"),
 * so this widget never asks for a cause/date, only the resulting count.
 * On a rejected persist (e.g. a stale/invalid target), the optimistic
 * value is rolled back and an inline error is shown.
 */
export function PigletCounter({
  initialCount,
  onDecrement,
  debounceMs = 500,
}: PigletCounterProps) {
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleDecrement() {
    if (count <= 0) return;

    const next = count - 1;
    setCount(next);
    setError(null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onDecrement(next).then((result) => {
        if (!result.ok) {
          setCount(initialCount);
          setError(result.error);
        }
      });
    }, debounceMs);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold tabular-nums">{count}</span>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={count <= 0}
          className="rounded border px-3 py-1 text-sm disabled:opacity-40"
        >
          -1
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
