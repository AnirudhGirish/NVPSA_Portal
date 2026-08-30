import type { Metadata } from "next";
import { PublicLayout } from "@/components/site/public-layout";
import { SectionBadge } from "@/components/site/section-badge";
import { Building2, GraduationCap, Handshake, Trophy, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About the Association",
  description:
    "History of Nutan Vidyalaya Education Society (Est. 1907) and the objectives of the N.V. Past Students Association.",
};

const OBJECTIVES = [
  {
    icon: Users,
    title: "Alumni Mentorship",
    desc: "Connecting current students with established alumni for academic and career guidance across India and abroad.",
  },
  {
    icon: GraduationCap,
    title: "Scholarship Programs",
    desc: "Facilitating merit-based scholarships and financial aid for deserving students through alumni endowments.",
  },
  {
    icon: Handshake,
    title: "Annual Alumni Meets",
    desc: "Organizing periodic reunions, batch gatherings, and cultural events that celebrate the N.V. legacy.",
  },
  {
    icon: Building2,
    title: "Campus Infrastructure",
    desc: "Supporting infrastructural development, library expansion, and digital lab upgrades at the N.V. campus.",
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionBadge>
            <Trophy className="size-3.5" />
            Est. 1907 · 118 Years of Legacy
          </SectionBadge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy">
            About the N.V. Past Students Association
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            The Nutan Vidyalaya Past Students Association (NVPSA) is the official
            alumni body of the Nutan Vidyalaya Education Society, Kalaburagi —
            one of the oldest educational institutions in the Kalyana Karnataka
            region, founded in 1907 during the Swadeshi movement.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-navy">Institutional History</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Founded in 1907 by visionaries and freedom fighters in Kalaburagi
              (then Gulbarga), the Nutan Vidyalaya Education Society was born out
              of the Swadeshi spirit — a commitment to indigenous, patriotic, and
              value-based education. Through the pre-independence era and into
              modern India, the institution has grown from a historic high school
              into a comprehensive educational society spanning Pre-University,
              Degree (Science, Commerce, Arts, BCA, Management), and Postgraduate
              programs.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Over 118 years, N.V. Society has produced generations of leaders in
              science, administration, commerce, public service, and culture —
              each batch adding to a legacy of excellence and civic
              responsibility that defines the Kalaburagi educational landscape.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy">Objectives of the Association</h2>
          <p className="mt-3 text-sm text-slate-600">
            The NVPSA is dedicated to preserving institutional heritage while
            fostering lifelong connections among alumni and supporting the next
            generation of N.V. students.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {OBJECTIVES.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-institutional transition-all hover:-translate-y-1"
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

      <section className="border-t border-slate-200 bg-navy py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white">A Note from the Executive Committee</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            &ldquo;This digital registry is our commitment to every alumnus — that
            your bond with Nutan Vidyalaya is permanent, verifiable, and honored.
            We invite you to register your details and help us build a living
            archive of our shared legacy.&rdquo;
          </p>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-heritage">
            — Executive Committee, NVPSA
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
