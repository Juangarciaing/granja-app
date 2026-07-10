import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WeightCheckinForm } from "@/components/weight-checkins/WeightCheckinForm";
import type { WeightCheckinActionState } from "@/lib/weight-checkins/form-state";

describe("WeightCheckinForm", () => {
  it("renders the checkin date and weight fields with a submit button", () => {
    render(
      <WeightCheckinForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies WeightCheckinActionState,
        )}
        submitLabel="Registrar pesaje"
      />,
    );

    expect(screen.getByLabelText(/fecha de pesaje/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/peso/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrar pesaje" }),
    ).toBeInTheDocument();
  });

  it("submits the entered values through the injected action", async () => {
    const action = vi.fn<
      (
        state: WeightCheckinActionState,
        formData: FormData,
      ) => Promise<WeightCheckinActionState>
    >(async () => ({ errors: {} }));

    render(<WeightCheckinForm action={action} submitLabel="Registrar pesaje" />);

    fireEvent.change(screen.getByLabelText(/fecha de pesaje/i), {
      target: { value: "2026-07-15" },
    });
    fireEvent.change(screen.getByLabelText(/peso/i), {
      target: { value: "22.3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar pesaje" }));

    await vi.waitFor(() => expect(action).toHaveBeenCalled());

    const submittedFormData = action.mock.calls[0][1];
    expect(submittedFormData.get("checkin_date")).toBe("2026-07-15");
    expect(submittedFormData.get("weight")).toBe("22.3");
  });

  it("displays the weight validation error returned by the action", async () => {
    const action = vi.fn(
      async () =>
        ({
          errors: { weight: "El peso debe ser un número mayor a 0." },
        }) satisfies WeightCheckinActionState,
    );
    const user = userEvent.setup();

    render(<WeightCheckinForm action={action} submitLabel="Registrar pesaje" />);

    await user.click(screen.getByRole("button", { name: "Registrar pesaje" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El peso debe ser un número mayor a 0.",
    );
  });

  it("pre-fills the fields from defaultValues, for editing an existing check-in", () => {
    render(
      <WeightCheckinForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies WeightCheckinActionState,
        )}
        submitLabel="Guardar cambios"
        defaultValues={{ checkin_date: "2026-07-01", weight: 20 }}
      />,
    );

    expect(screen.getByLabelText(/fecha de pesaje/i)).toHaveValue(
      "2026-07-01",
    );
    expect(screen.getByLabelText(/peso/i)).toHaveValue(20);
  });

  it("calls onCancel when the cancel button is clicked, without submitting", async () => {
    const action = vi.fn(
      async () => ({ errors: {} }) satisfies WeightCheckinActionState,
    );
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <WeightCheckinForm
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
