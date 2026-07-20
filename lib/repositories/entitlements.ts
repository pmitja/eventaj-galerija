import { getCloudflareEnv } from "@/lib/cloudflare";

export async function hasAiBestPhotosEntitlement(eventId: string, organizationId: string): Promise<boolean> {
  const row = await getCloudflareEnv().DB.prepare(
    `SELECT ee.value_json FROM event_entitlements ee
     JOIN events e ON e.id = ee.event_id
     WHERE ee.event_id = ? AND e.organization_id = ? AND ee.feature_code = 'ai_best_photos'`,
  ).bind(eventId, organizationId).first<{ value_json: string }>();
  if (!row || row.value_json === "false") return false;
  try {
    const value = JSON.parse(row.value_json) as { enabled?: boolean } | boolean;
    return value === true || (typeof value === "object" && value.enabled === true);
  } catch {
    return false;
  }
}
