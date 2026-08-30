import type { ReactNode } from "react";
import { SiteNavbar } from "./navbar";
import { SiteFooter } from "./footer";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
