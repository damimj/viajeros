import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "@/components/shared/toast";

function TestApp({ message = "Hello!", type = "success" as "success" | "error" }) {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message, type)}>Show Toast</button>;
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("ToastProvider + useToast", () => {
  it("renders children", () => {
    renderWithProvider(<div data-testid="child">content</div>);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("shows a success toast when showToast is called", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestApp message="Saved successfully." type="success" />);
    await user.click(screen.getByRole("button", { name: "Show Toast" }));
    expect(screen.getByText("Saved successfully.")).toBeInTheDocument();
  });

  it("shows an error toast", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestApp message="Something went wrong." type="error" />);
    await user.click(screen.getByRole("button", { name: "Show Toast" }));
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("dismisses the toast on close button click", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestApp message="Dismiss me" type="success" />);
    await user.click(screen.getByRole("button", { name: "Show Toast" }));
    expect(screen.getByText("Dismiss me")).toBeInTheDocument();
    // The close button is the second button in the DOM (first is "Show Toast")
    const buttons = screen.getAllByRole("button");
    const closeBtn = buttons.find((b) => b !== screen.getByRole("button", { name: "Show Toast" }))!;
    await user.click(closeBtn);
    expect(screen.queryByText("Dismiss me")).not.toBeInTheDocument();
  });

  it("can show multiple toasts", async () => {
    const user = userEvent.setup();
    function MultiToast() {
      const { showToast } = useToast();
      return (
        <>
          <button onClick={() => showToast("First", "success")}>First</button>
          <button onClick={() => showToast("Second", "error")}>Second</button>
        </>
      );
    }
    renderWithProvider(<MultiToast />);
    await user.click(screen.getByRole("button", { name: "First" }));
    await user.click(screen.getByRole("button", { name: "Second" }));
    // Both the button and the toast span contain the text — just assert at least one exists
    expect(screen.getAllByText("First").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Second").length).toBeGreaterThanOrEqual(2);
  });

  it("useToast outside provider returns no-op (default context)", () => {
    // The default context provides a no-op showToast — should not throw
    function NoProvider() {
      const { showToast } = useToast();
      return <button onClick={() => showToast("test")}>Go</button>;
    }
    expect(() => render(<NoProvider />)).not.toThrow();
  });
});
