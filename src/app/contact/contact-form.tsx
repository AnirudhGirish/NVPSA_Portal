"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      void data;
      setSubmitted(true);
    } catch {
      setError("Could not submit your message. Please email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-heritage/20 bg-heritage/5 p-12 text-center">
        <CheckCircle2 className="size-12 text-heritage-dark" />
        <h3 className="mt-4 text-lg font-semibold text-navy">Message Received</h3>
        <p className="mt-2 text-sm text-slate-600">
          Thank you for reaching out. The NVPSA committee will respond to your
          inquiry at the earliest.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-institutional">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-heritage">
        Institutional Inquiry
      </h3>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required placeholder="Your full name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            placeholder="Your inquiry or message..."
            className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" className="w-full bg-navy text-white hover:bg-navy-light" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
