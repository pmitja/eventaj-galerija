import { getAuthContext } from "@/lib/auth/context";
import { problem } from "@/lib/http/problem";
import { createCheckoutOrder } from "@/lib/repositories/checkout";
import { createCheckoutSchema } from "@/lib/validation/checkout";

export async function POST(request: Request) {
  const parsed = createCheckoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(422, "INVALID_CHECKOUT", "Podatki za naročilo niso veljavni", parsed.error.issues[0]?.message);
  }
  const context = await getAuthContext();
  try {
    const checkout = await createCheckoutOrder(parsed.data, context);
    return Response.json({ checkout }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ACCOUNT_EXISTS") {
      return problem(409, "ACCOUNT_EXISTS", "Račun s to e-pošto že obstaja", "Prijavi se in nato naroči dodaten dogodek.");
    }
    if (error instanceof Error && error.message === "PASSWORD_REQUIRED") {
      return problem(422, "PASSWORD_REQUIRED", "Geslo je obvezno pri prvem naročilu");
    }
    if (error instanceof Error && error.message === "CHECKOUT_RATE_LIMIT") {
      return problem(429, "CHECKOUT_RATE_LIMIT", "Preveč poskusov plačila", "Poskusi znova čez eno uro.");
    }
    return problem(503, "CHECKOUT_UNAVAILABLE", "Plačila trenutno ni mogoče začeti", "Poskusi znova čez nekaj trenutkov.");
  }
}
