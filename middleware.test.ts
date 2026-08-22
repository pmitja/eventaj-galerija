import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { middleware } from "./middleware";

describe("canonical hostname middleware", () => {
  it("keeps the default Worker cache off because marketing HTML varies by hostname", () => {
    const config = JSON.parse(readFileSync(new URL("./wrangler.jsonc", import.meta.url), "utf8")) as {
      cache?: { enabled?: boolean };
    };

    expect(config.cache?.enabled).toBe(false);
  });

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

  it("redirects canonical hosts from HTTP to their localized HTTPS URL", () => {
    const slovenian = middleware(new NextRequest("http://galerija.eventaj.si/order?ref=http"));
    const english = middleware(new NextRequest("http://guestmosaic.com/naroci?ref=http"));

    expect(slovenian.status).toBe(308);
    expect(slovenian.headers.get("location")).toBe("https://galerija.eventaj.si/naroci?ref=http");
    expect(english.status).toBe(308);
    expect(english.headers.get("location")).toBe("https://guestmosaic.com/order?ref=http");
  });

  it("does not redirect the canonical hostname", () => {
    const request = new NextRequest("https://galerija.eventaj.si/", {
      headers: { host: "galerija.eventaj.si" },
    });

    const response = middleware(request);

    expect(response.headers.get("location")).toBeNull();
  });

  it("canonicalizes the Guest Mosaic www hostname without switching language", () => {
    const request = new NextRequest("https://www.guestmosaic.com/naroci?ref=invite", {
      headers: { host: "www.guestmosaic.com" },
    });

    const response = middleware(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://guestmosaic.com/order?ref=invite");
  });

  it("redirects the legacy international hostname to Guest Mosaic", () => {
    const response = middleware(new NextRequest("https://gallery.eventaj.si/de/order?ref=old-qr"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://guestmosaic.com/de/order?ref=old-qr");
  });

  it("redirects Slovenian public paths on the international domain", () => {
    const response = middleware(new NextRequest("https://guestmosaic.com/za-dogodke/poroke"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://guestmosaic.com/wedding-qr-code-for-photos");
  });

  it("internally rewrites English public paths to App Router routes", () => {
    const response = middleware(new NextRequest("https://guestmosaic.com/terms-of-use"));

    expect(response.headers.get("x-middleware-rewrite")).toBe("https://guestmosaic.com/pogoji-uporabe");
  });

  it("rewrites a prefixed language onto the Slovenian route tree", () => {
    const response = middleware(new NextRequest("https://guestmosaic.com/de/terms-of-use"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://guestmosaic.com/pogoji-uporabe");
  });

  it("serves localized AI discovery aliases through the shared route", () => {
    const response = middleware(new NextRequest("https://guestmosaic.com/fr/llm.txt"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://guestmosaic.com/llm.txt");
  });

  it("redirects Slovenian and English paths to the active language prefix", () => {
    const response = middleware(new NextRequest("https://guestmosaic.com/de/za-dogodke/poroke"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://guestmosaic.com/de/hochzeitsfotos-per-qr-code");
  });

  it("ignores language prefixes on the Slovenian domain", () => {
    const response = middleware(new NextRequest("https://galerija.eventaj.si/de/order"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://galerija.eventaj.si/naroci");
  });

  it("leaves API and admin routes untouched", () => {
    const response = middleware(new NextRequest("https://guestmosaic.com/api/v1/events"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("keeps English paths off the Slovenian domain", () => {
    const response = middleware(new NextRequest("https://galerija.eventaj.si/order/success?session_id=cs_1"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://galerija.eventaj.si/nakup/uspesen?session_id=cs_1");
  });

  it("consolidates every international wedding use-case URL and preserves its query", () => {
    const response = middleware(new NextRequest("https://guestmosaic.com/fr/for-events/weddings?utm_source=print"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://guestmosaic.com/fr/qr-code-photos-mariage?utm_source=print");
  });

  it("adds CDN caching only to public marketing HTML", () => {
    const marketing = middleware(new NextRequest("https://guestmosaic.com/fr/for-events/birthdays"));
    const checkout = middleware(new NextRequest("https://guestmosaic.com/fr/order"));

    expect(marketing.headers.get("cdn-cache-control")).toContain("s-maxage=300");
    expect(checkout.headers.get("cdn-cache-control")).toBeNull();
  });
});
