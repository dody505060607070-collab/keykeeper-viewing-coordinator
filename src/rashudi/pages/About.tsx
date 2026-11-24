import React, { useLayoutEffect, useRef } from "react";
import { useRashudi, Link } from "../context";
import { useMotion, gsap, reduced } from "../motion";
import { Icon } from "../ui/Icons";
import { Crenel, Vents } from "../ui/Najdi";
import { Head } from "../ui/Cards";
import { Numbers, ServicesStack, ListCta } from "./Home";

const IMG = "/rashudi/img/";
/* a real sequence, so the steps are numbered */
const STEPS = [
  { t: "المعاينة", d: "نسمع احتياجك ونعاين العقار معك، ونرشح لك الأنسب للبيع أو الإيجار.", img: "villas.webp" },
  { t: "التفاوض", d: "سعر واقعي مبني على معرفة ميدانية بالأحياء والأسعار في بريدة.", img: "land.webp" },
  { t: "العقد", d: "نوثّق كل خطوة حتى توقيع العقد، بوضوح كامل للطرفين.", img: "apartments.webp" },
  { t: "المتابعة والتحصيل", d: "خدمة لا تتوقف بعد إتمام الصفقة: متابعة العقود والتحصيل والصيانة.", img: "commercial.webp" },
];

function Journey() {
  const el = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!el.current || reduced()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const panels = gsap.utils.toArray<HTMLElement>(".mx-pillar", el.current!);
      const imgs = gsap.utils.toArray<HTMLElement>(".mx-pillars-img img", el.current!);
      gsap.set(panels.slice(1), { opacity: 0, y: 60 }); gsap.set(imgs.slice(1), { clipPath: "inset(100% 0 0 0)" });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el.current, start: "top top", end: "+=280%", pin: true, scrub: 0.6, anticipatePin: 1 } });
      panels.forEach((p, i) => {
        if (!i) return;
        tl.to(panels[i - 1], { opacity: 0, y: -60, duration: 0.5 }, i).to(p, { opacity: 1, y: 0, duration: 0.5 }, i + 0.25)
          .to(imgs[i], { clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: "power2.inOut" }, i)
          .to(".mx-pillars-bar i", { scaleX: (i + 1) / panels.length, duration: 0.9 }, i);
      });
      tl.to({}, { duration: 0.4 });
    });
    return () => mm.revert();
  }, []);
  return (
    <section ref={el} className="mx-pillars">
      <div className="mx-wrap mx-pillars-grid">
        <div className="mx-pillars-txt">
          {STEPS.map((p, i) => (
            <article key={p.t} className="mx-pillar">
              <span className="mx-step-n">{String(i + 1).padStart(2, "0")} — {String(STEPS.length).padStart(2, "0")}</span>
              <h2 className="mx-h1">{p.t}</h2>
              <p className="mx-pillar-d">{p.d}</p>
            </article>
          ))}
          <div className="mx-pillars-bar" aria-hidden="true"><i style={{ transform: `scaleX(${1 / STEPS.length})` }} /></div>
        </div>
        <div className="mx-pillars-img">{STEPS.map((p) => <img key={p.t} src={IMG + p.img} alt="" loading="lazy" />)}</div>
      </div>
    </section>
  );
}

export default function About() {
  const { data, wa } = useRashudi();
  const root = useRef<HTMLDivElement>(null);
  useMotion(root, [data]);
  return (
    <div ref={root} className="mx-page mx-about">
      <section className="mx-phero tall">
        <div className="mx-phero-bg"><img data-parallax="0.25" src={IMG + "heritage.webp"} alt="عمارة طينية تقليدية في القصيم" /></div>
        <div className="mx-wrap mx-phero-in">
          <p className="mx-kicker light" data-reveal="fade">مؤسسة الرشودي للعقارات · من نحن</p>
          <h1 className="mx-h1" data-split>نعرف بريدة.. ونفهم العقار</h1>
          <p className="mx-lead light" data-reveal="up" data-delay="0.2">خبرة محلية في بريدة، وقرار عقاري أوضح لعملائنا — إيجار وبيع وإدارة أملاك بمعايير مهنية.</p>
        </div>
        <Crenel color="var(--paper)" size={22} flip className="mx-edge-bottom" />
      </section>
      <section className="mx-sec mx-story">
        <div className="mx-wrap mx-story-grid">
          <div className="mx-story-txt">
            <Head kicker="قصتنا" title="أكثر من ثماني سنوات في سوق بريدة" />
            <p className="mx-statement sm" data-scrub-words>بدأنا العمل في سوق العقار بمدينة بريدة قبل أكثر من ثماني سنوات، وبنينا خلالها شبكة علاقات واسعة مع الملاك والمستأجرين والمستثمرين، ما يجعل معرفتنا بالأحياء والأسعار معرفة ميدانية لا نظرية.</p>
            <p className="mx-lead" data-reveal="up">نقدّم خدمات التأجير والبيع وإدارة الأملاك والوساطة العقارية، ونتابع كل عملية من أول معاينة حتى توقيع العقد وتحصيل الدفعات، مع توثيق كل خطوة في نظامنا الداخلي حتى يبقى المالك على علم دائم بحالة عقاره.</p>
            <p className="mx-lead" data-reveal="up"><b>هدفنا بسيط:</b> أن يكون قرارك العقاري مبنيًا على معلومة صحيحة وسعر واقعي وخدمة لا تتوقف بعد إتمام الصفقة.</p>
            <div className="mx-cta-row" data-reveal="up">
              <a className="mx-btn wa" href={wa()} target="_blank" rel="noreferrer"><Icon n="whatsapp" s={20} />تواصل عبر واتساب</a>
              <Link to="/contact" className="mx-btn line">صفحة التواصل</Link>
            </div>
          </div>
          <div className="mx-story-media">
            <div className="mx-story-img" data-img><img src={IMG + "hero-buraydah.webp"} alt="" loading="lazy" /></div>
            <div className="mx-story-badge" data-reveal="scale"><Icon n="pin" s={22} /><b>بريدة</b><span>القصيم — نطاق عملنا</span></div>
          </div>
        </div>
      </section>
      <Journey />
      <Numbers edgeTop={false} />
      <ServicesStack />
      <ListCta />
    </div>
  );
}
