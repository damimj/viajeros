import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = { title: "Admin" };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-4 pt-16 lg:p-6 lg:pt-6">
        {children}
      </main>
    </div>
  );
}
