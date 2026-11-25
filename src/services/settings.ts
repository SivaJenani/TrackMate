import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAuthFrozen, getDemoStore } from "@/lib/demo-store";

export async function getUserSettings() {
  if (isAuthFrozen()) {
    return { data: getDemoStore().settings, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("user_settings").select("*").eq("user_id", user.id).single();
}

export async function updateUserSettings(data: Record<string, unknown>) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    store.settings = { ...store.settings, ...data, updated_at: new Date().toISOString() };
    return { data: store.settings, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("user_settings").update(data).eq("user_id", user.id).select().single();
}

export async function getUserProfile() {
  if (isAuthFrozen()) {
    return { data: getDemoStore().user, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("users").select("*").eq("id", user.id).single();
}

export async function updateUserProfile(data: { full_name?: string; avatar_url?: string }) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    store.user = { ...store.user, ...data, updated_at: new Date().toISOString() };
    return { data: store.user, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error: metaError } = await supabase.auth.updateUser({
    data: { full_name: data.full_name, avatar_url: data.avatar_url },
  });
  if (metaError) return { data: null, error: metaError };

  return supabase.from("users").update(data).eq("id", user.id).select().single();
}
