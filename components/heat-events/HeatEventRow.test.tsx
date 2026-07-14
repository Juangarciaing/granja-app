import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HeatEventRow } from "@/components/heat-events/HeatEventRow";
import type { HeatEventActionState } from "@/lib/heat-events/form-state";

function noopUpdateAction(): Promise<HeatEventActionState> {
  return Promise.resolve({ errors: {} });
}

describe("HeatEventRow", () => {
  it("shows the observed date and notes in view mode", () => {
    render(
      <HeatEventRow
        observedDate="2026-07-10"
        notes="Monta observada"
        updateAction={noopUpdateAction}
        deleteAction={vi.fn(async () => {})}
      />,
    );

    expect(screen.getByText("2026-07-10")).toBeInTheDocument();
    expect(screen.getByText("Monta observada")).toBeInTheDocument();
  });

  it("switches to an edit form pre-filled with the row's values when 'Editar' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <HeatEventRow
        observedDate="2026-07-10"
        notes="Monta observada"
        updateAction={noopUpdateAction}
        deleteAction={vi.fn(async () => {})}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByLabelText(/fecha de observaci/i)).toHaveValue(
      "2026-07-10",
    );
    expect(screen.getByLabelText(/notas/i)).toHaveValue("Monta observada");
  });

  it("returns to view mode when 'Cancelar' is clicked in edit mode", async () => {
    const user = userEvent.setup();
    render(
      <HeatEventRow
        observedDate="2026-07-10"
        notes={null}
        updateAction={noopUpdateAction}
        deleteAction={vi.fn(async () => {})}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/fecha de observaci/i),
    ).not.toBeInTheDocument();
  });

  it("calls deleteAction when 'Eliminar' is submitted", async () => {
    const deleteAction = vi.fn(async () => {});
    const user = userEvent.setup();
    render(
      <HeatEventRow
        observedDate="2026-07-10"
        notes={null}
        updateAction={noopUpdateAction}
        deleteAction={deleteAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    await vi.waitFor(() => expect(deleteAction).toHaveBeenCalledTimes(1));
  });
});
