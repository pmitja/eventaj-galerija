import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuthContext } from "@/lib/auth/context";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { findEventById } from "@/lib/repositories/events";
import { requestTechnicalAnalysis, setMediaQualityOverride } from "@/lib/repositories/media-quality-admin";
import { processTechnicalAnalysis } from "@/lib/storage/r2";
import { mediaQualityOverrideSchema, mediaQualityParamsSchema } from "@/lib/validation/admin";
import { hasAiBestPhotosEntitlement } from "@/lib/repositories/entitlements";

function hasValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function auditQualityAction(input: {
  eventId: string;
  mediaId: string;
  actorId: string;
  action: string;
  changes?: Record<string, unknown>;
}): Promise<void> {
  await getCloudflareEnv().DB.prepare(
    `INSERT INTO audit_logs
      (id, event_id, actor_type, actor_id, action, target_type, target_id, changes_json, created_at)
     VALUES (?, ?, 'user', ?, ?, 'media_file', ?, ?, ?)`,
  ).bind(
    crypto.randomUUID(),
    input.eventId,
    input.actorId,
    input.action,
    input.mediaId,
    input.changes ? JSON.stringify(input.changes) : null,
    new Date().toISOString(),
  ).run();
}

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string; mediaId: string }> }) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  if (!hasValidOrigin(request)) return problem(403, "INVALID_ORIGIN", "Izvor zahteve ni dovoljen");
  const parsed = mediaQualityParamsSchema.safeParse(await params);
  if (!parsed.success) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  const { eventId, mediaId } = parsed.data;
  if (!(await findEventById(eventId, context.organizationId))) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  if (!(await hasAiBestPhotosEntitlement(eventId, context.organizationId))) {
    return problem(403, "AI_BEST_PHOTOS_REQUIRED", "AI Best Photos ni omogočen za ta dogodek");
  }

  const requested = await requestTechnicalAnalysis({ organizationId: context.organizationId, eventId, mediaId });
  if (requested === "not_found") return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  if (requested === "queued") {
    getCloudflareContext().ctx.waitUntil(processTechnicalAnalysis(mediaId, context.organizationId));
    await auditQualityAction({
      eventId,
      mediaId,
      actorId: context.email,
      action: "media.quality_analysis_requested",
    });
  }
  return Response.json(
    { mediaId, analysisStatus: "pending", alreadyPending: requested === "already_pending" },
    { status: 202, headers: { "cache-control": "no-store" } },
  );
}

export async function PATCH(request: Request, { params }: { params: Promise<{ eventId: string; mediaId: string }> }) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  if (!hasValidOrigin(request)) return problem(403, "INVALID_ORIGIN", "Izvor zahteve ni dovoljen");
  const parsedParams = mediaQualityParamsSchema.safeParse(await params);
  if (!parsedParams.success) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  const parsedBody = mediaQualityOverrideSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return problem(422, "INVALID_QUALITY_CATEGORY", "Kategorija kakovosti ni veljavna");
  const { eventId, mediaId } = parsedParams.data;
  if (!(await findEventById(eventId, context.organizationId))) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  if (!(await hasAiBestPhotosEntitlement(eventId, context.organizationId))) {
    return problem(403, "AI_BEST_PHOTOS_REQUIRED", "AI Best Photos ni omogočen za ta dogodek");
  }

  const actorId = context.email;
  const result = await setMediaQualityOverride({
    organizationId: context.organizationId,
    eventId,
    mediaId,
    category: parsedBody.data.category,
    actorId,
  });
  if (!result) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  await auditQualityAction({
    eventId,
    mediaId,
    actorId,
    action: "media.quality_override_changed",
    changes: { category: parsedBody.data.category, automaticCategory: result.automatic },
  });
  return Response.json({
    mediaId,
    automaticCategory: result.automatic,
    effectiveCategory: result.effective,
    overridden: parsedBody.data.category !== null,
  }, { headers: { "cache-control": "no-store" } });
}
