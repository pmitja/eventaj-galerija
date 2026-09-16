import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("widens locales without changing historical payments or cascading children", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec(`PRAGMA foreign_keys = ON;
      CREATE TABLE events (id TEXT PRIMARY KEY, locale TEXT NOT NULL DEFAULT 'sl' CHECK(locale IN ('sl','en')));
      CREATE TABLE checkout_orders (id TEXT PRIMARY KEY, locale TEXT NOT NULL DEFAULT 'sl' CHECK(locale IN ('sl','en')), currency TEXT, status TEXT, updated_at TEXT);
      CREATE INDEX checkout_orders_locale_status_idx ON checkout_orders(locale,status,updated_at);
      CREATE TABLE media (event_id TEXT REFERENCES events(id) ON DELETE CASCADE);
      INSERT INTO events VALUES ('existing','en');
      INSERT INTO media VALUES ('existing');
      INSERT INTO checkout_orders VALUES ('existing','en','EUR','paid','2026-09-01');`);
    db.exec(readFileSync("migrations/0030_english_us_locale.sql", "utf8"));
    expect(db.prepare("SELECT locale,currency FROM checkout_orders").get()).toEqual({ locale: "en", currency: "EUR" });
    expect(db.prepare("SELECT event_id FROM media").get()).toEqual({ event_id: "existing" });
    db.exec("INSERT INTO events(id,locale) VALUES ('new','en-us')");
    db.exec("INSERT INTO checkout_orders(id,locale,currency) VALUES ('new','en-us','USD')");
    expect(db.prepare("SELECT locale FROM events WHERE id='new'").get()).toEqual({ locale: "en-us" });
  } finally { db.close(); }
});
