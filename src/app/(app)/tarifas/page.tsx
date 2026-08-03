import { requireAdmin } from "@/lib/admin-guard";
import { getTarifas } from "@/lib/tarifas";
import TarifasForm from "@/components/TarifasForm";

export default async function TarifasPage() {
  await requireAdmin();
  const tarifas = await getTarifas();

  return <TarifasForm initial={tarifas} />;
}
