/** Anna & Mark demo wedding photos shipped in /public. */
export const DEMO_PHOTO = (n: number) => `/gallery/ana-marko/photo-${n}.jpg`;

/** QR placement photos shipped in /public/marketing/qr-placement. */
export const PLACEMENT_PHOTO = (name: "table" | "welcome-sign" | "menu-card" | "projection") => `/marketing/qr-placement/${name}.jpg`;
