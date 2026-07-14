import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PenForm } from "@/components/pens/PenForm";
import type { PenActionState } from "@/lib/pens/form-state";

describe("PenForm", () => {
  it("renders the name field with a submit button", () => {
    render(
      <PenForm
        action={vi.fn(async () => ({ errors: {} }) satisfies PenActionState)}
        submitLabel="Crear corral"
      />,
    );

    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Crear corral" }),
    ).toBeInTheDocument();
  });

  it("submits the entered name through the injected action", async () => {
    const action = vi.fn<
      (state: PenActionState, formData: FormData) => Promise<PenActionState>
    >(async () => ({ errors: {} }));

    render(<PenForm action={action} submitLabel="Crear corral" />);

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Corral 3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear corral" }));

    await vi.waitFor(() => expect(action).toHaveBeenCalled());

    const submittedFormData = action.mock.calls[0][1];
    expect(submittedFormData.get("name")).toBe("Corral 3");
  });

  it("displays the name validation error returned by the action", async () => {
    const action = vi.fn(
      async () =>
        ({
          errors: { name: "El nombre del corral es obligatorio." },
        }) satisfies PenActionState,
    );
    const user = userEvent.setup();

    render(<PenForm action={action} submitLabel="Crear corral" />);

    await user.click(screen.getByRole("button", { name: "Crear corral" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El nombre del corral es obligatorio.",
    );
  });

  it("pre-fills the name field from defaultValues when editing", () => {
    render(
      <PenForm
        action={vi.fn(async () => ({ errors: {} }) satisfies PenActionState)}
        submitLabel="Guardar cambios"
        defaultValues={{ name: "Corral 1" }}
      />,
    );

    expect(screen.getByLabelText("Nombre")).toHaveValue("Corral 1");
  });

  it("renders a cancel button that calls onCancel when provided", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <PenForm
        action={vi.fn(async () => ({ errors: {} }) satisfies PenActionState)}
        submitLabel="Guardar cambios"
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
