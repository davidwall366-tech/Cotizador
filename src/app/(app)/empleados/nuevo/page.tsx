import { requireAdmin } from "@/lib/admin-guard";
import EmployeeForm from "@/components/EmployeeForm";

export default async function NuevoEmpleadoPage() {
  await requireAdmin();
  return <EmployeeForm mode="new" initial={{ role: "EMPLEADO", active: true }} />;
}
