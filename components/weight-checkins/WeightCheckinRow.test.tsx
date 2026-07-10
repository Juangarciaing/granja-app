import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WeightCheckinRow } from "@/components/weight-checkins/WeightCheckinRow";
import type { WeightCheckinActionState } from "@/lib/weight-checkins/form-state";

function noopUpdateAction(): Promise<WeightCheckinActionState> {
  return Promise.resolve({ errors: {} });
}

describe("WeightCheckinRow", () => {
  it("shows the date, weight and a signed delta vs. entry_weight in view mode", () => {
    render(
      <WeightCheckinRow
        checkinDate="2026-07-15"
        weight={20}
        entryWeight={18.5}
        updateAction={noopUpdateAction}
        deleteAction={vi.fn(async () => {})}
      />,
    );

    expect(screen.getByText("2026-07-15")).toBeInTheDocument();
    expect(screen.getByText(/20 kg/)).toBeInTheDocument();
    expect(screen.getByText(/\+1\.50 kg/)).toBeInTheDocument();
  });

  it("shows a negative delta when the pig lost weight vs. entry_weight", () => {
    render(
      <WeightCheckinRow
        checkinDate="2026-07-15"
        weight={17}
        entryWeight={18.5}
        updateAction={noopUpdateAction}
        deleteAction={vi.fn(async () => {})}
      />,
    );

    expect(screen.getByText(/-1\.50 kg/)).toBeInTheDocument();
  });

  it("switches to an edit form pre-filled with the row's values when 'Editar' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <WeightCheckinRow
        checkinDate="2026-07-15"
        weight={20}
        entryWeight={18.5}
        updateAction={noopUpdateAction}
        deleteAction={vi.fn(async () => {})}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByLabelText(/fecha de pesaje/i)).toHaveValue(
      "2026-07-15",
    );
    expect(screen.getByLabelText(/peso/i)).toHaveValue(20);
  });

  it("returns to view mode when 'Cancelar' is clicked in edit mode", async () => {
    const user = userEvent.setup();
    render(
      <WeightCheckinRow
        checkinDate="2026-07-15"
        weight={20}
        entryWeight={18.5}
        updateAction={noopUpdateAction}
        deleteAction={vi.fn(async () => {})}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/fecha de pesaje/i)).not.toBeInTheDocument();
  });

  it("calls deleteAction when 'Eliminar' is submitted", async () => {
    const deleteAction = vi.fn(async () => {});
    const user = userEvent.setup();
    render(
      <WeightCheckinRow
        checkinDate="2026-07-15"
        weight={20}
        entryWeight={18.5}
        updateAction={noopUpdateAction}
        deleteAction={deleteAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    await vi.waitFor(() => expect(deleteAction).toHaveBeenCalledTimes(1));
  });
});
