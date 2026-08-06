import { createServerFn } from "@tanstack/react-start";
import { contactMessageSchema, newsletterSchema } from "./forms.schemas";

/** Result shape returned to the client — never leaks provider errors. */
export type FormResult = { ok: true; already?: boolean } | { ok: false; error: string };

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactMessageSchema.parse(input))
  .handler(async ({ data }): Promise<FormResult> => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const { error } = await supabase.from("contact_messages").insert({
      name: data.name,
      email: data.email.toLowerCase(),
      subject: data.subject || null,
      message: data.message,
      locale: data.locale,
    });

    if (error) {
      console.error("[contact] insert failed", error.code, error.message);
      return { ok: false, error: "insert_failed" };
    }

    return { ok: true };
  });

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => newsletterSchema.parse(input))
  .handler(async ({ data }): Promise<FormResult> => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: data.email.toLowerCase(),
      name: data.name || null,
      locale: data.locale,
    });

    // Unique violation → already on the list; treat as success.
    if (error && error.code === "23505") return { ok: true, already: true };

    if (error) {
      console.error("[newsletter] insert failed", error.code, error.message);
      return { ok: false, error: "insert_failed" };
    }

    return { ok: true };
  });
