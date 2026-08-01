import Image from "next/image";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-6">
      <div className="w-full max-w-[900px] min-h-[520px] bg-white rounded-[20px] shadow-[0_20px_60px_-20px_rgba(14,42,67,0.18)] overflow-hidden flex flex-wrap">
        <div className="flex-1 basis-[380px] min-w-[300px] relative bg-[#0e2a43] flex flex-col justify-between p-11 px-10 overflow-hidden">
          <svg
            className="absolute -left-10 -bottom-[60px] opacity-50"
            width="320"
            height="220"
            viewBox="0 0 320 220"
            fill="none"
          >
            <path
              d="M0 170 C 70 130, 140 210, 220 150 S 340 140, 400 90"
              stroke="#1f6fb8"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M-20 200 C 60 160, 150 230, 230 175 S 350 165, 410 120"
              stroke="#f5a623"
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
            />
          </svg>
          <div className="relative">
            <Image
              src="/assets/logo-icon.png"
              alt="Naviera GV"
              width={56}
              height={56}
              unoptimized
              className="object-contain bg-white rounded-xl p-1"
            />
          </div>
          <div className="relative text-white">
            <div className="text-[32px] font-extrabold tracking-tight leading-tight">
              Cotizador
            </div>
            <div className="text-sm text-[#93a9bd] mt-2.5 tracking-wide">
              Transporte Marítimo
            </div>
          </div>
        </div>

        <div className="flex-1 basis-[380px] min-w-[300px] flex items-center justify-center py-14 px-11">
          <div className="w-full max-w-[300px]">
            <div className="text-xl font-bold mb-0.5 text-[#0e2a43] tracking-tight">
              Acceso usuarios
            </div>
            <div className="text-[13px] text-[#94a3b8] mb-8">
              Ingresa con tu correo de Naviera GV
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
