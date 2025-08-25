import { google, sheets_v4 } from "googleapis";

let sheetsClient: sheets_v4.Sheets | null = null;
let serviceAccountEmail: string | null = null;

/**
 * Initialize Google Sheets client from environment variables.
 * It supports two ways:
 * - GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: base64-encoded JSON of the service account key
 * - GOOGLE_SERVICE_ACCOUNT_JSON: raw JSON string of the service account key
 */
export function getSheetsClient(): sheets_v4.Sheets | null {
  if (sheetsClient) return sheetsClient;

  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  let creds: any;
  try {
    if (b64 && b64.trim().length > 0) {
      const jsonStr = Buffer.from(b64, "base64").toString("utf8");
      creds = JSON.parse(jsonStr);
    } else if (raw && raw.trim().length > 0) {
      creds = JSON.parse(raw);
    } else {
      return null; // Not configured
    }
  } catch (e) {
    console.error("Failed to parse Google credentials:", e);
    return null;
  }

  serviceAccountEmail = creds.client_email || null;
  const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
  const auth = new google.auth.JWT(creds.client_email, undefined, creds.private_key, scopes);
  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

/**
 * Append a row to the spreadsheet.
 * Make sure you've shared the spreadsheet with the service account email.
 */
export async function appendRow(values: any[], range = "Sheet1!A:Z") {
  const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return;
  const sheets = getSheetsClient();
  if (!sheets) return;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] }
    });
  } catch (e) {
    console.error("Failed to append row to Sheets:", e);
  }
}

/**
 * Get the service account email (useful to tell the user what to share the Sheet with).
 */
export function getServiceAccountEmail(): string | null {
  if (serviceAccountEmail) return serviceAccountEmail;
  // Lazy init
  getSheetsClient();
  return serviceAccountEmail;
}