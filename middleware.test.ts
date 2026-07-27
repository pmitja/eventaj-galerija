import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { middleware } from "./middleware";

describe("canonical hostname middleware", () => {
  it("redirects the www hostname while preserving path and query", () => {
    const request = new NextRequest(
      "https://www.galerija.eventaj.si/e/poroka?slika=42",
      { headers: { host: "www.galerija.eventaj.si" } },
    );

    const response = middleware(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://galerija.eventaj.si/e/poroka?slika=42",
    );
  });

  it("does not redirect the canonical hostname", () => {
    const request = new NextRequest("https://galerija.eventaj.si/", {
      headers: { host: "galerija.eventaj.si" },
    });

    const response = middleware(request);

    expect(response.headers.get("location")).toBeNull();
  });
});
