import { NextResponse } from "next/server";

export function problem(status: number, code: string, title: string, detail?: string) {
  return NextResponse.json(
    {
      type: `https://app.eventaj.si/problems/${code.toLowerCase().replaceAll("_", "-")}`,
      title,
      status,
      code,
      detail,
      requestId: crypto.randomUUID(),
    },
    { status, headers: { "content-type": "application/problem+json" } },
  );
}
