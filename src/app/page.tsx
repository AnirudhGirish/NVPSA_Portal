"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Database,
  FileText,
  GraduationCap,
  History,
  Lock,
  Mail,
  MapPin,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionBadge } from "@/components/site/section-badge";
import { FAQAccordion } from "@/components/site/faq-accordion";
import { PublicLayout } from "@/components/site/public-layout";

// ─── Counter Ribbon hook ───────────────────────────────────────────
function usePublicStats() {
  const [stats, setStats] = useState({ totalAlumni: 560, uniqueBatches: 60 });
  useEffect(() => {
    fetch("/api/public-stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStats({
            totalAlumni: d.totalAlumni || 560,
            uniqueBatches: d.uniqueBatches || 60,
          });
        }
      })
      .catch(() => {});
  }, []);
  return stats;
}

// ─── Reveal animation wrapper ──────────────────────────────────────
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Counter ribbon ────────────────────────────────────────────────
const COUNTER_CARDS = [
  { icon: Users, label: "Verified Life Members", value: "560+", suffix: "Registered" },
  { icon: GraduationCap, label: "Distinct Graduation Batches", value: "60+", suffix: "1950s–Present" },
  { icon: ShieldCheck, label: "Immutable Records", value: "100%", suffix: "Digitally Verified" },
  { icon: Lock, label: "Unauthorized Data Sharing", value: "0", suffix: "Third-Party Access" },
];

