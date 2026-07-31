"use client";

import { useState, useTransition } from "react";
import { exportQuoteToDropbox, sendQuoteByEmail } from "@/app/actions/integrations";

export default function IntegrationActions({
  quoteId,
  dropboxEnabled,
  gmailEnabled,
}: {
  quoteId: string;
  dropboxEnabled: boolean;
  gmailEnabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ccMe, setCcMe] = useState(false);

  function handleDropbox() {
    setMessage(null);
    startTransition(async () => {
      try {
        const { path } = await exportQuoteToDropbox(quoteId);
        setMessage(`Guardado en Dropbox: ${path}`);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "No se pudo guardar en Dropbox.");
      }
    });
  }

  function handleEmail() {
    setMessage(null);
    startTransition(async () => {
      try {
        await sendQuoteByEmail(quoteId, { ccMe });
        setMessage("Correo enviado al cliente.");
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
          onClick={handleDropbox}
          disabled={!dropboxEnabled || isPending}
          title={dropboxEnabled ? undefined : "Configura DROPBOX_APP_KEY / DROPBOX_APP_SECRET / DROPBOX_REFRESH_TOKEN en .env"}
          className="bg-transparent border border-[#d7dee6] text-[#0e2a43] rounded-lg px-4 py-2.5 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Guardar en Dropbox
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEmail}
            disabled={!gmailEnabled || isPending}
            title={gmailEnabled ? undefined : "Configura GMAIL_USER / GMAIL_APP_PASSWORD en .env"}
            className="bg-transparent border border-[#d7dee6] text-[#0e2a43] rounded-lg px-4 py-2.5 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Enviar por correo al cliente
          </button>
          <label className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <input
              type="checkbox"
              checked={ccMe}
              onChange={(e) => setCcMe(e.target.checked)}
              disabled={!gmailEnabled}
            />
            Copiarme
          </label>
        </div>
      </div>

      {!dropboxEnabled && !gmailEnabled && (
        <div className="text-xs text-[#94a3b8]">
          Dropbox y Gmail aún no están configurados — estos botones se activan al definir sus
          credenciales en el servidor.
        </div>
      )}

      {message && <div className="text-sm text-[#334155]">{message}</div>}
    </div>
  );
}
