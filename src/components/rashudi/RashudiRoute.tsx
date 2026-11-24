import { ClientOnly, useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, type ReactNode } from "react";

import { useRashudiData } from "@/lib/useRashudiData";
import { RashudiProvider, RashudiShell } from "@/rashudi";

function Inner({ children }: { children: (search: string) => ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const data = useRashudiData();
  const search = location.searchStr ?? "";
  const nav = useCallback((to: string) => { void navigate({ href: to }); }, [navigate]);
  return (
    <RashudiProvider data={data} path={location.pathname + search} navigate={nav}>
      <RashudiShell>{children(search)}</RashudiShell>
    </RashudiProvider>
  );
}

export function RashudiRoute({ children }: { children: (search: string) => ReactNode }) {
  return (
    <ClientOnly fallback={<div style={{ minHeight: "100vh", background: "#f6f1ea" }} />}>
      <Inner>{children}</Inner>
    </ClientOnly>
  );
}
