import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { useRashudi, Link } from "../context";
import { useMotion, gsap, ScrollTrigger, fmt } from "../motion";
import { Deal, TYPES, sortedListings } from "../data";
import { Icon } from "../ui/Icons";
import { Crenel } from "../ui/Najdi";
import { ListingCard } from "../ui/Cards";
import { PropMap } from "../ui/PropMap";
import { Calculator } from "../ui/Calculator";

const IMG = "/rashudi/img/";
const COPY = {
  rent: { title: "قسم الإيجار", lead: "شقق ووحدات واستراحات وصالات ومحلات للإيجار في أحياء بريدة — سنوي وشهري ويومي.", img: "apartments.webp" },
  sale: { title: "قسم البيع", lead: "أراضٍ وفلل ووحدات وشاليهات وأحواش للبيع في بريدة والقصيم.", img: "villas.webp" },
};

/* /rent and /sale — same page, different deal */
export default function Listings({ deal }: { deal: Deal }) {
  const { data, path } = useRashudi();
  const qs = new URLSearchParams(path.split("?")[1] || "");
  const [type, setType] = useState(qs.get("type") || "");
  const [district, setDistrict] = useState(qs.get("district") || "");
  const [period, setPeriod] = useState(qs.get("period") || "");
  const [text, setText] = useState(""); const [sort, setSort] = useState("new");
  const [min, setMin] = useState(""); const [max, setMax] = useState("");
  const [view, setView] = useState<"grid" | "map">(qs.get("view") === "map" ? "map" : "grid");
  const [applied, setApplied] = useState(0);
  const root = useRef<HTMLDivElement>(null); const grid = useRef<HTMLDivElement>(null);
  useMotion(root, [data, deal]);
  const all = useMemo(() => sortedListings(data, deal), [data, deal]);
  const types = TYPES.filter((t) => all.some((l) => l.type === t));
  const districts = [...new Set(all.map((l) => l.district))];
  const list = useMemo(() => {
    let r = all.filter((l) => (!type || l.type === type) && (!district || l.district === district) && (!period || l.period === period) &&
      (!text || (l.title + l.district + l.type).includes(text.trim())) && (!min || (l.price ?? 0) >= +min) && (!max || (l.price ?? Infinity) <= +max));
    if (sort === "low") r = [...r].sort((a, b) => (a.price ?? 9e12) - (b.price ?? 9e12));
    if (sort === "high") r = [...r].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    return r;
  }, [all, type, district, period, sort, applied]);
  useLayoutEffect(() => {
    if (!grid.current) return;
    gsap.fromTo(grid.current.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "expo.out", overwrite: true });
    ScrollTrigger.refresh();
  }, [list, view]);
  const reset = () => { setType(""); setDistrict(""); setPeriod(""); setText(""); setSort("new"); setMin(""); setMax(""); setApplied((x) => x + 1); };
  const c = COPY[deal];
  return (
    <div ref={root} className={"mx-page mx-sale " + deal}>
      <section className="mx-phero">
        <div className="mx-phero-bg"><img data-parallax="0.25" src={IMG + c.img} alt="" /></div>
        <div className="mx-wrap mx-phero-in">
          <p className="mx-kicker light" data-reveal="fade">الرشودي للعقارات · بريدة</p>
          <h1 className="mx-h1" data-split>{c.title}</h1>
          <p className="mx-lead light" data-reveal="up" data-delay="0.2">{c.lead}</p>
          <div className="mx-chips" data-reveal="up" data-delay="0.35">
            <button className={!type ? "on" : ""} onClick={() => setType("")}>الكل</button>
            {types.map((t) => <button key={t} className={type === t ? "on" : ""} onClick={() => setType(t)}>{t}</button>)}
          </div>
        </div>
        <Crenel color="var(--paper)" size={22} flip className="mx-edge-bottom" />
      </section>
      <section className="mx-sec mx-filter-sec">
        <div className="mx-wrap">
          <form className="mx-filter" data-reveal="up" onSubmit={(e) => { e.preventDefault(); setApplied((x) => x + 1); }}>
            <div className="mx-filter-title"><Icon n="search" s={20} /> بحث وتصفية</div>
            <label className="mx-field"><span>ابحث بالاسم أو الحي</span><input value={text} onChange={(e) => setText(e.target.value)} placeholder="مثال: الافق" /></label>
            <label className="mx-field"><span>الحي</span><select value={district} onChange={(e) => setDistrict(e.target.value)}><option value="">كل الأحياء</option>{districts.map((d) => <option key={d}>{d}</option>)}</select></label>
            <label className="mx-field"><span>نوع العقار</span><select value={type} onChange={(e) => setType(e.target.value)}><option value="">كل الأنواع</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
            {deal === "rent"
              ? <label className="mx-field"><span>مدة الإيجار</span><select value={period} onChange={(e) => setPeriod(e.target.value)}><option value="">كل المدد</option><option>سنوي</option><option>شهري</option><option>يومي</option></select></label>
              : <label className="mx-field"><span>ترتيب</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="new">الأحدث</option><option value="low">الأقل سعراً</option><option value="high">الأعلى سعراً</option></select></label>}
            <label className="mx-field"><span>السعر من (ريال)</span><input inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} placeholder="0" /></label>
            <label className="mx-field"><span>السعر إلى (ريال)</span><input inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} placeholder="بدون حد" /></label>
            <div className="mx-filter-actions">
              <button type="button" className="mx-btn line sm" onClick={reset}>إعادة تعيين</button>
              <button type="submit" className="mx-btn gold sm"><Icon n="search" s={18} />بحث</button>
            </div>
          </form>
          <div className="mx-results-bar">
            <p>تم العثور على <b>{fmt(list.length, "ar")}</b> عقار {deal === "rent" ? "للإيجار" : "للبيع"} في بريدة</p>
            <div className="mx-toggle">
              <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")}><Icon n="grid" s={18} />شبكة</button>
              <button className={view === "map" ? "on" : ""} onClick={() => setView("map")}><Icon n="map" s={18} />الخريطة</button>
            </div>
          </div>
          {view === "grid" ? (list.length
            ? <div className="mx-results" ref={grid}>{list.map((l) => <div key={l.id} className="mx-res">{<ListingCard l={l} />}</div>)}</div>
            : <div className="mx-empty" ref={grid}><b>لا توجد نتائج مطابقة</b><p>جرّب تغيير الحي أو نوع العقار، أو أعد تعيين البحث.</p><button className="mx-btn line sm" onClick={reset}>إعادة تعيين</button></div>)
            : <div ref={grid}><PropMap listings={list} height="min(70vh, 640px)" filter={false} /></div>}
        </div>
      </section>
      <section className="mx-sec mx-advisor">
        <div className="mx-wrap">
          <div className="mx-advisor-card" data-reveal="scale">
            <div className="mx-advisor-img"><img data-parallax="0.15" src={IMG + "heritage.webp"} alt="" loading="lazy" /></div>
            <div className="mx-advisor-txt">
              <h2 className="mx-h2 light" data-split>ما لقيت المناسب؟</h2>
              <p className="mx-lead light">أرسل طلبك ونرشح لك الأنسب من عروضنا في بريدة.</p>
              <Link to="/list-property" className="mx-btn gold">اعرض | اطلب عقارك</Link>
            </div>
          </div>
        </div>
      </section>
      {deal === "sale" && <Calculator />}
    </div>
  );
}
