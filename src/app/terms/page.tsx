import type { Metadata } from "next";
import { PublicLayout } from "@/components/site/public-layout";
import { SectionBadge } from "@/components/site/section-badge";
import { FileText, ShieldCheck, Scale, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Official membership terms and code of conduct for the N.V. Past Students Association digital registry.",
};

const TERMS = [
  {
    icon: Users,
    title: "Membership Eligibility",
    desc: "Membership in the NVPSA digital registry is open to all past students who attended Nutan Vidyalaya institutions (High School, Pre-University, or Degree College). Registration constitutes voluntary enrollment in the official alumni directory.",
  },
  {
    icon: ShieldCheck,
    title: "Verification Rights",
    desc: "The N.V. Society Executive Committee reserves the right to verify all submitted records against institutional archives. Unverified or disputed records may be flagged for committee review without prior notice.",
  },
  {
    icon: Scale,
    title: "Code of Conduct",
    desc: "Alumni networking through this portal is governed by a code of mutual respect and institutional integrity. Misuse of contact information for commercial solicitation, harassment, or unauthorized data collection is strictly prohibited and may result in registry removal.",
  },
  {
    icon: FileText,
    title: "Data Accuracy Requirements",
    desc: "Members are responsible for maintaining accurate and current contact details. The association is not liable for communication failures due to outdated information. Members may request record updates at any time through the administrative office.",
  },
];

export default function TermsPage() {
  return (
    <PublicLayout>
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionBadge>
            <Scale className="size-3.5" />
            Legal · Membership Terms
          </SectionBadge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy">
            Terms of Service
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            These terms govern membership and participation in the Nutan Vidyalaya
            Past Students Association digital alumni registry.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {TERMS.map((item, i) => (
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
            <p className="text-sm text-slate-600">
              <strong className="text-navy">Acceptance:</strong> By submitting
              your details through the registration form, you acknowledge that
              you have read and agree to these terms. The Executive Committee of
              NVPSA may amend these terms periodically.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
