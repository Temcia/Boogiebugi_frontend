import { createClient } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function sendOTP(phone: string) {
  const res = await fetch(`${API_URL}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  return res.json();
}

export async function verifyOTP(
  phone: string,
  otp: string,
  name?: string,
  email?: string
) {
  const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp, name, email }),
  });
  
  const data = await res.json();
  
  // If successful, save the session to Supabase so it sets the cookies
  if (data.success && data.data?.session) {
    const supabase = createClient();
    await supabase.auth.setSession({
      access_token: data.data.session.access_token,
      refresh_token: data.data.session.refresh_token,
    });
  }
  
  return data;
}

export async function signInWithGoogle() {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
