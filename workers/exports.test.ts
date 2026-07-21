import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";
import { describe, expect, it } from "vitest";
import { writeZipArchive, writeZipToR2Multipart, type ZipSource } from "./exports";

async function* sources(): AsyncGenerator<ZipSource> {
  const uploaded = new Date("2026-07-16T12:00:00Z");
  yield { name: "prva.webp", body: new TextEncoder().encode("first-image"), uploaded };
  yield { name: "druga.webp", body: new TextEncoder().encode("second-image"), uploaded };
}

function bytesSource(name: string, size: number): () => AsyncGenerator<ZipSource> {
  return async function* () {
    yield { name, body: new Uint8Array(size).fill(65), uploaded: new Date("2026-07-16T12:00:00Z") };
  };
}

type CollectedPart = { partNumber: number; body: Uint8Array };

function fakeMultipartMedia() {
  const parts: CollectedPart[] = [];
  const aborted = { value: false };
  const media = {
    async createMultipartUpload(_key: string, _opts: unknown) {
      return {
        async uploadPart(partNumber: number, body: Uint8Array) {
          parts.push({ partNumber, body: new Uint8Array(body) });
          return { partNumber, etag: `etag-${partNumber}` };
        },
        async complete(uploaded: Array<{ partNumber: number; etag: string }>) {
          return { size: uploaded.length };
        },
        async abort() {
          aborted.value = true;
        },
      };
    },
  } as unknown as Parameters<typeof writeZipToR2Multipart>[0]["MEDIA"];
  return { media, parts, aborted };
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

  it("streams the archive to R2 as multipart parts that reassemble into a valid zip", async () => {
    const { media, parts, aborted } = fakeMultipartMedia();
    // ~20 MiB entry forces the 8 MiB part threshold to split across several parts.
    const total = await writeZipToR2Multipart({ MEDIA: media }, "exports/e/x.zip", {
      contentType: "application/zip",
    }, bytesSource("velika.webp", 20 * 1024 * 1024)());

    expect(aborted.value).toBe(false);
    expect(parts.length).toBeGreaterThan(1);
    // Every non-final part must satisfy R2's 5 MiB minimum.
    for (const part of parts.slice(0, -1)) {
      expect(part.body.byteLength).toBeGreaterThanOrEqual(5 * 1024 * 1024);
    }

    const assembled = new Blob(parts.sort((a, b) => a.partNumber - b.partNumber).map((part) => part.body) as BlobPart[]);
    expect(assembled.size).toBe(total);

    const reader = new ZipReader(new BlobReader(assembled));
    const entries = await reader.getEntries();
    expect(entries.map((entry) => entry.filename)).toEqual(["velika.webp"]);
    await reader.close();
  });

  it("aborts the multipart upload when a source is unreadable", async () => {
    const { media, aborted } = fakeMultipartMedia();
    async function* failing(): AsyncGenerator<ZipSource> {
      yield { name: "ok.webp", body: new Uint8Array(1024), uploaded: new Date("2026-07-16T12:00:00Z") };
      throw new Error("R2_READ_FAILED");
    }
    await expect(writeZipToR2Multipart({ MEDIA: media }, "exports/e/y.zip", { contentType: "application/zip" }, failing()))
      .rejects.toThrow("R2_READ_FAILED");
    expect(aborted.value).toBe(true);
  });
});
