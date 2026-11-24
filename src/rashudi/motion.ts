/* Scroll motion system: Lenis smooth scroll + GSAP ScrollTrigger.
   Pages only mark elements with data attributes; useMotion() wires them:
     data-reveal="up|clip|scale|fade"   enter animation (once)
     data-split                         heading words rise from a mask (words, never letters: Arabic shaping)
     data-scrub-words                   words light up as you scroll through
     data-parallax="0.15"               image drifts with scroll (yPercent)
     data-count="11"                    number counts up (data-format="ar|en", data-prefix, data-suffix)
     data-img                           image wrapper: clip reveal + slow zoom-out
     data-stagger                       children enter one after another
*/
import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
if (typeof window !== "undefined" && location.hash.includes("film")) (window as any).__gsap = gsap;
export { gsap, ScrollTrigger };

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;
export const reduced = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(prefers-reduced-motion: reduce)").matches || location.hash.includes("still"));
export const filming = () => typeof window !== "undefined" && location.hash.includes("film");

let lenis: Lenis | null = null;
export function startLenis() {
  if (lenis || reduced() || filming()) return lenis;
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis && lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  (window as any).__lenis = lenis;
  return lenis;
}
export function stopLenis() {
  if (!lenis) return;
  lenis.destroy(); lenis = null;
}
export function toTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export const fmt = (n: number, f: string | null) =>
  f === "en" ? Math.round(n).toLocaleString("en-US") : Math.round(n).toLocaleString("ar-SA");

function splitWords(el: HTMLElement, cls: string) {
  if (el.dataset.splitDone) return el.querySelectorAll<HTMLElement>("." + cls + " > i");
  const walk = (node: Node) => {
    [...node.childNodes].forEach((ch) => {
      if (ch.nodeType === 3) {
        const parts = (ch.textContent || "").split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span"); w.className = cls;
          const i = document.createElement("i"); i.textContent = p; w.appendChild(i);
          frag.appendChild(w);
        });
        ch.parentNode!.replaceChild(frag, ch);
      } else if (ch.nodeType === 1 && !(ch as HTMLElement).matches("br")) walk(ch);
    });
  };
  walk(el);
  el.dataset.splitDone = "1";
  return el.querySelectorAll<HTMLElement>("." + cls + " > i");
}

export function useMotion(root: React.RefObject<HTMLElement>, deps: any[] = []) {
  useIso(() => {
    const el = root.current;
    if (!el) return;
    if (reduced()) { el.classList.add("mx-still"); return; }
    const ctx = gsap.context(() => {
      const q = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(el.querySelectorAll(s));

      q<HTMLElement>("[data-split]").forEach((h) => {
        const words = splitWords(h, "mx-w");
        gsap.fromTo(words, { yPercent: 115 }, {
          yPercent: 0, duration: 1.05, ease: "expo.out", stagger: 0.06,
          scrollTrigger: { trigger: h, start: "top 88%", once: true },
        });
      });

      q<HTMLElement>("[data-scrub-words]").forEach((p) => {
        const words = splitWords(p, "mx-sw");
        gsap.fromTo(words, { opacity: 0.14 }, {
          opacity: 1, ease: "none", stagger: 0.1,
          scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: true },
        });
      });

      q<HTMLElement>("[data-reveal]").forEach((r) => {
        const kind = r.dataset.reveal || "up";
        const from: gsap.TweenVars =
          kind === "clip" ? { clipPath: "inset(0 0 100% 0)" } :
          kind === "scale" ? { scale: 0.92, opacity: 0 } :
          kind === "fade" ? { opacity: 0 } :
          kind === "side" ? { x: 60, opacity: 0 } :
          { y: 48, opacity: 0 };
        const to: gsap.TweenVars = kind === "clip"
          ? { clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "expo.inOut" }
          : { y: 0, x: 0, scale: 1, opacity: 1, duration: 1.1, ease: "expo.out" };
        gsap.fromTo(r, from, { ...to, delay: parseFloat(r.dataset.delay || "0"), scrollTrigger: { trigger: r, start: "top 90%", once: true } });
      });

      q<HTMLElement>("[data-stagger]").forEach((g) => {
        const kids = [...g.children] as HTMLElement[];
        gsap.fromTo(kids, { y: 56, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.09,
          scrollTrigger: { trigger: g, start: "top 86%", once: true },
        });
      });

      q<HTMLElement>("[data-img]").forEach((w) => {
        const img = w.querySelector("img, video");
        const tl = gsap.timeline({ scrollTrigger: { trigger: w, start: "top 85%", once: true } });
        tl.fromTo(w, { clipPath: "inset(18% 12% 18% 12%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" });
        if (img) tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);
      });

      q<HTMLElement>("[data-parallax]").forEach((p) => {
        const amt = parseFloat(p.dataset.parallax || "0.15") * 100;
        gsap.fromTo(p, { yPercent: -amt / 2 }, {
          yPercent: amt / 2, ease: "none",
          scrollTrigger: { trigger: p.parentElement || p, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      q<HTMLElement>("[data-count]").forEach((c) => {
        const end = parseFloat(c.dataset.count || "0");
        const f = c.dataset.format || "ar";
        const pre = c.dataset.prefix || "", suf = c.dataset.suffix || "";
        const o = { v: 0 };
        c.textContent = pre + fmt(0, f) + suf;
        gsap.to(o, {
          v: end, duration: 2, ease: "power3.out",
          onUpdate: () => { c.textContent = pre + fmt(o.v, f) + suf; },
          scrollTrigger: { trigger: c, start: "top 92%", once: true },
        });
      });
    }, el);

    const imgs = [...el.querySelectorAll("img")].filter((i) => !i.complete);
    let n = imgs.length;
    const done = () => { if (--n <= 0) ScrollTrigger.refresh(); };
    imgs.forEach((i) => { i.addEventListener("load", done, { once: true }); i.addEventListener("error", done, { once: true }); });
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { window.clearTimeout(t); ctx.revert(); };
  }, deps);
}
