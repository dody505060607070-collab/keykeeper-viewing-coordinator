import React, { createContext, useContext, useMemo } from "react";
import { RashudiData, SAMPLE, waLink } from "./data";

type Ctx = {
  data: RashudiData;
  path: string;                       // current pathname (+search)
  navigate: (to: string) => void;     // router navigate (TanStack / react-router / mini router)
  wa: (text?: string) => string;      // WhatsApp link builder
};

const C = createContext<Ctx>({
  data: SAMPLE,
  path: "/",
  navigate: (to) => { window.location.href = to; },
  wa: (t) => waLink(SAMPLE.contact.whatsapp, t),
});

export function RashudiProvider(props: {
  data?: RashudiData;
  path?: string;
  navigate?: (to: string) => void;
  children: React.ReactNode;
}) {
  const data = props.data || SAMPLE;
  const value = useMemo<Ctx>(() => ({
    data,
    path: props.path ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/"),
    navigate: props.navigate || ((to) => { window.location.href = to; }),
    wa: (t?: string) => waLink(data.contact.whatsapp, t),
  }), [data, props.path, props.navigate]);
  return <C.Provider value={value}>{props.children}</C.Provider>;
}

export const useRashudi = () => useContext(C);

/* Internal link: plays the Najdi curtain, then navigates through the router. */
export function Link(props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { navigate } = useRashudi();
  const { to, onClick, ...rest } = props;
  return (
    <a
      {...rest}
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(to, navigate);
      }}
    />
  );
}

/* Page transition: triangles curtain (see .mx-curtain in rashudi.css) */
let busy = false;
export function go(to: string, navigate: (to: string) => void) {
  const cur = window.location.pathname + window.location.search;
  const el = document.querySelector<HTMLElement>(".mx-curtain");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (to === cur) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  if (!el || reduce || busy) { navigate(to); return; }
  busy = true;
  el.classList.remove("out"); el.classList.add("in");
  window.setTimeout(() => {
    navigate(to);
    window.setTimeout(() => {
      el.classList.remove("in"); el.classList.add("out");
      window.setTimeout(() => { el.classList.remove("out"); busy = false; }, 800);
    }, 120);
  }, 620);
}
