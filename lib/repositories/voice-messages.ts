import { getCloudflareEnv } from "@/lib/cloudflare";
import type { VoiceMessageMime } from "@/lib/domain/voice-messages";

export type VoiceMessageRow = {
  id: string;
  public_id: string;
  event_id: string;
  upload_session_id: string;
  guest_id: string | null;
  object_key: string;
  declared_mime: VoiceMessageMime;
  size_bytes: number;
  duration_ms: number;
  status: "pending" | "ready" | "rejected";
  publication_consent: number;
  uploaded_at: string | null;
  created_at: string;
};

export type PublicVoiceMessageRow = Pick<VoiceMessageRow, "public_id" | "duration_ms" | "uploaded_at"> & {
  display_name: string | null;
};

export type AdminVoiceMessageRow = Pick<VoiceMessageRow, "id" | "duration_ms" | "uploaded_at" | "publication_consent"> & {
  display_name: string | null;
};

export async function countSessionVoiceMessages(sessionId: string): Promise<number> {
  const row = await getCloudflareEnv().DB.prepare(
    "SELECT COUNT(*) AS count FROM voice_messages WHERE upload_session_id = ? AND status != 'rejected'",
  ).bind(sessionId).first<{ count: number }>();
  return row?.count ?? 0;
}

export async function createPendingVoiceMessage(input: {
  sessionId: string;
  eventId: string;
  guestId: string | null;
  mime: VoiceMessageMime;
  sizeBytes: number;
  durationMs: number;
  publicationConsent: boolean;
}): Promise<VoiceMessageRow> {
  const id = crypto.randomUUID();
  const publicId = crypto.randomUUID().replaceAll("-", "");
  const objectKey = `voice-messages/${input.eventId}/${id}/original`;
  const now = new Date().toISOString();
  await getCloudflareEnv().DB.prepare(
    `INSERT INTO voice_messages
      (id, public_id, event_id, upload_session_id, guest_id, object_key, declared_mime,
       size_bytes, duration_ms, publication_consent, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id, publicId, input.eventId, input.sessionId, input.guestId, objectKey, input.mime,
    input.sizeBytes, input.durationMs, input.publicationConsent ? 1 : 0, now,
  ).run();
  return (await findVoiceMessageById(id))!;
}

export async function findVoiceMessageById(id: string): Promise<VoiceMessageRow | null> {
  return getCloudflareEnv().DB.prepare("SELECT * FROM voice_messages WHERE id = ?")
    .bind(id).first<VoiceMessageRow>();
}

export async function markVoiceMessageReady(id: string): Promise<void> {
  await getCloudflareEnv().DB.prepare(
    "UPDATE voice_messages SET status = 'ready', uploaded_at = ? WHERE id = ? AND status = 'pending'",
  ).bind(new Date().toISOString(), id).run();
}

export async function rejectVoiceMessage(id: string): Promise<void> {
  await getCloudflareEnv().DB.prepare(
    "UPDATE voice_messages SET status = 'rejected' WHERE id = ? AND status = 'pending'",
  ).bind(id).run();
}

export async function listPublicVoiceMessages(eventId: string): Promise<PublicVoiceMessageRow[]> {
  const result = await getCloudflareEnv().DB.prepare(
    `SELECT v.public_id, v.duration_ms, v.uploaded_at, g.display_name
     FROM voice_messages v
     LEFT JOIN event_guests g ON g.id = v.guest_id AND g.event_id = v.event_id
     WHERE v.event_id = ? AND v.status = 'ready' AND v.publication_consent = 1
     ORDER BY v.uploaded_at DESC LIMIT 100`,
  ).bind(eventId).all<PublicVoiceMessageRow>();
  return result.results;
}

export async function listAdminVoiceMessages(eventId: string, organizationId: string): Promise<AdminVoiceMessageRow[]> {
  const result = await getCloudflareEnv().DB.prepare(
    `SELECT v.id, v.duration_ms, v.uploaded_at, v.publication_consent, g.display_name
     FROM voice_messages v
     JOIN events e ON e.id = v.event_id
     LEFT JOIN event_guests g ON g.id = v.guest_id AND g.event_id = v.event_id
     WHERE v.event_id = ? AND e.organization_id = ? AND v.status = 'ready'
     ORDER BY v.uploaded_at DESC LIMIT 100`,
  ).bind(eventId, organizationId).all<AdminVoiceMessageRow>();
  return result.results;
}

export async function recordVoiceMessageConsents(input: {
  eventId: string;
  sessionId: string;
  guestId: string | null;
  voiceMessageId: string;
  policyVersion: string;
  publicationConsent: boolean;
}): Promise<void> {
  const now = new Date().toISOString();
  const subject = input.guestId ?? `upload-session:${input.sessionId}`;
  const evidence = JSON.stringify({ uploadSessionId: input.sessionId, voiceMessageId: input.voiceMessageId });
  await getCloudflareEnv().DB.batch([
    getCloudflareEnv().DB.prepare(
      `INSERT INTO consent_records
       (id, event_id, subject_reference, purpose, policy_version, granted, granted_at, evidence_json, created_at)
       VALUES (?, ?, ?, 'voice_message_upload', ?, 1, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), input.eventId, subject, input.policyVersion, now, evidence, now),
    getCloudflareEnv().DB.prepare(
      `INSERT INTO consent_records
       (id, event_id, subject_reference, purpose, policy_version, granted, granted_at, evidence_json, created_at)
       VALUES (?, ?, ?, 'voice_message_publication', ?, ?, ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(), input.eventId, subject, input.policyVersion,
      input.publicationConsent ? 1 : 0, input.publicationConsent ? now : null, evidence, now,
    ),
  ]);
}
