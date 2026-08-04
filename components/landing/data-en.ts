export const howStepsEn = [
  { n: "1", title: "Create and pay for your event", description: "Enter your organisation and event details and complete the secure purchase.", mobileDescription: "Enter the event details and complete your purchase.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Wedding event photo" },
  { n: "2", title: "Download the QR code for guests", mobileTitle: "Prepare the QR code", description: "Download your event QR code as SVG or PNG and add it to your printed or digital materials.", mobileDescription: "Download the QR code as SVG or PNG for your event materials.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Guests at an event" },
  { n: "3", title: "Guests scan and upload — no sign-in", mobileTitle: "Guests upload — no sign-in", description: "The gallery works in a phone browser. Guests open the link and add photos, short videos or a voice message without an app or account.", mobileDescription: "Guests scan the QR and add photos, videos or a voice message without an app or sign-in.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Guest using a phone at an event" },
  { n: "4", title: "Review and download your shared memories", mobileTitle: "Relive your shared memories", description: "Photos and videos are collected in one gallery. The organiser can manage the content, run a slideshow and download a ZIP.", mobileDescription: "Manage photos and videos, run a slideshow or download a ZIP.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Shared event memories" },
] as const;

export const featuresEn = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Digital album", description: "Guest photos in one elegant shared gallery.", mobile: "Guest photos in one shared gallery." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Short videos", description: "20 videos of up to 60 seconds are included with your event gallery.", mobile: "20 videos up to 60 seconds." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "ZIP download", description: "The organiser can download gallery photos in a ZIP file.", mobile: "Download gallery photos as a ZIP." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "No app", description: "Guests join in their browser — no installation or sign-in.", mobile: "Everything happens in the browser, with no sign-in." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "Printable QR code", mobileTitle: "QR code", description: "Download the event QR code as SVG or PNG and add it to your materials.", mobile: "QR code in SVG or PNG format." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Live slideshow", description: "Photos appear live on a projector or TV screen.", mobile: "Photos on a projector or TV." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Comments", description: "Guests can add messages and wishes to photos.", mobile: "Messages and wishes alongside photos." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "AI face search", mobileTitle: "Face search", description: "Guests use a selfie to find all their event photos in seconds.", mobile: "Guests use a selfie to find their photos." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "AI assesses technical quality and flags blurry and duplicate photos.", mobile: "AI flags the best, blurry and duplicate photos." },
] as const;

export const plansEn = [{
  id: "event", name: "Event gallery", price: "€35", description: "Everything you need for one event",
  features: ["QR gallery without an app", "Unlimited guests", "Photo uploads and comments", "Audio guestbook and original downloads", "20 videos up to 60 seconds", "Admin portal and QR downloads", "Live slideshow and ZIP export", "180-day gallery retention"],
  featured: true,
}] as const;

export const addOnsEn = [["AI Best Photos · up to 3,000 photos", "+€15"], ["Unlimited videos · fair use", "+€15"]] as const;

export const faqsEn = [
  ["Do guests need to install an app?", "No. Guests scan the QR code and the gallery opens in their browser. They can add photos without an app or registration."],
  ["How do I get the QR code?", "You receive the event QR code by email and can download it as SVG or PNG."],
  ["Can I download guest photos?", "Yes. You can download an individual photo directly from the gallery, and prepare a ZIP export of all photos in the admin portal."],
  ["How does the audio guestbook work?", "A guest taps the voice-message option, allows microphone access and records up to two minutes. They can listen before sending and record again if needed. No app or account is required."],
  ["How long is the gallery available?", "The gallery is stored for 180 days after the event."],
  ["Can guests upload videos?", "Yes. The package includes up to 20 videos per event. Each video can be up to 60 seconds and 500 MB. Unlimited videos are available as a €15 fair-use add-on."],
  ["Are the photos private?", "The gallery is not publicly indexed and is available through an unpredictable link or QR code. The organiser controls gallery and photo visibility."],
  ["What does AI Best Photos include?", "For €15 per event, the add-on classifies technical quality and detects duplicates for up to 3,000 photos."],
] as const;
