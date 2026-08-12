import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * CC list used by every automatic quote email: every active administrator
 * plus whoever created the quote, deduped, and never including the client's
 * own address twice.
 */
export async function ccAdminsAndCreator(quote: {
  correo: string;
  createdBy?: { email: string | null } | null;
}): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", active: true, email: { not: null } },
  });
  return Array.from(
    new Set(
      [quote.createdBy?.email, ...admins.map((a) => a.email)].filter(
        (e): e is string => Boolean(e) && e !== quote.correo
      )
    )
  );
}
