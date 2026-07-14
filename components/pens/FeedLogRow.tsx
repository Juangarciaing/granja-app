"use client";

import { useState } from "react";

import { FeedLogForm } from "@/components/pens/FeedLogForm";
import type { FeedLogActionState } from "@/lib/pens/form-state";

type FeedLogRowProps = {
  logDate: string;
  kgFed: number;
  updateAction: (
    state: FeedLogActionState,
    formData: FormData,
  ) => Promise<FeedLogActionState>;
  deleteAction: () => Promise<void>;
};

/**
 * A single row in the pen detail page's feed-log history table, mirroring
 * `MilkRecordRow` almost exactly: `feed_logs` is fully editable/deletable
 * (not append-only), and — like production history — there is no baseline
 * anchor row to diff against, so no delta is shown here. Toggles locally
 * between a read-only view (date/kg) and an inline edit form pre-filled
 * with this row's current values.
 */
export function FeedLogRow({
  logDate,
  kgFed,
  updateAction,
  deleteAction,
}: FeedLogRowProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="py-3">
        <FeedLogForm
          action={updateAction}
          submitLabel="Guardar cambios"
          defaultValues={{ log_date: logDate, kg_fed: kgFed }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between py-3">
      <div>
        <span className="font-mono tabular-nums text-ink">{logDate}</span>
        <p className="text-sm text-ink-muted">
          <span className="font-mono tabular-nums">{kgFed} kg</span>
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="btn-secondary px-3 py-1"
        >
          Editar
        </button>
        <form action={deleteAction}>
          <button
            type="submit"
            className="btn-secondary px-3 py-1 text-critical"
          >
            Eliminar
          </button>
        </form>
      </div>
    </li>
  );
}
