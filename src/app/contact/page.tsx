import type { Metadata } from "next";
import { PublicLayout } from "@/components/site/public-layout";
import { SectionBadge } from "@/components/site/section-badge";
import { ContactForm } from "./contact-form";
import { Mail, MapPin, Phone, Building } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact the Association",
  description:
    "Contact the Nutan Vidyalaya Past Students Association executive office in Kalaburagi, Karnataka.",
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionBadge>
            <Mail className="size-3.5" />
            Get in Touch
          </SectionBadge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy">
            Contact the Association
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Reach the NVPSA Executive Committee for membership inquiries,
            reunion coordination, institutional partnerships, or alumni
            networking.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Contact details */}
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-institutional">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/5">
                    <Building className="size-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy">Campus Address</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Nutan Vidyalaya Society Campus,<br />
                      Samarth Nagar, Kalaburagi,<br />
                      Karnataka – 585102, India
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-institutional">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/5">
                    <Mail className="size-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy">Email</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      <a href="mailto:alumni.nvpsa@gmail.com" className="hover:text-navy">
                        alumni.nvpsa@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-institutional">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/5">
                    <Phone className="size-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy">Office Secretary</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Available during campus hours for membership and verification
                      queries.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-institutional">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/5">
                    <MapPin className="size-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy">Location</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Kalaburagi (Gulbarga), Karnataka, India — 585102
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
