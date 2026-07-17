import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";
import { describe, expect, it } from "vitest";
import { writeZipArchive, type ZipSource } from "./exports";

async function* sources(): AsyncGenerator<ZipSource> {
  const uploaded = new Date("2026-07-16T12:00:00Z");
  yield { name: "prva.webp", body: new Blob(["first-image"]).stream(), uploaded };
  yield { name: "druga.webp", body: new Blob(["second-image"]).stream(), uploaded };
}

describe("ZIP export worker", () => {
  it("writes a readable archive from Web Streams", async () => {
    const stream = new TransformStream<Uint8Array, Uint8Array>();
    const archive = new Response(stream.readable).blob();
    await writeZipArchive(stream.writable, sources());

    const reader = new ZipReader(new BlobReader(await archive));
    const entries = await reader.getEntries();
    expect(entries.map((entry) => entry.filename)).toEqual(["prva.webp", "druga.webp"]);
    const first = entries[0];
    const second = entries[1];
    if (!first || !("getData" in first) || !second || !("getData" in second)) {
      throw new Error("Expected file entries");
    }
    expect(await first.getData(new TextWriter())).toBe("first-image");
    expect(await second.getData(new TextWriter())).toBe("second-image");
    await reader.close();
  });
});
