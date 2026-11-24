// @ts-nocheck
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useRashudi, Link, go } from "../context";
import { useMotion, gsap, reduced } from "../motion";
import { sortedListings, TYPES } from "../data";
import { Icon } from "../ui/Icons";
import { Crenel, Vents } from "../ui/Najdi";
import { Head, ListingCard } from "../ui/Cards";
import { PropMap } from "../ui/PropMap";

const IMG = "/rashudi/img/";
export const STATS = [
  { v: 8, p: "+", s: "", l: "سنوات خبرة في سوق بريدة" },
  { v: 500, p: "+", s: "", l: "عقار تم تأجيره أو بيعه" },
  { v: 300, p: "+", s: "", l: "عميل ومالك يثق بنا" },
  { v: 100, p: "", s: "٪", l: "التزام بالعقود والمواعيد" },
];
export const SERVICES = [
  { t: "بيع العقارات", d: "تسويق وبيع الأراضي والشقق والفلل في بريدة", i: "sale", img: "villas.webp" },
  { t: "تأجير العقارات", d: "إدارة وتأجير الشقق والفلل والمحلات", i: "key", img: "apartments.webp" },
  { t: "إدارة الأملاك", d: "متابعة العقود والتحصيل والصيانة نيابة عن الملاك", i: "shield", img: "commercial.webp" },
  { t: "الاستشارات العقارية", d: "تقييم وتحليل السوق العقاري ومساعدة العملاء في القرار", i: "chart", img: "land.webp" },
];

