import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Server-side gate for admin-only pages and actions. Redirects unauthenticated
 * users to /login and throws for authenticated non-admins so a server action
 * can't quietly succeed for a regular employee.
 */
export async function requireAdmin(): Promise<{ id: string; username: string }> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") {
    // Non-admins on an admin page: bounce them somewhere they *can* see.
    // Server actions still get the throw (see requireAdminForAction) so a
    // regular employee can't force one to succeed by crafting a request.
    redirect("/cotizaciones");
  }
  return { id: session.user.id, username: session.user.username };
}

/** For server actions: throws instead of redirecting so the action fails hard. */
export async function requireAdminForAction(): Promise<{ id: string; username: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");
  if (session.user.role !== "ADMIN") {
    throw new Error("No autorizado: se requiere rol de administrador.");
  }
  return { id: session.user.id, username: session.user.username };
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}
