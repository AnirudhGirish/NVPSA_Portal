"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Lock, Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "About Society", href: "/about" },
  { label: "How to Register", href: "/form" },
  { label: "Directory Specs", href: "/docs" },
  { label: "Contact", href: "/contact" },
];

export function SiteNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-navy ring-2 ring-heritage/30">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-bold uppercase tracking-wider text-navy">
              Nutan Vidyalaya
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Past Students Association · Est. 1907
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/signin" />}
          >
            <Lock className="size-4" />
            Admin Sign In
          </Button>
          <Button
            size="sm"
            className="btn-gold-sheen bg-navy text-white hover:bg-navy-light"
            render={<Link href="/form" />}
          >
            Register Alumni Details
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-md p-2 text-navy lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200 bg-white lg:hidden"
          >
            <div className="space-y-1 p-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href="/signin" />}
                  onClick={() => setMobileOpen(false)}
                >
                  <Lock className="size-4" />
                  Admin Sign In
                </Button>
                <Button
                  size="sm"
                  className="btn-gold-sheen bg-navy text-white"
                  render={<Link href="/form" />}
                  onClick={() => setMobileOpen(false)}
                >
                  Register Alumni Details
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export { GraduationCap };
