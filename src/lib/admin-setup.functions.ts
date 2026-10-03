import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const setupSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

/**
 * One-time bootstrap: creates the single admin account.
 * Refuses to run once an admin exists (also enforced by a unique index in the database).
 */
export const createFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => setupSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) {
      console.error("createFirstAdmin count", countError);
      return { ok: false as const, error: "Unable to complete setup. Please try again." };
    }
    if ((count ?? 0) > 0) {
      return { ok: false as const, error: "An admin account already exists. Please sign in." };
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      console.error("createFirstAdmin createUser", createError);
      return { ok: false as const, error: createError?.message ?? "Unable to create the admin account." };
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleError) {
      console.error("createFirstAdmin role", roleError);
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return { ok: false as const, error: "An admin account already exists. Please sign in." };
    }

    return { ok: true as const };
  });
