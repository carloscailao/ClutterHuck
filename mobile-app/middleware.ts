// mobile-app/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "./lib/supabaseClient";
import type { Profiles } from "./types/supabase";

const publicPaths = ["/welcome", "/register", "/name", "/avatar"];

function getNextOnboardingStep(user: Profiles) {
  if (!user.firstName || !user.lastName || !user.username) return "/name";
  if (!user.avatar_url) return "/avatar";
  return "/home";
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Redirect signed-out users
  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/welcome", req.url));
  }

  // Signed-in users
  if (token) {
    // Fetch profile
    const { data: profile, error } = await supabase
    .from("profiles") // still string, but we'll type correctly below
    .select("*")
    .eq("auth_uid", token?.sub!) // ensure token.sub is defined
    .single();

    // If profile not found → redirect to register
    if (error || !profile) {
      return NextResponse.redirect(new URL("/register", req.url));
    }

    const nextStep = getNextOnboardingStep(profile);

    // Redirect if accessing onboarding pages or incomplete
    if ((publicPaths.some((p) => pathname.startsWith(p)) || pathname !== nextStep) && nextStep !== "/home") {
      return NextResponse.redirect(new URL(nextStep, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|.*\\..*).*)"],
};
