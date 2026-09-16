import type { ComparisonId } from "./routes";

// Stable fact IDs keep every translation on the same verified comparison scope.
export const FEATURE_IDS = ["access", "account", "media", "downloads", "retention", "privacy", "slideshow", "price"] as const;
export type FeatureId = typeof FEATURE_IDS[number];
export const GUEST_MOSAIC_FACTS = ["qrBrowser", "noAccount", "gmMedia", "gmDownload", "gmRetention", "gmPrivacy", "gmSlideshow", "gmPrice"] as const;
export type FactId = typeof GUEST_MOSAIC_FACTS[number]
  | "chat" | "whatsappAccount" | "chatMedia" | "chatDownload" | "chatRetention" | "encrypted" | "noEventWall" | "freeMessaging"
  | "folder" | "googleAccount" | "files" | "fileDownload" | "googleRetention" | "permissions" | "googlePrice"
  | "album" | "googlePhotosAccount" | "photosVideos" | "photosDownload" | "albumSharing"
  | "guestpixMedia" | "guestpixDownload" | "guestpixRetention" | "sharedLink" | "photoVideoWall" | "livePrice"
  | "kululuMedia" | "bulkDownload" | "kululuRetention" | "kululuPrice"
  | "photoWall" | "driveOriginals" | "driveDownload" | "wedRetention" | "wedPrivacy";

export type FactMark = "check" | "x" | "neutral";

// Marks only express a clear present/missing distinction. Price, retention and
// access policy stay neutral because those values require the accompanying text.
export const FACT_MARKS = {
  qrBrowser: "check", noAccount: "check", gmMedia: "check", gmDownload: "check", gmRetention: "neutral", gmPrivacy: "neutral", gmSlideshow: "check", gmPrice: "neutral",
  chat: "check", whatsappAccount: "x", chatMedia: "check", chatDownload: "check", chatRetention: "neutral", encrypted: "check", noEventWall: "x", freeMessaging: "neutral",
  folder: "check", googleAccount: "x", files: "check", fileDownload: "check", googleRetention: "neutral", permissions: "neutral", googlePrice: "neutral",
  album: "check", googlePhotosAccount: "x", photosVideos: "check", photosDownload: "check", albumSharing: "neutral",
  guestpixMedia: "check", guestpixDownload: "check", guestpixRetention: "neutral", sharedLink: "check", photoVideoWall: "check", livePrice: "neutral",
  kululuMedia: "check", bulkDownload: "check", kululuRetention: "neutral", kululuPrice: "neutral",
  photoWall: "check", driveOriginals: "check", driveDownload: "check", wedRetention: "neutral", wedPrivacy: "neutral",
} as const satisfies Record<FactId, FactMark>;
type ComparisonFacts = {
  name: string;
  plan: string;
  facts: readonly FactId[];
  sources: readonly { name: string; url: string }[];
};

export const COMPARISONS: Record<ComparisonId, ComparisonFacts> = {
  whatsapp: {
    name: "WhatsApp", plan: "WhatsApp Messenger",
    facts: ["chat", "whatsappAccount", "chatMedia", "chatDownload", "chatRetention", "encrypted", "noEventWall", "freeMessaging"],
    sources: [{ name: "WhatsApp", url: "https://www.whatsapp.com/messaging" }, { name: "WhatsApp Privacy", url: "https://www.whatsapp.com/privacy" }],
  },
  "google-drive": {
    name: "Google Drive", plan: "Google Drive · Personal",
    facts: ["folder", "googleAccount", "files", "fileDownload", "googleRetention", "permissions", "noEventWall", "googlePrice"],
    sources: [{ name: "Google Drive", url: "https://support.google.com/drive/answer/7166529" }, { name: "Google Drive", url: "https://support.google.com/drive/answer/2424384" }, { name: "Google One", url: "https://one.google.com/about/plans" }],
  },
  "google-photos": {
    name: "Google Photos", plan: "Google Photos · Personal",
    facts: ["album", "googlePhotosAccount", "photosVideos", "photosDownload", "googleRetention", "albumSharing", "noEventWall", "googlePrice"],
    sources: [{ name: "Google Photos", url: "https://support.google.com/photos/answer/6131416" }, { name: "Google Photos", url: "https://support.google.com/photos/answer/9789702" }, { name: "Google One", url: "https://one.google.com/about/plans" }],
  },
  guestpix: {
    name: "GUESTPIX", plan: "Classic",
    facts: ["qrBrowser", "noAccount", "guestpixMedia", "guestpixDownload", "guestpixRetention", "sharedLink", "photoVideoWall", "livePrice"],
    sources: [{ name: "GUESTPIX Classic", url: "https://guestpix.com/weddings/" }, { name: "GUESTPIX", url: "https://help.guestpix.com/article/153-start-here-welcome-to-guestpix" }],
  },
  kululu: {
    name: "Kululu", plan: "Plus",
    facts: ["qrBrowser", "noAccount", "kululuMedia", "bulkDownload", "kululuRetention", "sharedLink", "photoVideoWall", "kululuPrice"],
    sources: [{ name: "Kululu Plus", url: "https://www.kululu.com/pricing" }, { name: "Kululu", url: "https://help.kululu.com/en/articles/11402245-what-is-kululu" }],
  },
  weduploader: {
    name: "WedUploader", plan: "Premium",
    facts: ["qrBrowser", "noAccount", "driveOriginals", "driveDownload", "wedRetention", "wedPrivacy", "photoWall", "livePrice"],
    sources: [{ name: "WedUploader Premium", url: "https://weduploader.com/pricing" }, { name: "WedUploader", url: "https://weduploader.com/" }, { name: "WedUploader Slideshow", url: "https://weduploader.com/what-is-the-slideshow-feature" }],
  },
};
