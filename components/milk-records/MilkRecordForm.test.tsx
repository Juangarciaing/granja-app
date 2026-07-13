import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MilkRecordForm } from "@/components/milk-records/MilkRecordForm";
import type { MilkRecordActionState } from "@/lib/milk-records/form-state";

describe("MilkRecordForm", () => {
  it("renders the record date and liters fields with a submit button", () => {
    render(
      <MilkRecordForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies MilkRecordActionState,
        )}
        submitLabel="Registrar litros"
      />,
    );

    expect(screen.getByLabelText(/fecha del registro/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/litros/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrar litros" }),
    ).toBeInTheDocument();
  });

  it("submits the entered values through the injected action", async () => {
    const action = vi.fn<
      (
        state: MilkRecordActionState,
        formData: FormData,
      ) => Promise<MilkRecordActionState>
    >(async () => ({ errors: {} }));

    render(<MilkRecordForm action={action} submitLabel="Registrar litros" />);

    fireEvent.change(screen.getByLabelText(/fecha del registro/i), {
      target: { value: "2026-07-12" },
    });
    fireEvent.change(screen.getByLabelText(/litros/i), {
      target: { value: "18.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar litros" }));

    await vi.waitFor(() => expect(action).toHaveBeenCalled());

    const submittedFormData = action.mock.calls[0][1];
    expect(submittedFormData.get("record_date")).toBe("2026-07-12");
    expect(submittedFormData.get("liters")).toBe("18.5");
  });

  it("displays the duplicate-date error returned by the action on the record_date field", async () => {
    const action = vi.fn(
      async () =>
        ({
          errors: {
            record_date:
              "Ya existe un registro para esta vaca en esa fecha; edítalo en lugar de crear otro.",
          },
        }) satisfies MilkRecordActionState,
    );
    const user = userEvent.setup();

    render(<MilkRecordForm action={action} submitLabel="Registrar litros" />);

    await user.click(screen.getByRole("button", { name: "Registrar litros" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ya existe un registro para esta vaca en esa fecha; edítalo en lugar de crear otro.",
    );
  });

  it("pre-fills the fields from defaultValues, for editing an existing record", () => {
    render(
      <MilkRecordForm
        action={vi.fn(
          async () => ({ errors: {} }) satisfies MilkRecordActionState,
        )}
        submitLabel="Guardar cambios"
        defaultValues={{ record_date: "2026-07-01", liters: 20 }}
      />,
    );

    expect(screen.getByLabelText(/fecha del registro/i)).toHaveValue(
      "2026-07-01",
    );
    expect(screen.getByLabelText(/litros/i)).toHaveValue(20);
  });

  it("calls onCancel when the cancel button is clicked, without submitting", async () => {
    const action = vi.fn(
      async () => ({ errors: {} }) satisfies MilkRecordActionState,
    );
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <MilkRecordForm
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
