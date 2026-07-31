"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    router.replace("/cotizaciones");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
          Usuario
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ej: dsalinas"
          autoComplete="username"
          className="w-full pb-2.5 border-0 border-b-[1.5px] border-[#e5e9ee] text-[15px] outline-none bg-transparent text-[#0e2a43]"
        />
      </div>
      <div>
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          className="w-full pb-2.5 border-0 border-b-[1.5px] border-[#e5e9ee] text-[15px] outline-none bg-transparent text-[#0e2a43]"
        />
      </div>

      {error && <div className="text-sm text-[#991b1b]">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="mt-3 bg-[#0e2a43] text-white border-0 rounded-[9px] py-3.5 text-sm font-bold tracking-wide cursor-pointer hover:bg-[#123a5c] disabled:opacity-60"
      >
        {loading ? "Ingresando..." : "Entrar"}
      </button>
      <div className="text-xs text-[#c2cad3] text-center mt-0.5">
        Uso interno — Naviera GV S.A.
      </div>
    </form>
  );
}
