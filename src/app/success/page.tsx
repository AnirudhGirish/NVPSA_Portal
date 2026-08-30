"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Copy, Home, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PublicLayout } from "@/components/site/public-layout";

interface SubmissionSummary {
  reference: string;
  name: string;
  number: number;
  email?: string;
  year?: string;
  pass?: string;
}

const STORAGE_KEY = "nvpsa:submission";

export default function SuccessPage() {
  const [summary, setSummary] = useState<SubmissionSummary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSummary(JSON.parse(raw) as SubmissionSummary);
      }
    } catch {
      // ignore malformed storage entries
    }
  }, []);

  const copyReference = async () => {
    if (!summary?.reference) return;
    try {
      await navigator.clipboard.writeText(summary.reference);
      setCopied(true);
      toast.success("Reference copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy reference");
    }
  };

  return (
    <PublicLayout>
    <div className="min-h-screen flex items-center justify-center bg-grid p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200/80 bg-white/90 shadow-xl shadow-emerald-100/60 backdrop-blur">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
              className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.25 }}
              >
                <Check className="size-8 text-emerald-600" strokeWidth={3} />
              </motion.span>
            </motion.div>
            <CardTitle className="mt-4 text-2xl font-bold text-slate-900">
              Submission Successful
            </CardTitle>
            <CardDescription className="text-slate-600">
              Your details have been collected and updated on the server.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100">
                    <User className="size-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{summary.name}</p>
                    <p className="text-xs text-slate-500">
                      {summary.pass || "Member"}
                      {summary.year ? ` · ${summary.year}` : ""}
                    </p>
                  </div>
                </div>
                <Separator className="my-3" />
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="font-medium text-slate-900">{summary.number}</dd>
                  </div>
                  {summary.email && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Email</dt>
                      <dd className="font-medium text-slate-900">{summary.email}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Reference</dt>
                    <dd className="max-w-40 truncate font-mono text-xs text-slate-700">
                      {summary.reference || "—"}
                    </dd>
                  </div>
                </dl>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col gap-2"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={copyReference}
                disabled={!summary?.reference || copied}
              >
                <Copy className="size-4" />
                {copied ? "Copied!" : "Copy Submission Reference"}
              </Button>
              <Button
                size="lg"
                render={<Link href="/" />}
              >
                <Home className="size-4" />
                Return Home
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </PublicLayout>
  );
}
