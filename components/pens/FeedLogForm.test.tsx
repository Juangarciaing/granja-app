import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FeedLogForm } from "@/components/pens/FeedLogForm";
import type { FeedLogActionState } from "@/lib/pens/form-state";

describe("FeedLogForm", () => {
  it("renders the log_date and kg_fed fields with a submit button", () => {
    render(
      <FeedLogForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies FeedLogActionState,
        )}
        submitLabel="Registrar alimento"
      />,
    );

    expect(screen.getByLabelText("Fecha del registro")).toBeInTheDocument();
    expect(screen.getByLabelText("Alimento (kg)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrar alimento" }),
    ).toBeInTheDocument();
  });

  it("submits the entered log_date and kg_fed through the injected action", async () => {
    const action = vi.fn<
      (
        state: FeedLogActionState,
        formData: FormData,
      ) => Promise<FeedLogActionState>
    >(async () => ({ errors: {} }));

    render(<FeedLogForm action={action} submitLabel="Registrar alimento" />);

    fireEvent.change(screen.getByLabelText("Fecha del registro"), {
      target: { value: "2026-07-13" },
    });
    fireEvent.change(screen.getByLabelText("Alimento (kg)"), {
      target: { value: "45.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar alimento" }));

    await vi.waitFor(() => expect(action).toHaveBeenCalled());

    const submittedFormData = action.mock.calls[0][1];
    expect(submittedFormData.get("log_date")).toBe("2026-07-13");
    expect(submittedFormData.get("kg_fed")).toBe("45.5");
  });

  it("displays the log_date validation error returned by the action (also used for duplicate-date guidance)", async () => {
    const action = vi.fn(
      async () =>
        ({
          errors: {
            log_date:
              "Ya existe un registro de alimento para este corral en esa fecha; edítalo en lugar de crear otro.",
          },
        }) satisfies FeedLogActionState,
    );
    const user = userEvent.setup();

    render(<FeedLogForm action={action} submitLabel="Registrar alimento" />);

    await user.click(screen.getByRole("button", { name: "Registrar alimento" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ya existe un registro de alimento para este corral en esa fecha",
    );
  });

  it("pre-fills fields from defaultValues when editing", () => {
    render(
      <FeedLogForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies FeedLogActionState,
        )}
        submitLabel="Guardar cambios"
        defaultValues={{ log_date: "2026-07-10", kg_fed: 40 }}
      />,
    );

    expect(screen.getByLabelText("Fecha del registro")).toHaveValue(
      "2026-07-10",
    );
    expect(screen.getByLabelText("Alimento (kg)")).toHaveValue(40);
  });

  it("renders a cancel button that calls onCancel when provided", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <FeedLogForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies FeedLogActionState,
        )}
        submitLabel="Guardar cambios"
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
