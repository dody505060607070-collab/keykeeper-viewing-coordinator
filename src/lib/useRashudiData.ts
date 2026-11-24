import { useQuery } from "@tanstack/react-query";

import { coverImage, publicPropertiesQuery, type PublicProperty } from "@/lib/site-data";
import { SAMPLE, type Listing, type Period, type RashudiData } from "@/rashudi/data";

const CONTACT: RashudiData["contact"] = {
  phone: "0550818020",
  whatsapp: "966550818020",
  email: "info@al-rashudi.com",
  city: "بريدة — القصيم",
  hours: "السبت — الخميس، 9ص إلى 10م",
};

function toPeriod(p: string | null): Period | undefined {
  if (!p) return "سنوي";
  if (/month|شهر/i.test(p)) return "شهري";
  if (/day|daily|يوم/i.test(p)) return "يومي";
  return "سنوي";
}

export function toListing(p: PublicProperty): Listing {
  const deal = p.purpose === "sale" ? "sale" : "rent";
  const l: Listing = {
    id: p.code || p.id,
    title: p.name,
    deal,
    type: p.property_type ?? "",
    district: p.district ?? "",
    city: p.city || "بريدة",
    price: p.price_value ?? null,
    featured: !!p.is_featured,
    createdAt: p.created_at,
  };
  if (p.price_text) l.priceText = p.price_text;
  if (deal === "rent") { const per = toPeriod(p.rent_period); if (per) l.period = per; }
  const img = coverImage(p);
  if (img) l.image = img;
  if (p.latitude != null && p.longitude != null) { l.lat = p.latitude; l.lng = p.longitude; }
  return l;
}

export function useRashudiData(): RashudiData {
  const rent = useQuery(publicPropertiesQuery("rent", 200));
  const sale = useQuery(publicPropertiesQuery("sale", 200));
  if (!rent.data || !sale.data) return SAMPLE;
  const listings = [...rent.data, ...sale.data]
    .map(toListing)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  if (!listings.length) return SAMPLE;
  return { listings, contact: CONTACT };
}
