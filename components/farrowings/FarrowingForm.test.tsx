import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FarrowingForm } from "@/components/farrowings/FarrowingForm";
import type { FarrowingActionState } from "@/lib/farrowings/form-state";

describe("FarrowingForm", () => {
  it("renders the farrowing date and born-alive fields with a submit button", () => {
    render(<FarrowingForm action={vi.fn()} />);

    expect(screen.getByLabelText(/fecha de parto/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/lechones nacidos vivos/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /registrar parto/i }),
    ).toBeInTheDocument();
  });

  it("submits the entered values through the injected action", async () => {
    const action = vi
      .fn<
        (
          state: FarrowingActionState,
          formData: FormData,
        ) => Promise<FarrowingActionState>
      >()
      .mockResolvedValue({ errors: {} });

    render(<FarrowingForm action={action} />);

    fireEvent.change(screen.getByLabelText(/fecha de parto/i), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText(/lechones nacidos vivos/i), {
      target: { value: "8" },
    });
    fireEvent.click(screen.getByRole("button", { name: /registrar parto/i }));

    await vi.waitFor(() => expect(action).toHaveBeenCalled());

    const submittedFormData = action.mock.calls[0][1];
    expect(submittedFormData.get("farrowing_date")).toBe("2026-06-01");
    expect(submittedFormData.get("born_alive")).toBe("8");
  });

  it("displays a returned validation error", async () => {
    const action = vi
      .fn<
        (
          state: FarrowingActionState,
          formData: FormData,
        ) => Promise<FarrowingActionState>
      >()
      .mockResolvedValue({
        errors: { born_alive: "El número de lechones es obligatorio." },
      });

    render(<FarrowingForm action={action} />);

    fireEvent.click(screen.getByRole("button", { name: /registrar parto/i }));

    expect(
      await screen.findByText("El número de lechones es obligatorio."),
    ).toBeInTheDocument();
  });
});
