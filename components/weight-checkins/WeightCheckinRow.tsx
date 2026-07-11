"use client";

import { useState } from "react";

import { WeightCheckinForm } from "@/components/weight-checkins/WeightCheckinForm";
import { formatWeightDelta } from "@/lib/weight-checkins/format";
import type { WeightCheckinActionState } from "@/lib/weight-checkins/form-state";

type WeightCheckinRowProps = {
  checkinDate: string;
  weight: number;
  /** The pig's `entry_weight`, used to compute the displayed delta. */
  entryWeight: number;
  updateAction: (
    state: WeightCheckinActionState,
    formData: FormData,
  ) => Promise<WeightCheckinActionState>;
  deleteAction: () => Promise<void>;
};

/**
 * A single row in the pig detail page's weight-history table (spec: "View
 * Weight History / Growth Curve"; v1 scope = plain table, no chart — see
 * `sdd/control-peso-engorde/tasks` Phase 4.1). Toggles locally between a
 * read-only view (date/weight/delta-vs-entry-weight) and an inline edit
 * form pre-filled with this row's current values — `weight_checkins` is
 * fully editable/deletable per user decision (design revision 2), unlike
 * module 1's append-only patterns.
 */
export function WeightCheckinRow({
  checkinDate,
  weight,
  entryWeight,
  updateAction,
  deleteAction,
}: WeightCheckinRowProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="py-3">
        <WeightCheckinForm
          action={updateAction}
          submitLabel="Guardar cambios"
          defaultValues={{ checkin_date: checkinDate, weight }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between py-3">
      <div>
        <span className="font-mono tabular-nums text-ink">{checkinDate}</span>
        <p className="text-sm text-ink-muted">
          <span className="font-mono tabular-nums">{weight} kg</span> ·{" "}
          <span className="font-mono tabular-nums">
            {formatWeightDelta(weight - entryWeight)}
          </span>{" "}
          vs. ingreso
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
