import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SowForm } from "@/components/sows/SowForm";
import type { SowActionState } from "@/lib/sows/form-state";

describe("SowForm", () => {
  it("renders the Arete field and submit label", () => {
    render(
      <SowForm
        action={vi.fn(async () => ({ errors: {} }) satisfies SowActionState)}
        submitLabel="Registrar"
      />,
    );

    expect(screen.getByLabelText("Arete")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrar" }),
    ).toBeInTheDocument();
  });

  it("pre-fills fields from defaultValues for editing an existing sow", () => {
    render(
      <SowForm
        action={vi.fn(async () => ({ errors: {} }) satisfies SowActionState)}
        defaultValues={{ name: "Cerda 12", status: "sold" }}
        submitLabel="Guardar cambios"
      />,
    );

    expect(screen.getByLabelText("Arete")).toHaveValue("Cerda 12");
    expect(screen.getByLabelText("Estado")).toHaveValue("sold");
  });

  it("submits the entered values through the injected action", async () => {
    const action = vi.fn<
      (state: SowActionState, formData: FormData) => Promise<SowActionState>
    >(async () => ({ errors: {} }));
    const user = userEvent.setup();

    render(<SowForm action={action} submitLabel="Registrar" />);

    await user.type(screen.getByLabelText("Arete"), "Cerda 99");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(action).toHaveBeenCalledTimes(1);
    const submittedFormData = action.mock.calls[0][1];
    expect(submittedFormData.get("name")).toBe("Cerda 99");
  });

  it("displays the name validation error returned by the action", async () => {
    const action = vi.fn(
      async () =>
        ({ errors: { name: "El arete/nombre es obligatorio." } }) satisfies SowActionState,
    );
    const user = userEvent.setup();

    render(<SowForm action={action} submitLabel="Registrar" />);

    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("El arete/nombre es obligatorio.");
  });
});
