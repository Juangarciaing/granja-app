import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SaleWeightConfigForm } from "@/components/config/SaleWeightConfigForm";
import type { SaleWeightConfigActionState } from "@/lib/config/sale-weight-form-state";

describe("SaleWeightConfigForm", () => {
  it("renders the target_weight_kg field with a submit button", () => {
    render(
      <SaleWeightConfigForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies SaleWeightConfigActionState,
        )}
        defaultValues={{ target_weight_kg: 100 }}
      />,
    );

    expect(screen.getByLabelText("Peso objetivo de venta (kg)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar cambios" }),
    ).toBeInTheDocument();
  });

  it("pre-fills the field from the current sale-weight config row", () => {
    render(
      <SaleWeightConfigForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies SaleWeightConfigActionState,
        )}
        defaultValues={{ target_weight_kg: 100 }}
      />,
    );

    expect(screen.getByLabelText("Peso objetivo de venta (kg)")).toHaveValue(100);
  });

  it("submits the entered value through the injected action", async () => {
    const action = vi.fn<
      (
        state: SaleWeightConfigActionState,
        formData: FormData,
      ) => Promise<SaleWeightConfigActionState>
    >(async () => ({ errors: {} }));
    const user = userEvent.setup();

    render(
      <SaleWeightConfigForm action={action} defaultValues={{ target_weight_kg: 100 }} />,
    );

    await user.clear(screen.getByLabelText("Peso objetivo de venta (kg)"));
    await user.type(screen.getByLabelText("Peso objetivo de venta (kg)"), "110");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(action).toHaveBeenCalledTimes(1);
    const submittedFormData = action.mock.calls[0][1];
    expect(submittedFormData.get("target_weight_kg")).toBe("110");
  });

  it("displays a validation error returned by the action", async () => {
    const action = vi.fn(
      async () =>
        ({
          errors: { target_weight_kg: "El peso objetivo debe ser un número mayor a 0." },
        }) satisfies SaleWeightConfigActionState,
    );
    const user = userEvent.setup();

    render(
      <SaleWeightConfigForm action={action} defaultValues={{ target_weight_kg: 100 }} />,
    );

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El peso objetivo debe ser un número mayor a 0.",
    );
  });
});
