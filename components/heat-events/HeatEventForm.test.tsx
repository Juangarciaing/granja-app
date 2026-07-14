import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HeatEventForm } from "@/components/heat-events/HeatEventForm";
import type { HeatEventActionState } from "@/lib/heat-events/form-state";

describe("HeatEventForm", () => {
  it("renders the observed date and notes fields with a submit button", () => {
    render(
      <HeatEventForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies HeatEventActionState,
        )}
        submitLabel="Registrar celo"
      />,
    );

    expect(screen.getByLabelText(/fecha de observaci/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notas/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrar celo" }),
    ).toBeInTheDocument();
  });

  it("submits the entered values through the injected action", async () => {
    const action = vi.fn<
      (
        state: HeatEventActionState,
        formData: FormData,
      ) => Promise<HeatEventActionState>
    >(async () => ({ errors: {} }));

    render(<HeatEventForm action={action} submitLabel="Registrar celo" />);

    fireEvent.change(screen.getByLabelText(/fecha de observaci/i), {
      target: { value: "2026-07-10" },
    });
    fireEvent.change(screen.getByLabelText(/notas/i), {
      target: { value: "Monta observada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar celo" }));

    await vi.waitFor(() => expect(action).toHaveBeenCalled());

    const submittedFormData = action.mock.calls[0][1];
    expect(submittedFormData.get("observed_date")).toBe("2026-07-10");
    expect(submittedFormData.get("notes")).toBe("Monta observada");
  });

  it("displays the observed_date validation error returned by the action", async () => {
    const action = vi.fn(
      async () =>
        ({
          errors: { observed_date: "La fecha de observación es obligatoria." },
        }) satisfies HeatEventActionState,
    );
    const user = userEvent.setup();

    render(<HeatEventForm action={action} submitLabel="Registrar celo" />);

    await user.click(screen.getByRole("button", { name: "Registrar celo" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La fecha de observación es obligatoria.",
    );
  });

  it("pre-fills the fields from defaultValues, for editing an existing event", () => {
    render(
      <HeatEventForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies HeatEventActionState,
        )}
        submitLabel="Guardar cambios"
        defaultValues={{ observed_date: "2026-07-01", notes: "Celo leve" }}
      />,
    );

    expect(screen.getByLabelText(/fecha de observaci/i)).toHaveValue(
      "2026-07-01",
    );
    expect(screen.getByLabelText(/notas/i)).toHaveValue("Celo leve");
  });

  it("calls onCancel when the cancel button is clicked, without submitting", async () => {
    const action = vi.fn(
      async () => ({ errors: {} }) satisfies HeatEventActionState,
    );
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <HeatEventForm
        action={action}
        submitLabel="Guardar cambios"
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(action).not.toHaveBeenCalled();
  });
});
