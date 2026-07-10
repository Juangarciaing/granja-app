import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FatteningPigForm } from "@/components/fattening-pigs/FatteningPigForm";
import type { FatteningPigActionState } from "@/lib/fattening-pigs/form-state";

describe("FatteningPigForm", () => {
  it("renders the arete, entry date and entry weight fields with a submit button", () => {
    render(
      <FatteningPigForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies FatteningPigActionState,
        )}
        submitLabel="Registrar"
      />,
    );

    expect(screen.getByLabelText("Arete")).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de ingreso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/peso inicial/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrar" }),
    ).toBeInTheDocument();
  });

  it("submits the entered values through the injected action", async () => {
    const action = vi.fn<
      (
        state: FatteningPigActionState,
        formData: FormData,
      ) => Promise<FatteningPigActionState>
    >(async () => ({ errors: {} }));

    render(<FatteningPigForm action={action} submitLabel="Registrar" />);

    fireEvent.change(screen.getByLabelText("Arete"), {
      target: { value: "A12" },
    });
    fireEvent.change(screen.getByLabelText(/fecha de ingreso/i), {
      target: { value: "2026-07-01" },
    });
    fireEvent.change(screen.getByLabelText(/peso inicial/i), {
      target: { value: "18.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await vi.waitFor(() => expect(action).toHaveBeenCalled());

    const submittedFormData = action.mock.calls[0][1];
    expect(submittedFormData.get("arete")).toBe("A12");
    expect(submittedFormData.get("fecha_ingreso")).toBe("2026-07-01");
    expect(submittedFormData.get("peso_inicial")).toBe("18.5");
  });

  it("displays the arete validation error returned by the action", async () => {
    const action = vi.fn(
      async () =>
        ({
          errors: { arete: "El arete es obligatorio." },
        }) satisfies FatteningPigActionState,
    );
    const user = userEvent.setup();

    render(<FatteningPigForm action={action} submitLabel="Registrar" />);

    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El arete es obligatorio.",
    );
  });
});