/* Hero: the word «بريدة» is a window onto the palm groves and the city; scrolling flies through it */
function Hero() {
  const { data, navigate } = useRashudi();
  const sec = useRef<HTMLElement>(null);
  const [vb, setVb] = useState({ w: 1600, h: 900 });
  const [deal, setDeal] = useState<"rent" | "sale">("rent");
  const [type, setType] = useState(""); const [dist, setDist] = useState(""); const [period, setPeriod] = useState("");
  const districts = [...new Set(data.listings.map((l) => l.district))];
  useEffect(() => { const on = () => setVb({ w: window.innerWidth, h: window.innerHeight }); on(); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []);
  useLayoutEffect(() => {
    const el = sec.current; if (!el) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: 0.15 })
        .fromTo(".mx-hero-mask", { opacity: 0, scale: 1.14 }, { opacity: 1, scale: 1, duration: 1.8, ease: "expo.out" }, 0)
        .fromTo(".mx-hero-img", { scale: 1.45 }, { scale: 1.25, duration: 2.4, ease: "expo.out" }, 0)
        .fromTo(".mx-hero-pre > *", { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: "expo.out" }, 0.7);
      if (reduced()) { gsap.set(".mx-hero-mask", { opacity: 0 }); gsap.set(".mx-hero-copy", { opacity: 1, y: 0 }); return; }
      const mobile = window.innerWidth < 760;
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "+=" + (mobile ? 110 : 150) + "%", scrub: 0.6, pin: true, anticipatePin: 1 } })
        .to(".mx-hero-svg", { scale: mobile ? 14 : 11, ease: "power2.in", duration: 1 }, 0)
        .to(".mx-hero-mask", { opacity: 0, ease: "power1.in", duration: 0.3 }, 0.5)
        .to(".mx-hero-pre", { opacity: 0, y: -40, duration: 0.25 }, 0)
        .to(".mx-hero-img", { scale: 1, ease: "none", duration: 1.3 }, 0)
        .fromTo(".mx-hero-shade", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.7)
        .fromTo(".mx-hero-copy", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.82)
        .to({}, { duration: 0.25 });
    }, el);
    return () => ctx.revert();
  }, []);
  const fs = Math.min(vb.w / 2.7, vb.h * 0.55);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams(); if (type) q.set("type", type); if (dist) q.set("district", dist); if (deal === "rent" && period) q.set("period", period);
    go("/" + deal + (q.toString() ? "?" + q : ""), navigate);
  };
  const toMap = (e: React.MouseEvent) => { e.preventDefault(); const t = document.getElementById("property-map"); const l = (window as any).__lenis; t && (l ? l.scrollTo(t, { offset: -70 }) : t.scrollIntoView({ behavior: "smooth" })); };
  return (
    <section ref={sec} className="mx-hero" aria-label="الرشودي للعقارات">
      <div className="mx-hero-bg"><img className="mx-hero-img" src={IMG + "hero-buraydah.webp"} srcSet={`${IMG}hero-buraydah-s.webp 900w, ${IMG}hero-buraydah.webp 1920w`} sizes="100vw" alt="نخيل القصيم ومدينة بريدة عند الغروب" fetchPriority="high" /></div>
      <div className="mx-hero-shade" />
      <div className="mx-hero-mask" aria-hidden="true">
        <svg className="mx-hero-svg" viewBox={`0 0 ${vb.w} ${vb.h}`} width={vb.w} height={vb.h} preserveAspectRatio="none">
          <defs><mask id="mxWord" maskUnits="userSpaceOnUse" x="0" y="0" width={vb.w} height={vb.h}>
            <rect width={vb.w} height={vb.h} fill="#fff" />
            <text className="mx-hero-word" x={vb.w / 2} y={vb.h * 0.5 + fs * 0.3} textAnchor="middle" fontSize={fs} fill="#000">بريدة</text>
          </mask></defs>
          <rect width={vb.w} height={vb.h} fill="var(--night)" mask="url(#mxWord)" />
        </svg>
      </div>
      <div className="mx-hero-pre"><p>الرشودي للعقارات · بريدة — القصيم</p><span className="mx-scrollcue"><i />مرّر للأسفل</span></div>
      <div className="mx-hero-copy">
        <div className="mx-wrap">
          <p className="mx-kicker light">نعرف بريدة.. ونفهم العقار</p>
          <h1 className="mx-h1">خبرةٌ محلية.. وقرارٌ عقاري أوضح</h1>
          <p className="mx-lead light">نسمع احتياجك، ونرشح لك الأنسب للبيع أو الإيجار، ونمشي معك حتى اكتمال الصفقة بخبرة تمتد لأكثر من 8 سنوات.</p>
          <div className="mx-cta-row">
            <Link to="/rent" className="mx-btn gold">تصفح الإيجار</Link>
            <Link to="/sale" className="mx-btn ghost-light">تصفح البيع</Link>
            <a href="#property-map" onClick={toMap} className="mx-btn ghost-light"><Icon n="map" s={18} />الخريطة</a>
            <Link to="/company-profile" className="mx-btn ghost-light">ملف هوية الرشودي</Link>
          </div>
          <form className="mx-search deal" onSubmit={submit} role="search">
            <div className="mx-search-tabs" role="tablist">
              <button type="button" className={deal === "rent" ? "on" : ""} onClick={() => setDeal("rent")}>إيجار</button>
              <button type="button" className={deal === "sale" ? "on" : ""} onClick={() => setDeal("sale")}>بيع</button>
            </div>
            <label><span>نوع العقار</span><select value={type} onChange={(e) => setType(e.target.value)}><option value="">كل الأنواع</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label><span>الحي</span><select value={dist} onChange={(e) => setDist(e.target.value)}><option value="">كل الأحياء</option>{districts.map((t) => <option key={t}>{t}</option>)}</select></label>
            {deal === "rent" && <label><span>مدة الإيجار</span><select value={period} onChange={(e) => setPeriod(e.target.value)}><option value="">كل المدد</option><option>سنوي</option><option>شهري</option><option>يومي</option></select></label>}
            <button className="mx-btn gold" type="submit"><Icon n="search" s={20} />بحث</button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* Horizontal rail (pinned on desktop, swipe on mobile) */
function Rail({ deal, title, kicker }: { deal: "rent" | "sale"; title: string; kicker: string }) {
  const { data } = useRashudi();
  const items = sortedListings(data, deal).slice(0, 8);
  const sec = useRef<HTMLElement>(null); const track = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = sec.current, tr = track.current; if (!el || !tr || reduced()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const dist = () => Math.max(0, tr.scrollWidth - tr.clientWidth);
      gsap.to(tr, { x: () => dist(), ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.5, invalidateOnRefresh: true, anticipatePin: 1 } });
    });
    return () => mm.revert();
  }, [items.length]);
  if (!items.length) return null;
  return (
    <section ref={sec} className={"mx-rail " + deal}>
      <div className="mx-wrap mx-rail-head">
        <div><p className="mx-kicker">{kicker}</p><h2 className="mx-h2" data-split>{title}</h2></div>
        <Link to={"/" + deal} className="mx-btn line">عرض الكل</Link>
      </div>
      <div className="mx-rail-track" ref={track}>
        {items.map((l) => <ListingCard key={l.id} l={l} />)}
        <Link to={"/" + deal} className="mx-rail-more"><Vents n={3} /><b>{deal === "rent" ? "كل عقارات الإيجار" : "كل عقارات البيع"}</b><span>تصفح كل العروض بالفلاتر والخريطة</span></Link>
      </div>
    </section>
  );
}

