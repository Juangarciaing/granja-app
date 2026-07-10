import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfigForm } from "@/components/config/ConfigForm";
import type { ConfigActionState } from "@/lib/config/form-state";

describe("ConfigForm", () => {
  it("renders the base_kg and kg_per_piglet fields with a submit button", () => {
    render(
      <ConfigForm
        action={vi.fn(async () => ({ errors: {} }) satisfies ConfigActionState)}
        defaultValues={{ base_kg: 2, kg_per_piglet: 0.4 }}
      />,
    );

    expect(screen.getByLabelText("Ración base (kg)")).toBeInTheDocument();
    expect(screen.getByLabelText("Alimento por lechón (kg)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar cambios" }),
    ).toBeInTheDocument();
  });

  it("pre-fills fields from the current config row", () => {
    render(
      <ConfigForm
        action={vi.fn(async () => ({ errors: {} }) satisfies ConfigActionState)}
        defaultValues={{ base_kg: 2, kg_per_piglet: 0.4 }}
      />,
    );

    expect(screen.getByLabelText("Ración base (kg)")).toHaveValue(2);
    expect(screen.getByLabelText("Alimento por lechón (kg)")).toHaveValue(0.4);
  });

  it("submits the entered values through the injected action", async () => {
    const action = vi.fn<
      (state: ConfigActionState, formData: FormData) => Promise<ConfigActionState>
    >(async () => ({ errors: {} }));
    const user = userEvent.setup();

    render(
      <ConfigForm
        action={action}
        defaultValues={{ base_kg: 2, kg_per_piglet: 0.4 }}
      />,
    );

    await user.clear(screen.getByLabelText("Ración base (kg)"));
    await user.type(screen.getByLabelText("Ración base (kg)"), "2.5");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(action).toHaveBeenCalledTimes(1);
    const submittedFormData = action.mock.calls[0][1];
    expect(submittedFormData.get("base_kg")).toBe("2.5");
  });

  it("displays a validation error returned by the action", async () => {
    const action = vi.fn(
      async () =>
        ({
          errors: { base_kg: "La ración base debe ser un número mayor o igual a 0." },
        }) satisfies ConfigActionState,
    );
    const user = userEvent.setup();

    render(
      <ConfigForm
        action={action}
        defaultValues={{ base_kg: 2, kg_per_piglet: 0.4 }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La ración base debe ser un número mayor o igual a 0.",
    );
  });
});
