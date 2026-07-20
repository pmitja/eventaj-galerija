import { getAuthContext } from "@/lib/auth/context";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { findEventById } from "@/lib/repositories/events";
import {
  createQualityBackfill,
  findLatestOwnedQualityBackfill,
  markQualityBackfillEnqueueFailed,
} from "@/lib/repositories/quality-backfills";
import { qualityBackfillParamsSchema, qualityBackfillRequestSchema } from "@/lib/validation/quality-backfill";
import { hasAiBestPhotosEntitlement } from "@/lib/repositories/entitlements";

function validOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function responseBody(job: import("@/lib/repositories/quality-backfills").QualityBackfillSummary | null) {
  if (!job) return { backfill: null };
  return {
    backfill: {
      id: job.id,
      mode: job.mode,
      modelVersion: job.model_version,
      status: job.status,
      errorCode: job.error_code,
      totalCount: job.total_count,
      completedCount: job.completed_count,
      failedCount: job.failed_count,
      queuedCount: job.queued_count,
      createdAt: job.created_at,
      completedAt: job.completed_at,
    },
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  const parsed = qualityBackfillParamsSchema.safeParse(await params);
  if (!parsed.success || !(await findEventById(parsed.data.eventId, context.organizationId))) {
    return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  }
  if (!(await hasAiBestPhotosEntitlement(parsed.data.eventId, context.organizationId))) {
    return problem(403, "AI_BEST_PHOTOS_REQUIRED", "AI Best Photos ni omogočen za ta dogodek");
  }
  return Response.json(responseBody(await findLatestOwnedQualityBackfill(parsed.data.eventId, context.organizationId)), {
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  if (!validOrigin(request)) return problem(403, "INVALID_ORIGIN", "Izvor zahteve ni dovoljen");
  const parsedParams = qualityBackfillParamsSchema.safeParse(await params);
  const parsedBody = qualityBackfillRequestSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsedParams.success || !(await findEventById(parsedParams.data.eventId, context.organizationId))) {
    return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  }
  if (!parsedBody.success) return problem(422, "INVALID_BACKFILL_MODE", "Način analize ni veljaven");
  if (!(await hasAiBestPhotosEntitlement(parsedParams.data.eventId, context.organizationId))) {
    return problem(403, "AI_BEST_PHOTOS_REQUIRED", "AI Best Photos ni omogočen za ta dogodek");
  }

  const { QUALITY_QUEUE, DB } = getCloudflareEnv();
  const created = await createQualityBackfill({
    eventId: parsedParams.data.eventId,
    requestedBy: context.email,
    mode: parsedBody.data.mode,
    organizationId: context.organizationId,
  });
  if (created.created) {
    try {
      await QUALITY_QUEUE.send({
        type: "start",
        backfillId: created.job.id,
        organizationId: context.organizationId,
      });
    } catch {
      await markQualityBackfillEnqueueFailed(created.job.id);
      return problem(503, "QUALITY_QUEUE_UNAVAILABLE", "Analize trenutno ni mogoče začeti", "Poskusi znova čez nekaj trenutkov.");
    }
    await DB.prepare(
      `INSERT INTO audit_logs
        (id, event_id, actor_type, actor_id, action, target_type, target_id, changes_json, created_at)
       VALUES (?, ?, 'user', ?, 'media.quality_backfill_requested', 'quality_backfill', ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      parsedParams.data.eventId,
      context.email,
      created.job.id,
      JSON.stringify({ mode: parsedBody.data.mode, modelVersion: created.job.model_version }),
      new Date().toISOString(),
    ).run();
  }
  return Response.json(responseBody(created.job), {
    status: 202,
    headers: { "cache-control": "no-store" },
  });
}
