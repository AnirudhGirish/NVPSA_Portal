import type { Metadata } from "next";
import { PublicLayout } from "@/components/site/public-layout";
import { SectionBadge } from "@/components/site/section-badge";
import {
  Database,
  Download,
  FileText,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Alumni registration guide and administrator manual for the NVPSA digital registry portal.",
};

const ALUMNI_GUIDE = [
  {
    icon: UserCheck,
    title: "How to Register",
    desc: "Navigate to the registration form, select your last attended N.V. institution (SSLC, PUC, Degree, or Others), and enter your graduation year. The system assigns a permanent sequential Member ID instantly upon submission.",
  },
  {
    icon: FileText,
    title: "Required Details",
    desc: "Full name, verified contact number (10 digits), residential address, optional email and Aadhar number, last attended program, and graduation year. All fields are validated server-side.",
  },
  {
    icon: ShieldCheck,
    title: "Submission Verification",
    desc: "Upon successful submission, you receive a confirmation page with a unique submission reference code. This reference links to your permanent Member ID in the institutional registry.",
  },
];

const ADMIN_MANUAL = [
  {
    icon: Search,
    title: "In-Memory Fast Search",
    desc: "The dashboard loads the complete alumni dataset into a client-side sessionStorage cache. All search, filter, sort, and pagination operations run in-memory with sub-5ms latency — no server round-trips per keystroke.",
  },
  {
    icon: Download,
    title: "Exporting Datasets",
    desc: "Administrators can export all records, the current filtered view, or selected rows to CSV or styled XLSX. Exports include formula-injection sanitization and frozen header rows.",
  },
  {
    icon: Database,
    title: "Record Management",
    desc: "Inline editing and two-step deletion with optimistic UI updates. Bulk operations support selecting all matching results across pages with chunked server deletion.",
  },
  {
    icon: Users,
    title: "Audit & Verification",
    desc: "Every member record includes a permanent sequential serialNumber, registration timestamp, and last-updated timestamp for institutional audit trails.",
  },
];

export default function DocsPage() {
  return (
    <PublicLayout>
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionBadge>
            <FileText className="size-3.5" />
            Official Documentation
          </SectionBadge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy">
            Portal Documentation
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Comprehensive guides for alumni registration and administrative
            management of the NVPSA digital registry.
          </p>
        </div>
      </section>

      {/* Alumni Guide */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy">Alumni Registration Guide</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {ALUMNI_GUIDE.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-institutional"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-navy/5">
                  <item.icon className="size-6 text-navy" />
                </div>
                <h3 className="text-base font-semibold text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Manual */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy">Administrator Manual</h2>
          <p className="mt-3 text-sm text-slate-600">
            For verified association coordinators with administrative portal
            access.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {ADMIN_MANUAL.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-institutional"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-heritage/10">
                  <item.icon className="size-6 text-heritage-dark" />
                </div>
                <h3 className="text-base font-semibold text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
