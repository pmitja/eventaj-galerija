export type GalleryShareResult = "shared" | "copied" | "cancelled" | "error";

type ShareClient = {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: {
    writeText: (text: string) => Promise<void>;
  };
};

type ShareGalleryOptions = {
  client: ShareClient;
  data: ShareData & { url: string };
  legacyCopy?: (url: string) => boolean;
};

function isCancelledShare(error: unknown) {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

export async function shareGallery({ client, data, legacyCopy }: ShareGalleryOptions): Promise<GalleryShareResult> {
  if (client.share) {
    try {
      await client.share(data);
      return "shared";
    } catch (error) {
      if (isCancelledShare(error)) return "cancelled";
    }
  }

  if (client.clipboard) {
    try {
      await client.clipboard.writeText(data.url);
      return "copied";
    } catch {
      // Older or restricted browsers continue to the synchronous fallback.
    }
  }

  try {
    return legacyCopy?.(data.url) ? "copied" : "error";
  } catch {
    return "error";
  }
}
