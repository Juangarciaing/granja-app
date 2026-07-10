import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FatteningPigForm } from "@/components/fattening-pigs/FatteningPigForm";
import type { FatteningPigActionState } from "@/lib/fattening-pigs/form-state";

describe("FatteningPigForm", () => {
  it("renders the ear_tag, entry date and entry weight fields with a submit button", () => {
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
    expect(submittedFormData.get("ear_tag")).toBe("A12");
    expect(submittedFormData.get("entry_date")).toBe("2026-07-01");
    expect(submittedFormData.get("entry_weight")).toBe("18.5");
  });

  it("displays the ear_tag validation error returned by the action", async () => {
    const action = vi.fn(
      async () =>
        ({
          errors: { ear_tag: "El ear_tag es obligatorio." },
        }) satisfies FatteningPigActionState,
    );
    const user = userEvent.setup();

    render(<FatteningPigForm action={action} submitLabel="Registrar" />);

    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El ear_tag es obligatorio.",
    );
  });
});
