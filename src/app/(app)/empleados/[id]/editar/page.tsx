import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import EmployeeForm from "@/components/EmployeeForm";

export default async function EditarEmpleadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <EmployeeForm
      mode="edit"
      employeeId={user.id}
      isSelf={admin.id === user.id}
      initial={{
        username: user.username,
        nombre: user.nombre,
        email: user.email ?? "",
        role: user.role,
        active: user.active,
      }}
    />
  );
}