export function Numbers({ edgeTop = true }: { edgeTop?: boolean }) {
  return (
    <section className="mx-numbers">
      {edgeTop && <Crenel color="var(--paper)" size={20} className="mx-edge-top" />}
      <div className="mx-wrap">
        <Head kicker="الرشودي" title="أرقام نعتز بها" lead="ثماني سنوات في سوق بريدة، وعلاقات ميدانية مع الملاك والمستأجرين والمستثمرين." light center />
        <div className="mx-numbers-grid" data-stagger>
          {STATS.map((it) => <div key={it.l} className="mx-num"><b data-count={it.v} data-prefix={it.p} data-suffix={it.s} /><span>{it.l}</span></div>)}
        </div>
      </div>
      <Crenel color="var(--paper)" size={20} flip className="mx-edge-bottom" />
    </section>
  );
}

export function ServicesStack({ title = "خدماتنا", lead = "نغطي رحلة العقار كاملة: العرض، التفاوض، العقد، ثم المتابعة والتحصيل." }: { title?: string; lead?: string }) {
  return (
    <section className="mx-sec mx-services">
      <div className="mx-wrap mx-services-grid">
        <div className="mx-services-side">
          <Head kicker="ماذا نقدم" title={title} lead={lead} />
          <Link to="/contact" className="mx-btn line" data-reveal="up">تواصل معنا</Link>
        </div>
        <div className="mx-services-stack">
          {SERVICES.map((s, k) => (
            <article key={s.t} className={"mx-svc t" + k} style={{ ["--k" as any]: k }}>
              <div className="mx-svc-txt"><span className="mx-svc-ic"><Icon n={s.i} s={28} /></span><h3>{s.t}</h3><p>{s.d}</p></div>
              <div className="mx-svc-img"><img src={IMG + s.img} alt="" loading="lazy" /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ListCta() {
  const { wa } = useRashudi();
  return (
    <section className="mx-wacta">
      <div className="mx-wacta-bg"><img data-parallax="0.18" src={IMG + "heritage.webp"} alt="" loading="lazy" /></div>
      <Crenel color="var(--paper)" size={22} className="mx-edge-top" />
      <div className="mx-wrap mx-wacta-in">
        <h2 className="mx-h2 light" data-split>عندك عقار للإيجار أو البيع؟</h2>
        <p className="mx-lead light" data-reveal="up">أرسل تفاصيل عقارك وسيتواصل معك فريقنا لتقييمه وعرضه على العملاء المناسبين.</p>
        <div className="mx-cta-row" data-reveal="scale">
          <Link to="/list-property" className="mx-btn gold">اعرض | اطلب عقارك</Link>
          <a className="mx-btn wa" href={wa("السلام عليكم ورحمة الله 🌿\nعندي عقار وأرغب في عرضه لدى الرشودي للعقارات")} target="_blank" rel="noreferrer"><Icon n="whatsapp" s={20} />واتساب</a>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data } = useRashudi();
  const root = useRef<HTMLDivElement>(null);
  useMotion(root, [data]);
  return (
    <div ref={root} className="mx-page mx-home">
      <Hero />
      <section className="mx-sec mx-intro">
        <Crenel color="var(--paper)" size={22} className="mx-edge-top" />
        <div className="mx-wrap mx-intro-grid">
          <p className="mx-kicker">مؤسسة الرشودي للعقارات</p>
          <p className="mx-statement" data-scrub-words>نعرف بريدة.. ونفهم العقار. معرفتنا بالأحياء والأسعار معرفة ميدانية لا نظرية، ونمشي معك من أول معاينة حتى توقيع العقد.</p>
          <div className="mx-intro-links" data-stagger>
            <Link to="/rent"><b>قسم الإيجار</b><span>شقق ووحدات واستراحات ومحلات</span></Link>
            <Link to="/sale"><b>قسم البيع</b><span>أراضٍ وفلل ووحدات وشاليهات</span></Link>
            <Link to="/list-property"><b>اعرض | اطلب عقارك</b><span>أرسل تفاصيل عقارك أو طلبك</span></Link>
          </div>
        </div>
      </section>
      <Rail deal="rent" kicker="إيجار" title="أحدث عقارات الإيجار" />
      <Rail deal="sale" kicker="بيع" title="أحدث عقارات البيع" />
      <Numbers />
      <ServicesStack />
      <section className="mx-sec mx-maps" id="property-map">
        <div className="mx-maps-bg"><img data-parallax="0.2" src={IMG + "hero-buraydah.webp"} alt="" loading="lazy" /></div>
        <div className="mx-wrap mx-maps-grid">
          <div><Head kicker="الخريطة" title="العقارات على الخريطة" lead="اضغط على أي نقطة لعرض تفاصيل العقار — الرمادي للبيع والأحمر للإيجار." light /></div>
          <div data-reveal="scale"><PropMap listings={data.listings} height={500} /></div>
        </div>
      </section>
      <ListCta />
    </div>
  );
}
