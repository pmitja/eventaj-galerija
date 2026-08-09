export const howStepsEn = [
  { n: "1", title: "Create your event", description: "Enter the basic details, complete the purchase, and admin access is ready right away.", mobileDescription: "Enter the details, complete the purchase and get admin access right away.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Wedding event photo" },
  { n: "2", title: "Prepare the QR code", description: "The QR code is available as SVG and PNG. On request we can also prepare a print template.", mobileDescription: "QR code as SVG and PNG; a print template on request.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Guests at an event" },
  { n: "3", title: "Guests scan and add content", mobileTitle: "Guests add content", description: "They add photos, short videos and voice messages straight from the browser. No app and no account.", mobileDescription: "Photos, videos and voice messages straight from the browser. No app and no account.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Guest using a phone at an event" },
  { n: "4", title: "Everything in one place", description: "Photos and videos are gathered in one shared gallery. The organiser can manage the content, run the Live Slideshow and download photos as a ZIP.", mobileDescription: "Content in one shared gallery, Live Slideshow and ZIP download.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Shared event memories" },
] as const;

export const featuresEn = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Digital album", description: "Guest photos in one clear shared gallery.", mobile: "Guest photos in one shared gallery." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Short videos", description: "Up to 20 videos are included, each no longer than 60 seconds.", mobile: "Up to 20 videos, 60 seconds each." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "ZIP download", description: "The organiser can also download all photos in a single ZIP file.", mobile: "All photos in a single ZIP file." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "No app", description: "Everything runs straight in the browser. No app and no user account.", mobile: "All in the browser, no app or account." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "QR code", description: "The event QR code is available in SVG and PNG formats.", mobile: "QR code in SVG and PNG formats." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Live Slideshow", description: "Newly added photos appear live on a projector or TV screen.", mobile: "New photos live on a projector or TV." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Comments", description: "Guests can leave messages, wishes and reactions on the photos.", mobile: "Messages, wishes and reactions on photos." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "Photo search by face", mobileTitle: "Search by face", description: "A selfie helps a guest find the photos they appear in within seconds.", mobile: "A selfie finds a guest's photos in seconds." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "AI assesses photos technically and helps you identify blurry and duplicate shots.", mobile: "AI assesses photos technically and flags blurry and duplicate shots." },
] as const;

export const plansEn = [{
  id: "event", name: "Event gallery", price: "€35", description: "Everything you need for one event",
  features: ["QR gallery without an app", "Unlimited guests", "Photos and comments", "Audio guestbook", "Original photo downloads", "Up to 20 videos, each no longer than 60 seconds", "Event administration and QR code download", "Live Slideshow", "ZIP photo export", "Gallery available for 180 days"],
  featured: true,
}] as const;

export const addOnsEn = [
  { name: "AI Best Photos", note: "up to 3,000 photos", price: "+€15" },
  { name: "Unlimited videos", note: "fair use, up to 1,000 videos", price: "+€15" },
] as const;

export const faqsEn = [
  ["Do guests need to install an app?", "No. Guests scan the QR code and the gallery opens directly in the browser. No app and no registration required."],
  ["How do I get the QR code?", "The event QR code can be downloaded in the admin area in SVG and PNG. On request we can also prepare a print template."],
  ["Can I download guest photos?", "Yes. You can download an individual photo directly from the gallery. Once the event ends, a ZIP with all photos arrives by email, and you can also prepare one yourself in the admin portal."],
  ["How does the audio guestbook work?", "In the gallery a guest picks the voice message option, allows microphone access and records up to two minutes. They can listen before sending and record again if needed. No app and no account required."],
  ["How long is the gallery available?", "The gallery is available for 180 days after the event."],
  ["Can guests upload videos?", "Yes, up to 20 videos per event. Each video can be up to 60 seconds and 500 MB. Videos appear in the gallery, but not in the Live Slideshow. A €15 add-on removes the video limit (fair use, up to 1,000 per event)."],
  ["Are the photos private?", "The event gallery is not publicly indexed and is reachable only through an unpredictable link or the QR code. It is not password protected, so share the link with your guests only. The organiser can hide the whole gallery or an individual photo at any time."],
  ["What does AI Best Photos include?", "For €15 per event, the add-on classifies technical quality and detects duplicates for up to 3,000 photos."],
] as const;
