/**
 * Gupshup WhatsApp + SMS integration for kaamdha
 *
 * Sends WhatsApp messages when a user "connects" (reveals a phone number).
 * Strategy: try WhatsApp template first, fall back to session text message,
 * then fall back to SMS. Never blocks the reveal flow on failure.
 */

const GUPSHUP_WHATSAPP_URL = "https://api.gupshup.io/wa/api/v1/msg";
const GUPSHUP_SMS_URL = "https://enterprise.smsgupshup.com/GatewayAPI/rest";

const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY ?? "";
const GUPSHUP_APP_NAME = process.env.GUPSHUP_APP_NAME ?? "";
const GUPSHUP_WHATSAPP_NUMBER = process.env.GUPSHUP_WHATSAPP_NUMBER ?? "";

// Template IDs — update these once templates are approved in Gupshup dashboard
const TEMPLATE_LEAD_CONNECT = "lead_connect";
const TEMPLATE_LEAD_NOTIFY = "lead_notify";

export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface LeadConnectParams {
  /** Phone of the requester (who wants the contact) */
  recipientPhone: string;
  /** Name of the revealed person */
  name: string;
  /** Phone number of the revealed person (unmasked, raw from DB) */
  phone: string;
  /** Category label, e.g. "Maid" */
  category: string;
  /** Locality, e.g. "Sector 56, Gurgaon" */
  locality: string;
}

interface LeadNotifyParams {
  /** Phone of the person whose number was revealed */
  recipientPhone: string;
  /** Name of the viewer */
  viewerName: string;
  /** Locality of the viewer */
  viewerLocality: string;
}

/**
 * Normalize phone to 91XXXXXXXXXX format for Gupshup.
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/**
 * Format a phone number for display: +91 XXX-XXX-XXXX
 */
function displayPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "").slice(-10);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

// ---------------------------------------------------------------------------
// WhatsApp messaging
// ---------------------------------------------------------------------------

/**
 * Send a WhatsApp template message via Gupshup.
 */
