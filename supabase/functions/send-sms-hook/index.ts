import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

Deno.serve(async (req) => {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  // Verify webhook signature from Supabase Auth
  const hookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
  if (!hookSecret) {
    return new Response(
      JSON.stringify({ error: "Hook secret not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const wh = new Webhook(hookSecret);

  let data: { user: { phone: string }; sms: { otp: string } };
  try {
    data = wh.verify(payload, headers) as typeof data;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid signature" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Send OTP via MSG91 Flow API
  const { user, sms } = data;
  const phone = user.phone.replace("+", ""); // MSG91 expects 919812345678

  const authKey = Deno.env.get("MSG91_AUTH_KEY");
  const templateId = Deno.env.get("MSG91_TEMPLATE_ID");

  if (!authKey || !templateId) {
    console.error("MSG91 credentials not configured");
    return new Response(
      JSON.stringify({ error: "MSG91 not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const response = await fetch("https://control.msg91.com/api/v5/flow", {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: templateId,
        recipients: [{ mobiles: phone, var1: sms.otp }],
      }),
    });

    const result = await response.json();
    console.log("MSG91 response:", JSON.stringify(result));

    if (!response.ok) {
      console.error("MSG91 error:", result);
      return new Response(
        JSON.stringify({ error: "SMS delivery failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("MSG91 send failed:", err);
    return new Response(
      JSON.stringify({ error: "SMS send failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
