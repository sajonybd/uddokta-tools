import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <DashboardNav />
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
         <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px] border-r min-h-[calc(100vh-4rem)]">
             <DashboardSidebar />
         </aside> 
        <main className="flex w-full flex-1 flex-col overflow-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