export default function HomePage() {
  const stats = usePublicStats();
  const totalLabel = `${stats.totalAlumni}+`;
  const batchLabel = `${stats.uniqueBatches}+`;

  const counterCards = [
    { ...COUNTER_CARDS[0], value: totalLabel },
    { ...COUNTER_CARDS[1], value: batchLabel },
    COUNTER_CARDS[2],
    COUNTER_CARDS[3],
  ];

  return (
    <PublicLayout>
      {/* ═══ 2. HERO SECTION ═══ */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <SectionBadge>
                <Shield className="size-3.5" />
                Historic Centennial Legacy · Kalaburagi, Karnataka
              </SectionBadge>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-navy sm:text-5xl lg:text-6xl">
                Connecting Generations of Nutan Vidyalaya Alumni Across the Globe.
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                From the historic halls of Nutan Vidyalaya to leadership across
                science, administration, commerce, and public service. Join over
                five decades of registered alumni in building an immutable,
                centralized institutional registry.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="btn-gold-sheen w-full bg-navy text-white hover:bg-navy-light sm:w-auto"
                  render={<Link href="/form" />}
                >
                  Register Your Details
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-navy/20 text-navy hover:bg-navy/5 sm:w-auto"
                  render={<Link href="/signin" />}
                >
                  <Lock className="size-4" />
                  Administrative Portal
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Counter ribbon */}
          <Reveal delay={0.4}>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4">
              {counterCards.map(({ icon: Icon, label, value, suffix }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-institutional"
                >
                  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-navy/5">
                    <Icon className="size-5 text-navy" />
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-navy">
                    {value}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="text-[10px] text-slate-400">{suffix}</p>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 3. HERITAGE OF N.V. SOCIETY ═══ */}
      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <Reveal>
              <div>
                <SectionBadge>
                  <History className="size-3.5" />
                  Est. 1907 · Swadeshi Era
                </SectionBadge>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-navy">
                  Heritage of Nutan Vidyalaya Education Society
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-600">
                  Founded in 1907 during the Swadeshi movement by visionaries and
                  freedom fighters in Kalaburagi, Nutan Vidyalaya was established to
                  impart patriotic, modern, and value-based education to the
                  Kalyana Karnataka region. Over 118 years of continuous academic,
                  cultural, and sporting impact stand as a testament to its enduring
                  institutional legacy.
                </p>
              </div>
            </Reveal>
            <div className="space-y-4">
              {[
                {
                  icon: Building2,
                  title: "Nationalist Foundation (1907)",
                  desc: "Established to nurture independent thought and civic leadership in the Kalyana Karnataka region during the freedom movement.",
                },
                {
                  icon: GraduationCap,
                  title: "Comprehensive Education",
                  desc: "Spanning historic High School (SSLC), Pre-University College (PUC), Degree Programs in Science, Commerce, Arts, BCA, and Management, plus Postgraduate studies.",
                },
                {
                  icon: Award,
                  title: "Centennial Excellence",
                  desc: "Over 118 years of continuous academic, cultural, and sporting impact across India — producing leaders in every field.",
                },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 0.1}>
                  <div className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-institutional">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/5">
                      <item.icon className="size-5 text-navy" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-navy">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. DIGITAL ALUMNI REGISTRY INITIATIVE ═══ */}
      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <SectionBadge>
                <Database className="size-3.5" />
                Digital Registry Initiative
              </SectionBadge>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-navy">
                The Digital Alumni Registry Initiative
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Replacing fragmented manual paper registers with a centralized,
                cryptographically secured, sequential Life Membership Directory.
              </p>
            </Reveal>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Permanent Member ID",
                desc: "Every alumnus receives an official sequential Member ID (e.g., #1, #564) preserved permanently in the institutional registry.",
              },
              {
                icon: FileText,
                title: "Archival Verification",
                desc: "Facilitates fast institutional record retrieval and verification for scholarships, research, and campus visit coordination.",
              },
              {
                icon: Users,
                title: "Alumni Synergy",
                desc: "Empowers the association to coordinate reunions, student mentorship drives, infrastructural endowments, and welfare funds.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-institutional transition-all hover:-translate-y-1 hover:shadow-institutional-lg">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-heritage/10">
                    <item.icon className="size-6 text-heritage-dark" />
                  </div>
                  <h3 className="text-base font-semibold text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. HOW TO SUBMIT (3-STEP) ═══ */}
      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <SectionBadge>
                <Calendar className="size-3.5" />
                Registration Process
              </SectionBadge>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-navy">
                How to Submit & Update Your Record
              </h2>
            </Reveal>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: GraduationCap,
                title: "Academic & Batch Identification",
                desc: "Select your last attended N.V. institution (SSLC, PUC, Degree, or others) and your graduation year.",
              },
              {
                step: "02",
                icon: MapPin,
                title: "Contact & Current Residence",
                desc: "Provide your verified contact number, optional email address, and residential details for official correspondence.",
              },
              {
                step: "03",
                icon: ShieldCheck,
                title: "Instant Member Reference",
                desc: "Receive your official registration confirmation and unique submission reference code instantly.",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.1}>
                <div className="relative">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-navy text-sm font-bold text-white tabular-nums">
                    {item.step}
                  </div>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-heritage/10">
                    <item.icon className="size-5 text-heritage-dark" />
                  </div>
                  <h3 className="text-base font-semibold text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4}>
            <div className="mt-12 text-center">
              <Button
                size="lg"
                className="btn-gold-sheen bg-navy text-white hover:bg-navy-light"
                render={<Link href="/form" />}
              >
                Begin Registration
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 6. SECURITY & PRIVACY SAFEGUARDS ═══ */}
      <section className="border-t border-slate-200 bg-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-heritage/30 bg-heritage/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-heritage">
                <Shield className="size-3.5" />
                Data Governance Policy
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
                Institutional Security & Privacy Safeguards
              </h2>
            </Reveal>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: Lock,
                title: "Zero Commercial Use",
                desc: "Alumni records are held strictly for institutional association purposes. Data is never rented, monetized, or shared with third parties.",
              },
              {
                icon: ShieldCheck,
                title: "Admin RBAC",
                desc: "Role-based cryptographic JWT access controls limit directory management to verified association coordinators only.",
              },
              {
                icon: Database,
                title: "Anti-Scraping Protection",
                desc: "High-entropy session validation and ReDoS/injection-sanitized queries prevent automated harvesting of member data.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="h-full rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:border-heritage/30 hover:bg-white/10">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-heritage/15">
                    <item.icon className="size-6 text-heritage" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. FAQ ACCORDION ═══ */}
      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <SectionBadge>
                <FileText className="size-3.5" />
                Frequently Asked Questions
              </SectionBadge>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-navy">
                Questions & Answers
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <div className="mt-12">
              <FAQAccordion />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA Banner ═══ */}
      <section className="border-t border-slate-200 bg-heritage/5 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-2xl font-bold text-navy">
              Ready to join the official alumni registry?
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Submit your details today and receive your permanent Member ID instantly.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="btn-gold-sheen bg-navy text-white hover:bg-navy-light"
                render={<Link href="/form" />}
              >
                <CheckCircle2 className="size-4" />
                Register Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-navy/20 text-navy hover:bg-navy/5"
                render={<Link href="/contact" />}
              >
                <Mail className="size-4" />
                Contact Association
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicLayout>
  );
}
