import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "./proxy";

describe("canonical hostname proxy", () => {
  it("redirects the www hostname while preserving path and query", () => {
    const request = new NextRequest(
      "https://www.galerija.eventaj.si/e/poroka?slika=42",
      { headers: { host: "www.galerija.eventaj.si" } },
    );

    const response = proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://galerija.eventaj.si/e/poroka?slika=42",
    );
  });

  it("does not redirect the canonical hostname", () => {
    const request = new NextRequest("https://galerija.eventaj.si/", {
      headers: { host: "galerija.eventaj.si" },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
  });

  it("canonicalizes the English www hostname without switching language", () => {
    const request = new NextRequest("https://www.gallery.eventaj.si/naroci?ref=invite", {
      headers: { host: "www.gallery.eventaj.si" },
    });

    const response = proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://gallery.eventaj.si/naroci?ref=invite");
  });
});
