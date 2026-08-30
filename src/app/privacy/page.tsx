import type { Metadata } from "next";
import { PublicLayout } from "@/components/site/public-layout";
import { SectionBadge } from "@/components/site/section-badge";
import { Database, Lock, ShieldCheck, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Data privacy policy of the N.V. Past Students Association, adhering to Indian DPDP principles for educational institutions.",
};

const SECTIONS = [
  {
    icon: UserCheck,
    title: "Data Collection",
    desc: "The portal collects: full name, contact number, residential address, optional email and Aadhar number, last attended program, and graduation year. All fields are validated server-side. Submission is voluntary.",
  },
  {
    icon: Database,
    title: "Storage Protocols",
    desc: "Records are stored in an encrypted MongoDB Atlas cluster with TLS-in-transit and at-rest encryption. Access is governed by least-privilege database user roles restricted to the association database. No credentials are stored in application code or client-side storage.",
  },
  {
    icon: Lock,
    title: "Access Limitations",
    desc: "Directory management is restricted to verified association coordinators via cryptographic JWT authentication in httpOnly cookies. Public endpoints expose only aggregate counts — no individual PII is accessible without authentication.",
  },
  {
    icon: ShieldCheck,
    title: "Data Update & Deletion",
    desc: "Members may request corrections or deletion of their records at any time by contacting the NVPSA Executive Committee. Deletion requests are processed within 30 days. Requests for data export in machine-readable format are honored per DPDP Act 2023 provisions.",
  },
];

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionBadge>
            <ShieldCheck className="size-3.5" />
            DPDP Act 2023 Compliant
          </SectionBadge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy">
            Privacy Policy
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            The Nutan Vidyalaya Past Students Association is committed to
            safeguarding the personal data of every alumnus in accordance with
            the Indian Digital Personal Data Protection (DPDP) Act, 2023.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {SECTIONS.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-institutional"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/5">
                    <item.icon className="size-5 text-navy" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-navy">
                      {i + 1}. {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-heritage/20 bg-heritage/5 p-6">
            <h3 className="text-sm font-semibold text-navy">Zero Commercial Use Guarantee</h3>
            <p className="mt-2 text-sm text-slate-600">
              Alumni records are held strictly for institutional association
              purposes. Data is never rented, sold, monetized, or shared with
              third-party commercial entities. The association does not engage in
              targeted advertising or data brokering of any kind.
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              For privacy concerns or data requests, contact:{" "}
              <a href="mailto:alumni.nvpsa@gmail.com" className="font-medium text-navy hover:underline">
                alumni.nvpsa@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
