import React from "react";
import { Listing, listingHref, listingImage, priceLabel, dealLabel, listingWaText } from "../data";
import { Link, useRashudi } from "../context";
import { Icon } from "./Icons";

export function ListingCard({ l }: { l: Listing }) {
  const { wa } = useRashudi();
  return (
    <article className={"mx-ucard " + l.deal}>
      <Link to={listingHref(l)} className="mx-ucard-img">
        <img src={listingImage(l)} alt={l.title} loading="lazy" />
        <span className="mx-ucard-tags">
          <em className={"mx-chip deal " + l.deal}>{dealLabel(l.deal)}</em>
          {l.featured && <em className="mx-chip feat">مميز</em>}
        </span>
        {!l.image && <span className="mx-illus">صورة توضيحية</span>}
      </Link>
      <div className="mx-ucard-body">
        <small>{l.type}</small>
        <h3><Link to={listingHref(l)}>{l.title}</Link></h3>
        <div className="mx-ucard-meta">
          <span><Icon n="pin" s={16} /> {l.district} — {l.city}</span>
          {l.area ? <span><Icon n="area" s={16} /> {l.area} م²</span> : null}
        </div>
        <div className="mx-ucard-price">{priceLabel(l)}</div>
        <div className="mx-ucard-actions">
          <Link to={listingHref(l)} className="mx-btn line sm">عرض التفاصيل</Link>
          <a className="mx-btn wa sm" href={wa(listingWaText(l))} target="_blank" rel="noreferrer"><Icon n="whatsapp" s={18} />واتساب</a>
        </div>
      </div>
    </article>
  );
}

export function Head({ kicker, title, lead, light = false, center = false }:
  { kicker?: string; title: string; lead?: string; light?: boolean; center?: boolean }) {
  return (
    <header className={"mx-head" + (center ? " center" : "")}>
      {kicker && <p className={"mx-kicker" + (light ? " light" : "")} data-reveal="fade">{kicker}</p>}
      <h2 className={"mx-h2" + (light ? " light" : "")} data-split>{title}</h2>
      {lead && <p className={"mx-lead" + (light ? " light" : "")} data-reveal="up" data-delay="0.15">{lead}</p>}
    </header>
  );
}

export function Marquee({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const row = [...items, ...items, ...items];
  return (
    <div className={"mx-marquee" + (dark ? " dark" : "")} aria-hidden="true">
      <div className="mx-marquee-track">
        {[0, 1].map((k) => (<div className="mx-marquee-row" key={k}>{row.map((t, i) => <span key={i}>{t}<i /></span>)}</div>))}
      </div>
    </div>
  );
}
