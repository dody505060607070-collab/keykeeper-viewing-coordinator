// @ts-nocheck
import React, { useRef, useState } from "react";
import { useRashudi, Link } from "../context";
import { useMotion } from "../motion";
import { Icon } from "../ui/Icons";
import { Crenel, Vents } from "../ui/Najdi";

const IMG = "/rashudi/img/";
export default function Contact() {
  const { data, wa } = useRashudi();
  const c = data.contact;
  const root = useRef<HTMLDivElement>(null);
  useMotion(root, [data]);
  const [f, setF] = useState({ name: "", phone: "", msg: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "اكتب اسمك";
    if (!/^(05\d{8}|9665\d{8}|\+9665\d{8})$/.test(f.phone.replace(/\s/g, ""))) er.phone = "اكتب رقم جوال سعودي صحيح، مثل 05xxxxxxxx";
    if (f.msg.trim().length < 3) er.msg = "اكتب استفسارك";
    setErr(er); if (Object.keys(er).length) return;
    window.open(wa(`السلام عليكم ورحمة الله 🌿\nالاسم: ${f.name}\nالجوال: ${f.phone}\n${f.msg}`), "_blank", "noopener");
  };
  const cards = [
    { i: "phone", t: "الهاتف", v: c.phone, href: `tel:${c.phone}`, ltr: true },
    { i: "mail", t: "البريد الإلكتروني", v: c.email, href: `mailto:${c.email}` },
    { i: "pin", t: "الموقع", v: c.city },
    { i: "clock", t: "أوقات العمل", v: c.hours },
  ];
  return (
    <div ref={root} className="mx-page mx-contact">
      <section className="mx-phero">
        <div className="mx-phero-bg"><img data-parallax="0.25" src={IMG + "hero-buraydah.webp"} alt="" /></div>
        <div className="mx-wrap mx-phero-in">
          <p className="mx-kicker light" data-reveal="fade">فريقنا في خدمتك</p>
          <h1 className="mx-h1" data-split>تواصل معنا</h1>
          <p className="mx-lead light" data-reveal="up" data-delay="0.2">فريقنا جاهز للرد على استفساراتك العقارية في بريدة عبر الهاتف أو واتساب أو البريد.</p>
        </div>
        <Crenel color="var(--paper)" size={22} flip className="mx-edge-bottom" />
      </section>
      <section className="mx-sec mx-ccards-sec">
        <div className="mx-wrap"><div className="mx-ccards" data-stagger>
          {cards.map((k) => {
            const inner = <><span className="mx-ccard-ic"><Icon n={k.i} s={26} /></span><small>{k.t}</small><b dir={k.ltr ? "ltr" : undefined}>{k.v}</b></>;
            return k.href ? <a key={k.t} className="mx-ccard" href={k.href}>{inner}</a> : <div key={k.t} className="mx-ccard">{inner}</div>;
          })}
        </div></div>
      </section>
      <section className="mx-sec mx-form-sec">
        <div className="mx-wrap mx-form-grid">
          <form className="mx-form" onSubmit={submit} noValidate data-reveal="up">
            <Vents n={3} />
            <h2 className="mx-h2">أرسل استفسارك</h2>
            <div className="mx-form-row">
              <label className={"mx-field" + (err.name ? " bad" : "")}><span>الاسم</span><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />{err.name && <em>{err.name}</em>}</label>
              <label className={"mx-field" + (err.phone ? " bad" : "")}><span>رقم الجوال</span><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" dir="ltr" placeholder="05xxxxxxxx" autoComplete="tel" />{err.phone && <em>{err.phone}</em>}</label>
            </div>
            <label className={"mx-field" + (err.msg ? " bad" : "")}><span>رسالتك</span><textarea rows={5} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} />{err.msg && <em>{err.msg}</em>}</label>
            <button className="mx-btn wa full" type="submit"><Icon n="whatsapp" s={22} />إرسال عبر واتساب</button>
            <p className="mx-note">سيفتح واتساب برسالة جاهزة تحتوي على بياناتك.</p>
          </form>
          <aside className="mx-form-side">
            <div className="mx-direct" data-reveal="up">
              <small>اتصل بنا مباشرة</small>
              <a href={`tel:${c.phone}`} dir="ltr" className="mx-direct-num">{c.phone}</a>
              <a className="mx-btn wa sm" href={wa()} target="_blank" rel="noreferrer"><Icon n="whatsapp" s={18} />محادثة عبر واتساب</a>
            </div>
            <div className="mx-dev" data-reveal="up" data-delay="0.1">
              <img src={IMG + "logo-dark.png"} alt="الرشودي للعقارات" loading="lazy" />
              <p>إيجار وبيع وإدارة أملاك واستشارات عقارية في بريدة — القصيم.</p>
              <Link to="/about" className="mx-btn line sm">من نحن</Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
