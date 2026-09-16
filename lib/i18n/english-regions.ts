/** Regionalise English copy while sharing the same translated content. */
export function englishRegionCopy<T>(value: T, region: "en" | "en-us"): T {
  if (typeof value === "string") {
    const symbol = region === "en-us" ? "$" : "£";
    let text = value.replace(/[€£]\s*(\d[\d,.]*)/g, (_, amount) => `${symbol}${amount}`)
      .replace(/(\d[\d,.]*)\s*€/g, (_, amount) => `${symbol}${amount}`)
      .replace(/\bEUR\b/g, region === "en-us" ? "USD" : "GBP");
    if (region === "en-us") text = text.replace(/en-GB/g, "en-US").replace(/en_GB/g, "en_US").replace(/organiser/g, "organizer").replace(/organise/g, "organize").replace(/colour/g, "color");
    return text as T;
  }
  if (Array.isArray(value)) return value.map(item => englishRegionCopy(item, region)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, englishRegionCopy(item, region)])) as T;
  return value;
}

export function withEnglishUS<T extends { en: unknown }>(copy: T): T & { "en-us": T["en"] } {
  return { ...copy, en: englishRegionCopy(copy.en, "en"), "en-us": englishRegionCopy(copy.en, "en-us") };
}
