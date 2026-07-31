import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";
  // /imprimir is only ever hit by the internal PDF renderer (see lib/pdf.ts),
  // which has no session cookie — it gates access with its own signed token.
  const isPrintRoute = req.nextUrl.pathname.startsWith("/imprimir/");

  if (isPrintRoute) return;

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/cotizaciones", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
