/* الرشودي للعقارات — data model + sample data (mirrors alrashudi.sa today).
   In the live site pass real data from Supabase to <RashudiProvider data={...}> in exactly this shape. */

export type Deal = "rent" | "sale";
export type Period = "سنوي" | "شهري" | "يومي";

export type Listing = {
  id: string;              // URL: /properties/<id>  (e.g. "954")
  title: string;           // "وحدة علوية للايجار السنوي حي الافق"
  deal: Deal;              // rent | sale
  type: string;            // وحدة علوية، وحدة أرضية، أستراحة، شقة، صالة تجارية، أرض، محل، فيلا، دبلوكس، حوش، شاليه، دور، مكاتب ...
  district: string;        // الافق
  city: string;            // بريدة
  price: number | null;    // SAR (number) when known
  priceText?: string;      // free text when the price is written by hand: "السوم 400الف"، "750للمتر"
  period?: Period;         // rent only
  featured?: boolean;      // «مميز»
  area?: number;           // m²
  rooms?: number;
  image?: string;          // first photo URL (Supabase storage). Empty = an illustrative image by type
  lat?: number; lng?: number;
  createdAt?: string;      // ISO date, newest first
};

export type Contact = {
  phone: string; whatsapp: string; email: string; city: string; hours: string; mapUrl?: string;
};

export type RashudiData = { listings: Listing[]; contact: Contact };

const IMG = "/rashudi/img/";

/* illustrative image per property type (used only when a listing has no photo) */
export function typeImage(type: string) {
  if (/أرض|حوش/.test(type)) return IMG + "land.webp";
  if (/استراح|أستراح|شاليه/.test(type)) return IMG + "istiraha.webp";
  if (/صالة|محل|مكاتب|مركز|تجاري/.test(type)) return IMG + "commercial.webp";
  if (/فيلا|دبلوكس|دوبلكس/.test(type)) return IMG + "villas.webp";
  return IMG + "apartments.webp";
}
export const listingImage = (l: Listing) => l.image || typeImage(l.type);

/* Buraydah centre ≈ 26.326, 43.975. Sample coordinates are approximate, for the preview map only. */
const L = (id: string, deal: Deal, title: string, type: string, district: string, price: number | null, extra: Partial<Listing> = {}): Listing =>
  ({ id, deal, title, type, district, city: "بريدة", price, featured: deal === "rent", period: deal === "rent" ? "سنوي" : undefined, ...extra });

export const SAMPLE: RashudiData = {
  listings: [
    L("954", "rent", "وحدة ارضية للايجار السنوي حي سلطانة", "وحدة أرضية", "النخيل _ سلطانه", 33000, { lat: 26.302, lng: 43.948 }),
    L("r-ufuq", "rent", "وحدة علوية للايجار السنوي حي الافق", "وحدة علوية", "الافق", 22000, { lat: 26.377, lng: 43.991 }),
    L("r-hadiya", "rent", "استراحة شباب للايجار السنوي حي الهدية", "أستراحة", "الهديه", 10000, { lat: 26.392, lng: 43.938 }),
    L("r-nahda", "rent", "صالة تجارية للايجار السنوي حي النهضة", "صالة تجارية", "النهضه", 70000, { lat: 26.344, lng: 43.990 }),
    L("r-khubaib", "rent", "شقه عزاب للايجار السنوي حي الخبيب", "شقة", "الخبيب", 5000, { lat: 26.318, lng: 43.981 }),
    L("r-sultana", "rent", "صالات للايجار السنوي حي سلطانه", "صالة تجارية", "النخيل _ سلطانه", 65000, { lat: 26.298, lng: 43.955 }),
    L("s-naqeeb", "sale", "للبيع استراحة في حي النقيب الشمالي", "أستراحة", "النقيب", 400000, { priceText: "السوم 400 ألف", lat: 26.405, lng: 43.962 }),
    L("s-zarqa", "sale", "للبيع ارض في حي الزرقاء", "أرض", "الزرقاء", null, { priceText: "750 ريال للمتر", lat: 26.288, lng: 44.012 }),
    L("s-shafaq", "sale", "للبيع فيلا في حي الشفق", "فيلا", "الشفق", 770000, { priceText: "السوم 770 ألف", lat: 26.365, lng: 43.934 }),
    L("s-akhdar", "sale", "للبيع وحدتين علويات في حي الاخضر", "وحدة علوية", "الاخضر", 530000, { lat: 26.331, lng: 44.021 }),
    L("s-qusaiba", "sale", "للبيع حوش في حي القصيعة", "حوش", "القصيعة", null, { priceText: "190 ريال للمتر", lat: 26.276, lng: 43.996 }),
    L("s-lusaib", "sale", "للبيع شالية في حي اللسيب", "شاليه", "اللسيب", 235000, { lat: 26.412, lng: 44.008 }),
  ],
  contact: {
    phone: "0550818020",
    whatsapp: "966550818020",
    email: "info@al-rashudi.com",
    city: "بريدة — القصيم",
    hours: "السبت — الخميس، 9ص إلى 10م",
  },
};

export const TYPES = ["وحدة علوية", "وحدة أرضية", "أستراحة", "شقة", "صالة تجارية", "أرض", "محل", "فيلا", "دبلوكس", "حوش", "شاليه", "دور", "مكاتب"];

/* ---------- helpers ---------- */
export const money = (n: number | null | undefined) => (n == null ? "" : Math.round(n).toLocaleString("en-US"));
export const dealLabel = (d: Deal) => (d === "rent" ? "إيجار" : "بيع");
export const listingHref = (l: Listing) => `/properties/${l.id}`;
export const waLink = (number: string, text?: string) => `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const listingWaText = (l: Listing) =>
  `السلام عليكم ورحمة الله 🌿\nأرغب في الاستفسار عن هذا العقار:\n• الاسم: ${l.title}\n• الحي: ${l.district} — ${l.city}\n• الرابط: ${typeof window !== "undefined" ? window.location.origin : ""}${listingHref(l)}`;
export function priceLabel(l: Listing) {
  if (l.priceText) return l.priceText;
  if (l.price == null) return "السعر عند التواصل";
  return money(l.price) + " ريال" + (l.deal === "rent" && l.period ? " / " + l.period : "");
}
export function sortedListings(d: RashudiData, deal?: Deal) {
  return d.listings.filter((l) => !deal || l.deal === deal)
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.createdAt || "").localeCompare(a.createdAt || ""));
}
export function siteStats(d: RashudiData) {
  return {
    rent: d.listings.filter((l) => l.deal === "rent").length,
    sale: d.listings.filter((l) => l.deal === "sale").length,
    districts: new Set(d.listings.map((l) => l.district)).size,
    onMap: d.listings.filter((l) => l.lat && l.lng).length,
  };
}
