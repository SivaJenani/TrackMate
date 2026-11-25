import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAuthFrozen, getDemoStore } from "@/lib/demo-store";
import type { NotificationType } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function getNotifications(unreadOnly = false) {
  if (isAuthFrozen()) {
    let items = getDemoStore().notifications;
    if (unreadOnly) items = items.filter((n) => !n.is_read);
    return { data: items, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase.from("notifications").select("*").eq("user_id", user.id);
  if (unreadOnly) query = query.eq("is_read", false);
  return query.order("created_at", { ascending: false });
}

export async function markAsRead(notificationId: string) {
  if (isAuthFrozen()) {
    const item = getDemoStore().notifications.find((n) => n.id === notificationId);
    if (item) item.is_read = true;
    return { error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("notifications").update({ is_read: true }).eq("id", notificationId).eq("user_id", user.id);
}

export async function markAllAsRead() {
  if (isAuthFrozen()) {
    getDemoStore().notifications.forEach((n) => { n.is_read = true; });
    return { error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
}

export async function deleteNotification(notificationId: string) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    store.notifications = store.notifications.filter((n) => n.id !== notificationId);
    return { error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("notifications").delete().eq("id", notificationId).eq("user_id", user.id);
}

export async function createNotification(data: { title: string; message: string; type?: string }) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    const item = {
      id: uuidv4(),
      user_id: store.user.id,
      title: data.title,
      message: data.message,
      type: (data.type || "system") as NotificationType,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    store.notifications.unshift(item);
    return { data: item, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("notifications").insert({ ...data, user_id: user.id }).select().single();
}

export async function getUnreadCount() {
  if (isAuthFrozen()) {
    return getDemoStore().notifications.filter((n) => !n.is_read).length;
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false);
  return count || 0;
}
