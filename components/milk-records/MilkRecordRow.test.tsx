import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MilkRecordRow } from "@/components/milk-records/MilkRecordRow";
import type { MilkRecordActionState } from "@/lib/milk-records/form-state";

function noopUpdateAction(): Promise<MilkRecordActionState> {
  return Promise.resolve({ errors: {} });
}

describe("MilkRecordRow", () => {
  it("shows the record date and liters in view mode", () => {
    render(
      <MilkRecordRow
        recordDate="2026-07-12"
        liters={18.5}
        updateAction={noopUpdateAction}
        deleteAction={vi.fn(async () => {})}
      />,
    );

    expect(screen.getByText("2026-07-12")).toBeInTheDocument();
    expect(screen.getByText(/18.5 l/)).toBeInTheDocument();
  });

  it("switches to an edit form pre-filled with the row's values when 'Editar' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MilkRecordRow
        recordDate="2026-07-12"
        liters={18.5}
        updateAction={noopUpdateAction}
        deleteAction={vi.fn(async () => {})}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByLabelText(/fecha del registro/i)).toHaveValue(
      "2026-07-12",
    );
    expect(screen.getByLabelText(/litros/i)).toHaveValue(18.5);
  });

  it("returns to view mode when 'Cancelar' is clicked in edit mode", async () => {
    const user = userEvent.setup();
    render(
      <MilkRecordRow
        recordDate="2026-07-12"
        liters={18.5}
        updateAction={noopUpdateAction}
        deleteAction={vi.fn(async () => {})}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/fecha del registro/i),
    ).not.toBeInTheDocument();
  });

  it("calls deleteAction when 'Eliminar' is submitted", async () => {
    const deleteAction = vi.fn(async () => {});
    const user = userEvent.setup();
    render(
      <MilkRecordRow
        recordDate="2026-07-12"
        liters={18.5}
        updateAction={noopUpdateAction}
        deleteAction={deleteAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    await vi.waitFor(() => expect(deleteAction).toHaveBeenCalledTimes(1));
  });
});
