"use client";

import { useEffect, useState } from "react";

/**
 * Demo storage for the guest flow. The marketing simulator and the demo event
 * gallery run the real upload UI, but everything a visitor adds is kept in the
 * browser (IndexedDB) instead of being sent to the server.
 */

export type LocalDemoMediaKind = "image" | "video" | "voice";

export type LocalDemoMedia = {
  id: string;
  kind: LocalDemoMediaKind;
  mime: string;
  filename: string;
  createdAt: number;
  durationMs: number | null;
  blob: Blob;
  poster: Blob | null;
};

const DB_NAME = "eventaj-demo-media";
const DB_VERSION = 1;
const STORE = "media";

let cache: LocalDemoMedia[] | null = null;
let loading: Promise<LocalDemoMedia[]> | null = null;
const listeners = new Set<(items: LocalDemoMedia[]) => void>();
const objectUrls = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    // Private browsing modes can refuse IndexedDB; the demo then lives in memory only.
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

function byNewestFirst(items: LocalDemoMedia[]) {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

function emit() {
  const items = cache ?? [];
  listeners.forEach((listener) => listener(items));
}

export function loadLocalDemoMedia(): Promise<LocalDemoMedia[]> {
  if (cache) return Promise.resolve(cache);
  if (loading) return loading;

  loading = (async () => {
    const database = await openDatabase();
    if (!database) {
      cache = [];
      return cache;
    }
    const stored = await new Promise<LocalDemoMedia[]>((resolve) => {
      const request = database.transaction(STORE, "readonly").objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result as LocalDemoMedia[]);
      request.onerror = () => resolve([]);
    });
    database.close();
    cache = byNewestFirst(stored);
    return cache;
  })();

  try {
    return loading;
  } finally {
    void loading.then(() => { loading = null; emit(); });
  }
}

export async function addLocalDemoMedia(input: Omit<LocalDemoMedia, "id" | "createdAt">): Promise<LocalDemoMedia> {
  const item: LocalDemoMedia = { ...input, id: crypto.randomUUID(), createdAt: Date.now() };
  await loadLocalDemoMedia();
  cache = byNewestFirst([...(cache ?? []), item]);
  emit();

  const database = await openDatabase();
  if (database) {
    await new Promise<void>((resolve) => {
      const transaction = database.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(item);
      transaction.oncomplete = () => resolve();
      // A failed write only costs persistence across reloads, not the demo itself.
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();
    });
    database.close();
  }

  return item;
}

export function subscribeLocalDemoMedia(listener: (items: LocalDemoMedia[]) => void): () => void {
  listeners.add(listener);
  void loadLocalDemoMedia().then((items) => {
    if (listeners.has(listener)) listener(items);
  });
  return () => listeners.delete(listener);
}

/** Object URLs are memoised per item so re-renders never swap a live `src`. */
export function localDemoMediaUrl(id: string, blob: Blob, suffix = ""): string {
  const key = `${id}${suffix}`;
  const existing = objectUrls.get(key);
  if (existing) return existing;
  const url = URL.createObjectURL(blob);
  objectUrls.set(key, url);
  return url;
}

export function useLocalDemoMedia(kind?: LocalDemoMediaKind): LocalDemoMedia[] {
  const [items, setItems] = useState<LocalDemoMedia[]>(cache ?? []);
  useEffect(() => subscribeLocalDemoMedia(setItems), []);
  return kind ? items.filter((item) => item.kind === kind) : items;
}

/** Grabs a still from a local video so the gallery grid has a thumbnail. */
export async function videoPosterBlob(file: Blob): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  try {
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = url;
    await waitForVideo(video, "loadeddata");
    video.currentTime = Math.min(0.2, (Number.isFinite(video.duration) ? video.duration : 1) / 2);
    await waitForVideo(video, "seeked");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  } catch {
    return null;
  } finally {
    video.removeAttribute("src");
    URL.revokeObjectURL(url);
  }
}

function waitForVideo(video: HTMLVideoElement, event: "loadeddata" | "seeked") {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => { cleanup(); reject(new Error(`video ${event} timed out`)); }, 5000);
    const done = () => { cleanup(); resolve(); };
    const fail = () => { cleanup(); reject(new Error(`video ${event} failed`)); };
    function cleanup() {
      window.clearTimeout(timer);
      video.removeEventListener(event, done);
      video.removeEventListener("error", fail);
    }
    video.addEventListener(event, done, { once: true });
    video.addEventListener("error", fail, { once: true });
  });
}