async function sendWhatsAppTemplate(
  destination: string,
  templateId: string,
  params: string[]
): Promise<WhatsAppResult> {
  const body = new URLSearchParams({
    channel: "whatsapp",
    source: normalizePhone(GUPSHUP_WHATSAPP_NUMBER),
    destination,
    "src.name": GUPSHUP_APP_NAME,
    template: JSON.stringify({ id: templateId, params }),
  });

  try {
    const res = await fetch(GUPSHUP_WHATSAPP_URL, {
      method: "POST",
      headers: {
        apikey: GUPSHUP_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await res.json();

    if (res.ok && data.status === "submitted") {
      return { success: true, messageId: data.messageId };
    }

    return {
      success: false,
      error: `Template send failed: ${data.message ?? res.statusText}`,
    };
  } catch (err) {
    return { success: false, error: `Template send error: ${String(err)}` };
  }
}

/**
 * Send a plain text (session) WhatsApp message via Gupshup.
 * Only works if the user has messaged the business number in the last 24 hours.
 */
async function sendWhatsAppText(
  destination: string,
  text: string
): Promise<WhatsAppResult> {
  const body = new URLSearchParams({
    channel: "whatsapp",
    source: normalizePhone(GUPSHUP_WHATSAPP_NUMBER),
    destination,
    "src.name": GUPSHUP_APP_NAME,
    message: JSON.stringify({ type: "text", text }),
  });

  try {
    const res = await fetch(GUPSHUP_WHATSAPP_URL, {
      method: "POST",
      headers: {
        apikey: GUPSHUP_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await res.json();

    if (res.ok && data.status === "submitted") {
      return { success: true, messageId: data.messageId };
    }

    return {
      success: false,
      error: `Text send failed: ${data.message ?? res.statusText}`,
    };
  } catch (err) {
    return { success: false, error: `Text send error: ${String(err)}` };
  }
}

// ---------------------------------------------------------------------------
// SMS fallback
// ---------------------------------------------------------------------------

async function sendSms(
  to: string,
  message: string
): Promise<WhatsAppResult> {
  if (!GUPSHUP_API_KEY || !GUPSHUP_APP_NAME) {
    return { success: false, error: "SMS not configured" };
  }

  const params = new URLSearchParams({
    userid: GUPSHUP_APP_NAME,
    password: GUPSHUP_API_KEY,
    send_to: normalizePhone(to),
    v: "1.1",
    format: "text",
    msg_type: "TEXT",
    method: "SendMessage",
    msg: message,
    auth_scheme: "plain",
  });

  try {
    const response = await fetch(`${GUPSHUP_SMS_URL}?${params.toString()}`, {
      method: "GET",
    });

    const text = await response.text();

    if (text.includes("success")) {
      const idMatch = text.match(/\|\s*(\d+)/);
      return { success: true, messageId: idMatch?.[1] ?? undefined };
    }

    return { success: false, error: `SMS failed: ${text}` };
  } catch (err) {
    return { success: false, error: `SMS error: ${String(err)}` };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send the revealed contact info to the requester's WhatsApp.
 *
 * Strategy: template -> session text -> SMS -> give up gracefully.
 */
export async function sendLeadConnectMessage(
  params: LeadConnectParams
): Promise<WhatsAppResult> {
  if (!GUPSHUP_API_KEY) {
    return { success: false, error: "Gupshup not configured" };
  }

  const destination = normalizePhone(params.recipientPhone);
  const formattedPhone = displayPhone(params.phone);

  // 1. Try WhatsApp template
  if (GUPSHUP_WHATSAPP_NUMBER) {
    const templateResult = await sendWhatsAppTemplate(
      destination,
      TEMPLATE_LEAD_CONNECT,
      [params.name, formattedPhone, params.category, params.locality]
    );
    if (templateResult.success) return templateResult;

    // 2. Try WhatsApp session text
    const text = [
      "\u2705 Contact from kaamdha:",
      `\ud83d\udc64 ${params.name}`,
      `\ud83d\udcde ${formattedPhone}`,
      `\ud83d\udcbc ${params.category}`,
      `\ud83d\udccd ${params.locality}`,
      "\u2014 kaamdha (kaamdha.com)",
    ].join("\n");

    const textResult = await sendWhatsAppText(destination, text);
    if (textResult.success) return textResult;

    console.warn(
      "[gupshup] WhatsApp failed for sendLeadConnectMessage, trying SMS.",
      templateResult.error,
      textResult.error
    );
  }

  // 3. Fall back to SMS
  const smsText =
    `kaamdha: Contact details\n` +
    `${params.name}\n` +
    `${formattedPhone}\n` +
    `${params.category} - ${params.locality}\n` +
    `kaamdha.com`;

  const smsResult = await sendSms(params.recipientPhone, smsText);

  if (!smsResult.success) {
    console.error(
      "[gupshup] All channels failed for sendLeadConnectMessage:",
      destination,
      smsResult.error
    );
  }

  return smsResult;
}

/**
 * Notify the revealed party that someone viewed their number.
 *
 * Strategy: template -> session text -> SMS -> give up gracefully.
 */
export async function sendLeadNotifyMessage(
  params: LeadNotifyParams
): Promise<WhatsAppResult> {
  if (!GUPSHUP_API_KEY) {
    return { success: false, error: "Gupshup not configured" };
  }

  const destination = normalizePhone(params.recipientPhone);

  // 1. Try WhatsApp template
  if (GUPSHUP_WHATSAPP_NUMBER) {
    const templateResult = await sendWhatsAppTemplate(
      destination,
      TEMPLATE_LEAD_NOTIFY,
      [params.viewerName, params.viewerLocality]
    );
    if (templateResult.success) return templateResult;

    // 2. Try WhatsApp session text
    const text = [
      "\ud83d\udce2 Someone viewed your number on kaamdha!",
      `\ud83d\udc64 ${params.viewerName} from ${params.viewerLocality} is interested.`,
      "\u2014 kaamdha (kaamdha.com)",
    ].join("\n");

    const textResult = await sendWhatsAppText(destination, text);
    if (textResult.success) return textResult;

    console.warn(
      "[gupshup] WhatsApp failed for sendLeadNotifyMessage, trying SMS.",
      templateResult.error,
      textResult.error
    );
  }

  // 3. Fall back to SMS
  const smsText =
    `kaamdha: Someone viewed your number!\n` +
    `${params.viewerName} from ${params.viewerLocality} is interested.\n` +
    `kaamdha.com`;

  const smsResult = await sendSms(params.recipientPhone, smsText);

  if (!smsResult.success) {
    console.error(
      "[gupshup] All channels failed for sendLeadNotifyMessage:",
      destination,
      smsResult.error
    );
  }

  return smsResult;
}
