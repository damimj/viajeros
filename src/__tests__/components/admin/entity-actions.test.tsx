import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityActions } from "@/components/admin/entity-actions";
import { ToastProvider } from "@/components/shared/toast";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function renderEntityActions(props: {
  onDelete: () => Promise<void>;
  redirectPath?: string;
}) {
  return render(
    <ToastProvider>
      <EntityActions {...props} />
    </ToastProvider>,
  );
}

describe("EntityActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the delete button", () => {
    renderEntityActions({ onDelete: vi.fn().mockResolvedValue(undefined) });
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("shows confirmation text after first click", async () => {
    const user = userEvent.setup();
    renderEntityActions({ onDelete: vi.fn().mockResolvedValue(undefined) });
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText(/confirmDelete/i)).toBeInTheDocument();
  });

  it("calls onDelete on second click (confirmed)", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    renderEntityActions({ onDelete });
    const btn = screen.getByRole("button", { name: /delete/i });
    await user.click(btn);
    await user.click(btn);
    await waitFor(() => expect(onDelete).toHaveBeenCalledOnce());
  });

  it("shows deleted toast on success", async () => {
    const user = userEvent.setup();
    renderEntityActions({ onDelete: vi.fn().mockResolvedValue(undefined) });
    const btn = screen.getByRole("button", { name: /delete/i });
    await user.click(btn);
    await user.click(btn);
    await waitFor(() => expect(screen.getByText("deleted")).toBeInTheDocument());
  });

  it("navigates to redirectPath after delete", async () => {
    const user = userEvent.setup();
    renderEntityActions({
      onDelete: vi.fn().mockResolvedValue(undefined),
      redirectPath: "/admin/trips",
    });
    const btn = screen.getByRole("button", { name: /delete/i });
    await user.click(btn);
    await user.click(btn);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin/trips"));
  });

  it("does not navigate when no redirectPath", async () => {
    const user = userEvent.setup();
    renderEntityActions({ onDelete: vi.fn().mockResolvedValue(undefined) });
    const btn = screen.getByRole("button", { name: /delete/i });
    await user.click(btn);
    await user.click(btn);
    await waitFor(() => expect(screen.getByText("deleted")).toBeInTheDocument());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows error toast on delete failure", async () => {
    const user = userEvent.setup();
    renderEntityActions({
      onDelete: vi.fn().mockRejectedValue(new Error("Delete failed")),
    });
    const btn = screen.getByRole("button", { name: /delete/i });
    await user.click(btn);
    await user.click(btn);
    await waitFor(() => expect(screen.getByText("error")).toBeInTheDocument());
  });

  it("resets confirming state on error", async () => {
    const user = userEvent.setup();
    renderEntityActions({
      onDelete: vi.fn().mockRejectedValue(new Error("Fail")),
    });
    const btn = screen.getByRole("button", { name: /delete/i });
    await user.click(btn);
    await user.click(btn);
    await waitFor(() => expect(screen.queryByText(/confirmDelete/i)).not.toBeInTheDocument());
  });
});
