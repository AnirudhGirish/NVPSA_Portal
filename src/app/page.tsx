"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LinkFormLink from "@/components/link-form";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description: "Admin Sign in with secure credentials so as to protect your data.",
  },
  {
    icon: LayoutDashboard,
    title: "Data Management",
    description: "View, export, and manage submissions with ease.",
  },
  {
    icon: Users,
    title: "User-Friendly UI",
    description: "Simple, intuitive design for smooth navigation in form for user.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-100 px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-indigo-600/10 ring-1 ring-indigo-600/20">
          <GraduationCap className="size-8 text-indigo-600" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Past Student&apos;s Association
        </h1>
        <h2 className="mt-2 text-2xl font-semibold text-indigo-700 sm:text-3xl">N V Society</h2>
        <h3 className="mt-1 text-lg text-slate-600">Kalaburgi</h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 w-full max-w-4xl"
      >
        <Card className="border-slate-200/70 bg-white/80 shadow-xl shadow-indigo-100/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Welcome, update your data with NVPSA
            </CardTitle>
            <p className="text-lg text-slate-600">
              A secure and efficient way to collect and manage data.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="px-6" render={<Link href="/signin" />}>
              Go to Dashboard
            </Button>
            <Button size="lg" variant="outline" className="px-6" render={<Link href="/form" />}>
              Go to Form
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 w-full max-w-md"
      >
        <LinkFormLink />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mt-16 grid grid-cols-1 gap-6 text-center w-full max-w-5xl md:grid-cols-3"
      >
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            className="border-slate-200/70 bg-white/80 shadow-lg shadow-indigo-100/40 backdrop-blur transition-shadow hover:shadow-xl"
          >
            <CardHeader className="items-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-600/10">
                <Icon className="size-6 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{description}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <footer className="mt-16 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Anirudh Girish. All rights reserved.</p>
      </footer>
    </div>
  );
}
