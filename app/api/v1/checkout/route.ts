import { problem } from "@/lib/http/problem";
import { createCheckoutOrder } from "@/lib/repositories/checkout";
import { createCheckoutSchema } from "@/lib/validation/checkout";

export async function POST(request: Request) {
  const parsed = createCheckoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(422, "INVALID_CHECKOUT", "Podatki za naročilo niso veljavni", parsed.error.issues[0]?.message);
  }
  try {
    const checkout = await createCheckoutOrder(parsed.data);
    return Response.json({ checkout }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "CHECKOUT_RATE_LIMIT") {
      return problem(429, "CHECKOUT_RATE_LIMIT", "Preveč poskusov plačila", "Poskusi znova čez eno uro.");
    }
    console.error(JSON.stringify({
      event: "checkout.create_failed",
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : "Unknown checkout error",
    }));
    return problem(503, "CHECKOUT_UNAVAILABLE", "Plačila trenutno ni mogoče začeti", "Poskusi znova čez nekaj trenutkov.");
  }
}
