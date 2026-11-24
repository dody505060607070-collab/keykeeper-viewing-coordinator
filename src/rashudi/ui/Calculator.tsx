import React, { useMemo, useState } from "react";
import { fmt } from "../motion";
import { Head } from "./Cards";

export function Calculator() {
  const [price, setPrice] = useState(850000);
  const [down, setDown] = useState(20);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(4.5);
  const r = useMemo(() => {
    const loan = Math.max(0, price * (1 - down / 100));
    const n = years * 12, i = rate / 100 / 12;
    const m = n ? (i ? (loan * i) / (1 - Math.pow(1 + i, -n)) : loan / n) : 0;
    const total = m * n;
    return { loan, m, total, interest: Math.max(0, total - loan), downAmt: price - loan };
  }, [price, down, years, rate]);
  const all = r.downAmt + r.total || 1;
  const C = 2 * Math.PI * 70;
  const segs = [
    { v: r.downAmt / all, c: "var(--gold)", l: "الدفعة الأولى" },
    { v: r.loan / all, c: "var(--navy)", l: "مبلغ التمويل" },
    { v: r.interest / all, c: "var(--clay)", l: "الأرباح التقديرية" },
  ];
  let off = 0;
  return (
    <section className="mx-sec mx-calc-sec">
      <div className="mx-wrap">
        <Head kicker="أداة مساعدة" title="حاسبة التمويل العقاري" lead="احسب القسط الشهري التقريبي قبل التواصل معنا — النتيجة تقديرية للاسترشاد فقط." />
        <div className="mx-calc" data-reveal="up">
          <div className="mx-calc-form">
            <Field label="سعر العقار (ريال)" value={price} min={200000} max={10000000} step={10000} onChange={setPrice} show={fmt(price, "en")} />
            <Field label="الدفعة الأولى (%)" value={down} min={0} max={90} step={1} onChange={setDown} show={fmt(down, "ar") + "٪"} />
            <Field label="مدة التمويل (سنة)" value={years} min={1} max={30} step={1} onChange={setYears} show={fmt(years, "ar") + " سنة"} />
            <Field label="نسبة الفائدة السنوية (%)" value={rate} min={0} max={12} step={0.1} onChange={setRate} show={rate.toLocaleString("ar-SA", { maximumFractionDigits: 1 }) + "٪"} />
          </div>
          <div className="mx-calc-out">
            <div className="mx-donut">
              <svg viewBox="0 0 180 180" aria-hidden="true">
                <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="18" />
                {segs.map((s, k) => {
                  const len = s.v * C; const el = (
                    <circle key={k} cx="90" cy="90" r="70" fill="none" stroke={s.c} strokeWidth="18"
                      strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 90 90)" />
                  ); off += len; return el;
                })}
              </svg>
              <div className="mx-donut-c">
                <small>القسط الشهري</small>
                <b>{fmt(r.m, "ar")}</b>
                <small>ريال</small>
              </div>
            </div>
            <ul className="mx-calc-legend">
              {segs.map((s) => <li key={s.l}><i style={{ background: s.c }} />{s.l}</li>)}
            </ul>
            <dl className="mx-calc-rows">
              <div><dt>مبلغ التمويل</dt><dd>{fmt(r.loan, "ar")} ريال</dd></div>
              <div><dt>إجمالي المدفوعات</dt><dd>{fmt(r.total, "ar")} ريال</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field(p: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; show: string }) {
  const pct = ((p.value - p.min) / (p.max - p.min)) * 100;
  return (
    <label className="mx-field range">
      <span className="mx-field-top"><span>{p.label}</span><b>{p.show}</b></span>
      <input type="range" min={p.min} max={p.max} step={p.step} value={p.value}
        style={{ ["--p" as any]: pct + "%" }} onChange={(e) => p.onChange(parseFloat(e.target.value))} />
      <input className="mx-field-num" type="number" inputMode="decimal" min={p.min} max={p.max} step={p.step} value={p.value}
        aria-label={p.label} onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) p.onChange(Math.min(p.max, Math.max(p.min, v))); }} />
    </label>
  );
}
