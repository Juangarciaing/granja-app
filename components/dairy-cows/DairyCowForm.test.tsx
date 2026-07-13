import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DairyCowForm } from "@/components/dairy-cows/DairyCowForm";
import type { DairyCowActionState } from "@/lib/dairy-cows/form-state";

describe("DairyCowForm", () => {
  it("renders the ear_tag field with a submit button", () => {
    render(
      <DairyCowForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies DairyCowActionState,
        )}
        submitLabel="Registrar"
      />,
    );

    expect(screen.getByLabelText("Arete")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrar" }),
    ).toBeInTheDocument();
  });

  it("submits the entered ear_tag through the injected action", async () => {
    const action = vi.fn<
      (
        state: DairyCowActionState,
        formData: FormData,
      ) => Promise<DairyCowActionState>
    >(async () => ({ errors: {} }));

    render(<DairyCowForm action={action} submitLabel="Registrar" />);

    fireEvent.change(screen.getByLabelText("Arete"), {
      target: { value: "C-104" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await vi.waitFor(() => expect(action).toHaveBeenCalled());

    const submittedFormData = action.mock.calls[0][1];
    expect(submittedFormData.get("ear_tag")).toBe("C-104");
  });

  it("displays the ear_tag validation error returned by the action", async () => {
    const action = vi.fn(
      async () =>
        ({
          errors: { ear_tag: "El ear_tag es obligatorio." },
        }) satisfies DairyCowActionState,
    );
    const user = userEvent.setup();

    render(<DairyCowForm action={action} submitLabel="Registrar" />);

    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El ear_tag es obligatorio.",
    );
  });
});
