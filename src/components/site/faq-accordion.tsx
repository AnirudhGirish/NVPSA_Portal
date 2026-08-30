"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Who is eligible to register on this portal?",
    answer:
      "Any past student who attended Nutan Vidyalaya High School, N.V. Pre-University College, or N.V. Degree College across any graduating batch is eligible to register and update their life-member records.",
  },
  {
    question: "I am already an offline Life Member. Do I need to submit?",
    answer:
      "Yes. We are digitizing historic paper registers to ensure your contact details, batch records, and membership references are indexed for future alumni communications. Your digital submission links to your existing offline membership.",
  },
  {
    question: "What if I don't remember my exact graduation year or roll number?",
    answer:
      "Select your closest estimated passing year. The administrative committee verifies all records against the institutional archives and will reconcile any discrepancies during periodic data audits.",
  },
  {
    question: "How will my contact information be used?",
    answer:
      "Your data is used exclusively for association announcements, batch reunion invitations, official newsletters, institutional development, and verified alumni networking. It is never rented, sold, or shared with third parties.",
  },
];

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {FAQS.map((faq, index) => {
        const isOpen = open === index;
        return (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-institutional"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <span className="text-sm font-semibold text-navy">
                {faq.question}
              </span>
              <ChevronDown
                className={`size-5 shrink-0 text-slate-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
