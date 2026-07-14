import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FeedLogRow } from "@/components/pens/FeedLogRow";
import type { FeedLogActionState } from "@/lib/pens/form-state";

describe("FeedLogRow", () => {
  it("shows the log date and kg fed in read-only mode", () => {
    render(
      <FeedLogRow
        logDate="2026-07-12"
        kgFed={50}
        updateAction={vi.fn(
          async () => ({ errors: {} }) satisfies FeedLogActionState,
        )}
        deleteAction={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByText("2026-07-12")).toBeInTheDocument();
    expect(screen.getByText("50 kg")).toBeInTheDocument();
  });

  it("toggles to an edit form pre-filled with the row's values", async () => {
    const user = userEvent.setup();

    render(
      <FeedLogRow
        logDate="2026-07-12"
        kgFed={50}
        updateAction={vi.fn(
          async () => ({ errors: {} }) satisfies FeedLogActionState,
        )}
        deleteAction={vi.fn(async () => undefined)}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByLabelText("Fecha del registro")).toHaveValue(
      "2026-07-12",
    );
    expect(screen.getByLabelText("Alimento (kg)")).toHaveValue(50);
  });

  it("submits the delete form via the injected deleteAction", async () => {
    const deleteAction = vi.fn(async () => undefined);
    const user = userEvent.setup();

    render(
      <FeedLogRow
        logDate="2026-07-12"
        kgFed={50}
        updateAction={vi.fn(
          async () => ({ errors: {} }) satisfies FeedLogActionState,
        )}
        deleteAction={deleteAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(deleteAction).toHaveBeenCalled();
  });
});
