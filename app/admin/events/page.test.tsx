import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventsPage } from "@/components/admin/admin-pages";
import Page from "./page";

const state = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock("@/lib/auth/context", () => ({ getAuthContext: async () => ({ organizationId: "organization-1" }) }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: vi.fn() }));
vi.mock("@/lib/repositories/admin-dashboard", () => ({ listAdminEventSummaries: state.list }));

async function renderPage(query: Record<string, string> = {}) {
  const page = await Page({ searchParams: Promise.resolve(query) });
  return renderToStaticMarkup(await EventsPage(page.props));
}

describe("admin event list controls", () => {
  beforeEach(() => {
    state.list.mockResolvedValue([
      { id: "event-1", name: "Zimski ples", location: "Bled", starts_at: "2026-12-01T12:00:00Z", timezone: "Europe/Ljubljana", status: "draft", is_upcoming: 1, photo_count: 0, visit_count: 0, comments_enabled: 1 },
      { id: "event-2", name: "Anina poroka", location: "Ljubljana", starts_at: "2026-08-01T12:00:00Z", timezone: "Europe/Ljubljana", status: "active", is_upcoming: 0, photo_count: 10, visit_count: 5, comments_enabled: 1 },
    ]);
  });

  it("applies status and search from the route query to the displayed rows", async () => {
    const markup = await renderPage({ status: "active", q: "ANA" });
    expect(markup).toContain("Anina poroka");
    expect(markup).not.toContain("Zimski ples");
  });

  it("sorts displayed rows by ascending event date", async () => {
    const markup = await renderPage({ sort: "date_asc" });
    expect(markup.indexOf("Anina poroka")).toBeLessThan(markup.indexOf("Zimski ples"));
  });

  it("renders a GET form that preserves every selected filter", async () => {
    const markup = await renderPage({ q: "ANA", status: "active", period: "previous_month", sort: "name_asc" });
    expect(markup).toMatch(/<form[^>]*action="\/admin\/events"[^>]*method="get"/);
    expect(markup).toContain('name="q"');
    expect(markup).toContain('value="ANA"');
    for (const value of ["active", "previous_month", "name_asc"]) {
      expect(markup).toContain(`value="${value}" selected=""`);
    }
    expect(markup).toContain('type="submit"');
    expect(markup).toContain('href="/admin/events">Počisti');
  });

  it("distinguishes no matches from an empty workspace", async () => {
    expect(await renderPage({ q: "missing" })).toContain("Noben dogodek ne ustreza izbranim filtrom");
    state.list.mockResolvedValueOnce([]);
    expect(await renderPage()).toContain("Dogodkov še ni");
  });

  it("explains invalid query parameters instead of silently ignoring them", async () => {
    const markup = await renderPage({ sort: "invalid" });
    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Neveljavni filtri");
  });

  it("loads all organization events before applying filters", async () => {
    await renderPage({ status: "ended" });
    expect(state.list).toHaveBeenLastCalledWith("organization-1", null);
  });
});
