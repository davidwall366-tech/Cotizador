"use client";

import { useState, useTransition } from "react";
import { sendQuoteByEmail } from "@/app/actions/integrations";

export default function IntegrationActions({
  quoteId,
  gmailEnabled,
}: {
  quoteId: string;
  gmailEnabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleEmail() {
    setMessage(null);
    startTransition(async () => {
      try {
        await sendQuoteByEmail(quoteId);
        setMessage("Correo enviado al cliente (con copia al administrador y a quien creó la cotización).");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "No se pudo enviar el correo.");
      }
    });
  }

  return (
    <div className="no-print w-full max-w-[760px] mt-4 bg-white border border-[#e2e8f0] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleEmail}
          disabled={!gmailEnabled || isPending}
          title={gmailEnabled ? undefined : "Configura GMAIL_USER / GMAIL_APP_PASSWORD en .env"}
          className="bg-transparent border border-[#d7dee6] text-[#0e2a43] rounded-lg px-4 py-2.5 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Enviar por correo al cliente
        </button>
      </div>

      {!gmailEnabled && (
        <div className="text-xs text-[#94a3b8]">
          El envío por correo aún no está configurado — este botón se activa al definir las
          credenciales en el servidor. El respaldo en Dropbox ocurre automáticamente al guardar.
        </div>
      )}

      {message && <div className="text-sm text-[#334155]">{message}</div>}
    </div>
  );
}
