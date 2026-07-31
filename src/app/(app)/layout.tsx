import { auth } from "@/auth";
import Topbar from "@/components/Topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        nombre={session?.user?.name || session?.user?.username || "Empleado"}
        isAdmin={isAdmin}
      />
      {children}
    </div>
  );
}
