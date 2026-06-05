import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import { GuildProvider } from "@/lib/GuildContext";
import { I18nProvider } from "@/lib/i18n";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <I18nProvider>
      <GuildProvider>
        <div className="flex min-h-screen bg-dark-900">
          <Sidebar user={session.user as any} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </GuildProvider>
    </I18nProvider>
  );
}
