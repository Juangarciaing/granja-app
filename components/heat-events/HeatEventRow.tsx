"use client";

import { useState } from "react";

import { HeatEventForm } from "@/components/heat-events/HeatEventForm";
import type { HeatEventActionState } from "@/lib/heat-events/form-state";

type HeatEventRowProps = {
  observedDate: string;
  notes: string | null;
  updateAction: (
    state: HeatEventActionState,
    formData: FormData,
  ) => Promise<HeatEventActionState>;
  deleteAction: () => Promise<void>;
};

/**
 * A single row in the cow detail page's heat history (spec: "View a cow's
 * heat history"). Toggles locally between a read-only view (date/notes)
 * and an inline edit form pre-filled with this row's current values —
 * `heat_events` is fully editable/deletable per spec ("Edit and delete a
 * heat event"), same pattern as `MilkRecordRow`.
 */
export function HeatEventRow({
  observedDate,
  notes,
  updateAction,
  deleteAction,
}: HeatEventRowProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="py-3">
        <HeatEventForm
          action={updateAction}
          submitLabel="Guardar cambios"
          defaultValues={{ observed_date: observedDate, notes }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between py-3">
      <div>
        <span className="font-mono tabular-nums text-ink">{observedDate}</span>
        {notes && <p className="text-sm text-ink-muted">{notes}</p>}
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
