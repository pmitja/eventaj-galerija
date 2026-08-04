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

  it("canonicalizes the English www hostname without switching language", () => {
    const request = new NextRequest("https://www.gallery.eventaj.si/naroci?ref=invite", {
      headers: { host: "www.gallery.eventaj.si" },
    });

    const response = middleware(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://gallery.eventaj.si/order?ref=invite");
  });

  it("redirects Slovenian public paths on the English domain", () => {
    const response = middleware(new NextRequest("https://gallery.eventaj.si/za-dogodke/poroke"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://gallery.eventaj.si/for-events/weddings");
  });

  it("internally rewrites English public paths to App Router routes", () => {
    const response = middleware(new NextRequest("https://gallery.eventaj.si/terms-of-use"));

    expect(response.headers.get("x-middleware-rewrite")).toBe("https://gallery.eventaj.si/pogoji-uporabe");
  });

  it("keeps English paths off the Slovenian domain", () => {
    const response = middleware(new NextRequest("https://galerija.eventaj.si/order/success?session_id=cs_1"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://galerija.eventaj.si/nakup/uspesen?session_id=cs_1");
  });
});
