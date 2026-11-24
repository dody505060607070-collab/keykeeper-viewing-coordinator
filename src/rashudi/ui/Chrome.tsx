// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { Link, useRashudi } from "../context";
import { Icon } from "./Icons";
import { Crenel } from "./Najdi";
import { gsap, startLenis, toTop, ScrollTrigger } from "../motion";

export const NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/rent", label: "قسم الإيجار" },
  { to: "/sale", label: "قسم البيع" },
  { to: "/about", label: "من نحن" },
  { to: "/contact", label: "تواصل معنا" },
];

const isActive = (path: string, to: string) =>
  to === "/" ? path === "/" || path === "" : path.startsWith(to);

export function Header() {
  const { path } = useRashudi();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    document.documentElement.classList.toggle("mx-lock", open);
    const l = (window as any).__lenis; if (l) open ? l.stop() : l.start();
    if (open && menu.current) {
      gsap.fromTo(menu.current.querySelectorAll(".mx-menu-links a"), { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.9, ease: "expo.out", delay: 0.25 });
    }
  }, [open]);
  return (
    <>
      <header className={"mx-header" + (solid ? " solid" : "") + (open ? " open" : "")}>
        <div className="mx-header-in">
          <Link to="/" className="mx-logo" aria-label="الرشودي للعقارات — الرئيسية">
            <img src="/rashudi/img/logo-light.png" alt="الرشودي للعقارات" width="961" height="194" />
          </Link>
          <nav className="mx-nav" aria-label="القائمة الرئيسية">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className={isActive(path, n.to) ? "on" : ""}>{n.label}</Link>
            ))}
          </nav>
          <div className="mx-actions">
            <Link to="/favorites" className="mx-iconbtn" aria-label="المفضلة"><Icon n="heart" s={20} /></Link>
            <Link to="/auth" className="mx-iconbtn hide-sm" aria-label="تسجيل الدخول"><Icon n="user" s={20} /></Link>
            <Link to="/list-property" className="mx-btn gold sm hide-sm">اعرض | اطلب عقارك</Link>
            <button className="mx-burger" aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={open} onClick={() => setOpen(!open)}>
              <span /><span />
            </button>
          </div>
        </div>
      </header>
      <div ref={menu} className={"mx-menu" + (open ? " open" : "")} aria-hidden={!open}>
        <Crenel className="mx-menu-crenel" color="#B8924A" size={18} />
        <nav className="mx-menu-links">
          {NAV.map((n, i) => (
            <Link key={n.to} to={n.to} className={isActive(path, n.to) ? "on" : ""}>
              <small>{String(i + 1).padStart(2, "0")}</small>{n.label}
            </Link>
          ))}
        </nav>
        <div className="mx-menu-foot">
          <Link to="/list-property" className="mx-btn gold">اعرض | اطلب عقارك</Link>
          <div className="mx-menu-row">
            <Link to="/favorites"><Icon n="heart" s={18} /> المفضلة</Link>
            <Link to="/auth"><Icon n="user" s={18} /> تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export function Footer() {
  const { data, wa } = useRashudi();
  const c = data.contact;
  return (
    <footer className="mx-footer">
      <div className="mx-wrap mx-footer-grid">
        <div className="mx-footer-brand">
          <img src="/rashudi/img/logo-light.png" alt="الرشودي للعقارات" width="961" height="194" loading="lazy" />
          <p>الرشودي للعقارات — إيجار وبيع وإدارة أملاك في بريدة، القصيم.</p>
          <a className="mx-btn ghost-light sm" href={wa()} target="_blank" rel="noreferrer"><Icon n="whatsapp" s={18} /> تواصل عبر واتساب</a>
        </div>
        <div>
          <h4>روابط سريعة</h4>
          <ul>
            <li><Link to="/rent">قسم الإيجار</Link></li>
            <li><Link to="/sale">قسم البيع</Link></li>
            <li><Link to="/about">من نحن</Link></li>
            <li><Link to="/contact">تواصل معنا</Link></li>
            <li><Link to="/list-property">اعرض | اطلب عقارك</Link></li>
            <li><Link to="/company-profile">ملف هوية الرشودي</Link></li>
            <li><Link to="/favorites">المفضلة</Link></li>
          </ul>
        </div>
        <div>
          <h4>تواصل معنا</h4>
          <ul className="mx-footer-contact">
            <li><Icon n="phone" s={18} /><a href={`tel:${c.phone}`} dir="ltr">{c.phone}</a></li>
            <li><Icon n="mail" s={18} /><a href={`mailto:${c.email}`}>{c.email}</a></li>
            <li><Icon n="pin" s={18} /><span>{c.city}</span></li>
            <li><Icon n="clock" s={18} /><span>{c.hours}</span></li>
          </ul>
        </div>
      </div>
      <div className="mx-wrap mx-footer-bottom">
        <span>جميع الحقوق محفوظة © 2026 — مؤسسة الرشودي للعقارات</span>
        <span className="mx-footer-legal">
          <Link to="/privacy">سياسة الخصوصية</Link>
          <Link to="/terms">الشروط والأحكام</Link>
        </span>
        <a href="https://abdelrahmanstudio.store/" target="_blank" rel="noreferrer" dir="ltr">Designed by Abdelrahman Studio</a>
      </div>
      <div className="mx-footer-word" aria-hidden="true">الرشودي</div>
    </footer>
  );
}

export function WhatsFloat() {
  const { wa } = useRashudi();
  return (
    <a className="mx-wa-float" href={wa("السلام عليكم ورحمة الله 🌿\nأرغب في الاستفسار عن عقارات الرشودي في بريدة")} target="_blank" rel="noreferrer" aria-label="تواصل عبر واتساب">
      <Icon n="whatsapp" s={26} />
    </a>
  );
}

export function Curtain() {
  return (
    <div className="mx-curtain" aria-hidden="true">
      <div className="mx-curtain-body"><img src="/rashudi/img/logo-mark.png" alt="" /></div>
      <Crenel color="var(--night)" size={34} flip className="mx-curtain-edge" />
    </div>
  );
}

/* Wrap every page with this. Starts Lenis once, resets scroll on route change. */
export function RashudiShell({ children }: { children: React.ReactNode }) {
  const { path } = useRashudi();
  const first = useRef(true);
  useEffect(() => {
    document.documentElement.classList.add("mx-root");
    startLenis();
    (document as any).fonts?.ready?.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }, []);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    toTop();
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, [path.split("?")[0]]);
  return (
    <div className="mx" dir="rtl" lang="ar">
      <Header />
      <main className="mx-main">{children}</main>
      <Footer />
      <WhatsFloat />
      <Curtain />
    </div>
  );
}
