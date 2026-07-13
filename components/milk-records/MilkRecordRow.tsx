"use client";

import { useState } from "react";

import { MilkRecordForm } from "@/components/milk-records/MilkRecordForm";
import type { MilkRecordActionState } from "@/lib/milk-records/form-state";

type MilkRecordRowProps = {
  recordDate: string;
  liters: number;
  updateAction: (
    state: MilkRecordActionState,
    formData: FormData,
  ) => Promise<MilkRecordActionState>;
  deleteAction: () => Promise<void>;
};

/**
 * A single row in the cow detail page's production-history table (spec:
 * "View a cow's production history"). Toggles locally between a read-only
 * view (date/liters) and an inline edit form pre-filled with this row's
 * current values — `milk_records` is fully editable/deletable per spec
 * ("Requirement: Edit an existing day's record"), same pattern as
 * `WeightCheckinRow`. Unlike `WeightCheckinRow`, there is no baseline
 * anchor value to diff against (design decision: history has no baseline
 * anchor row), so no delta is shown here.
 */
export function MilkRecordRow({
  recordDate,
  liters,
  updateAction,
  deleteAction,
}: MilkRecordRowProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="py-3">
        <MilkRecordForm
          action={updateAction}
          submitLabel="Guardar cambios"
          defaultValues={{ record_date: recordDate, liters }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between py-3">
      <div>
        <span className="font-mono tabular-nums text-ink">{recordDate}</span>
        <p className="text-sm text-ink-muted">
          <span className="font-mono tabular-nums">{liters} l</span>
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
