import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const QUICK_LINKS = [
  { label: "About Association", href: "/about" },
  { label: "Register Data", href: "/form" },
  { label: "Admin Sign In", href: "/signin" },
  { label: "Documentation", href: "/docs" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-navy text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand & address */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-white/10 ring-1 ring-heritage/30">
                <ShieldCheck className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-white">
                  NVPSA
                </p>
                <p className="text-[10px] text-slate-400">
                  Nutan Vidyalaya Past Students Association
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Nutan Vidyalaya Society Campus,<br />
              Samarth Nagar, Kalaburagi,<br />
              Karnataka – 585102, India
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-heritage">
              Quick Links
            </p>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Affiliation */}
          <div className="space-y-3">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-heritage">
              Affiliation
            </p>
            <p className="text-sm leading-relaxed text-slate-400">
              Maintained by the Executive Committee of Nutan Vidyalaya Past
              Students Association (NVPSA), under the aegis of Nutan Vidyalaya
              Education Society (Est. 1907).
            </p>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Nutan Vidyalaya Education Society.
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
