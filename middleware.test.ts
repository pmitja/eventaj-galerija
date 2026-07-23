import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { middleware } from "./middleware";

describe("production HTTPS middleware", () => {
  it("redirects the production hostname to HTTPS while preserving path and query", () => {
    const response = middleware(
      new NextRequest(
        "http://galerija.eventaj.si/e/ana-marko?guest=1&source=qr",
      ),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://galerija.eventaj.si/e/ana-marko?guest=1&source=qr",
    );
  });

  it("does not redirect an HTTPS production request", () => {
    const response = middleware(
      new NextRequest("https://galerija.eventaj.si/e/ana-marko"),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("does not redirect local HTTP development", () => {
    const response = middleware(new NextRequest("http://localhost:3000/"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
