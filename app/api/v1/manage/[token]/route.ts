import { problem } from "@/lib/http/problem";
import { completeEventSetup } from "@/lib/repositories/checkout";
import { eventSetupSchema, managementTokenSchema } from "@/lib/validation/checkout";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = managementTokenSchema.safeParse((await params).token);
  const input = eventSetupSchema.safeParse(await request.json().catch(() => null));
  if (!token.success || !input.success) return problem(422, "INVALID_EVENT_SETUP", "Event details are invalid");
  try {
    await completeEventSetup(token.data, input.data);
    return Response.json({ ok: true });
  } catch {
    return problem(404, "MANAGEMENT_LINK_INVALID", "This management link is invalid");
  }
}
