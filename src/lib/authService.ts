// src/lib/authService.ts
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

/**
 * Retrieves the current user on the server side.
 * Returns null if no active session.
 */
export const getServerUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Supabase getUser error:", error);
    return null;
  }
  return data?.user ?? null;
};

/**
 * Helper to extract a custom role claim from the JWT.
 * The role should be stored in the `app_metadata` or `user_metadata` field
 * when the user is created (e.g., { role: "vendor" }).
 * Returns the role string or null if not defined.
 */
export const getUserRole = async (): Promise<string | null> => {
  const user = await getServerUser();
  if (!user) return null;
  // Example: role stored in user.app_metadata.role
  // Adjust according to how you store the role in Supabase.
  // @ts-ignore – supabase types may not include custom fields.
  const role = (user?.app_metadata as any)?.role ?? (user?.user_metadata as any)?.role;
  return role ?? null;
};
