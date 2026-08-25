/**
 * Supabase auth boundary. Loaded via CDN ESM import since the app has no
 * bundler — this keeps auth isolated from UI code, same spirit as api.js.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://zhrtrcafpkxnsgjponmg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocnRyY2FmcGt4bnNnanBvbm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MjMyNDAsImV4cCI6MjEwMzQ5OTI0MH0._v3d_mO85gAFfKc_bdEguqg9EdGVxNPVN29Hp99aM_Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithOAuth(provider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin }
  });
  if (error) throw error;
}

export async function updatePassword(password) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
