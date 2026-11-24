// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Listing, Deal, listingHref, listingImage, priceLabel } from "../data";
import { useRashudi, go } from "../context";
import { fmt } from "../motion";

/* Leaflet map of Buraydah: maroon pins = rent, grey pins = sale (same convention as the current site). */
export function PropMap({ listings, height = 520, filter = true }: { listings: Listing[]; height?: number | string; filter?: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const { navigate } = useRashudi();
  const [deal, setDeal] = useState<"" | Deal>("");
  const shown = listings.filter((l) => l.lat && l.lng && (!deal || l.deal === deal));
  useEffect(() => {
    let map: any; let dead = false;
    import("leaflet").then((mod) => {
      const L: any = (mod as any).default || mod;
      if (dead || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false }).setView([26.326, 43.975], 12);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { attribution: "&copy; OpenStreetMap &copy; CARTO", subdomains: "abcd", maxZoom: 19 }).addTo(map);
      const pts: [number, number][] = [];
      shown.forEach((l) => {
        const icon = L.divIcon({ className: "mx-pin " + l.deal, html: `<span class="mx-pin-dot"></span>`, iconSize: [26, 26], iconAnchor: [13, 13] });
        L.marker([l.lat, l.lng], { icon }).addTo(map).bindPopup(
          `<div class="mx-pop"><img src="${listingImage(l)}" alt=""><b>${l.title}</b><span>${l.district} • ${priceLabel(l)}</span><a href="${listingHref(l)}" data-go="${listingHref(l)}">عرض التفاصيل</a></div>`);
        pts.push([l.lat!, l.lng!]);
      });
      if (pts.length > 1) map.fitBounds(pts, { padding: [50, 50], maxZoom: 13 });
      map.on("popupopen", (e: any) => {
        const a = e.popup.getElement()?.querySelector("a[data-go]");
        a?.addEventListener("click", (ev: MouseEvent) => { ev.preventDefault(); go(a.getAttribute("data-go"), navigate); });
      });
    });
    return () => { dead = true; map?.remove(); };
  }, [listings, deal]);
  return (
    <div className="mx-map" style={{ height }}>
      <div ref={el} className="mx-map-el" />
      {filter && (
        <div className="mx-map-filter">
          {([["", "الكل"], ["sale", "بيع"], ["rent", "إيجار"]] as const).map(([k, t]) => (
            <button key={k} className={deal === k ? "on" : ""} onClick={() => setDeal(k as any)}>{t}</button>
          ))}
        </div>
      )}
      <div className="mx-map-legend"><span><i className="s" />عقارات للبيع</span><span><i className="r" />عقارات للإيجار</span><b>{fmt(shown.length, "ar")} عقار على الخريطة</b></div>
    </div>
  );
}
