// src/lib/supabaseClient.ts
import { supabase } from "./supabase";

export { supabase };

// Helper to get the current user on the server side
export const getServerUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return null;
    }
    return data.user;
  } catch (err) {
    return null;
  }
};
