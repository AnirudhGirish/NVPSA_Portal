"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { adminSignInSchema, type AdminSignInInput } from "@/schemas/adminSignIn.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminSignin() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminSignInInput>({ resolver: zodResolver(adminSignInSchema) });

  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prefetch the dashboard bundle and RSC payload while the admin types,
  // so navigation after sign-in is instant.
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  const onSubmit = async (data: AdminSignInInput) => {
    try {
      setErrorMessage(null);
      const response = await fetch("/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Signin failed");
      }

      // Navigate immediately — no toast or await before redirect.
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Signin failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-navy"
          >
            <ArrowLeft className="size-4" />
            Return to Main Portal
          </Link>
        </div>
        <Card className="border-slate-200/80 bg-white/90 shadow-institutional-lg backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-xl bg-navy ring-2 ring-heritage/30">
              <ShieldCheck className="size-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-navy">Restricted Association Access</CardTitle>
            <CardDescription>Authorized administrative portal · NVPSA</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200"
              >
                {errorMessage}
              </motion.p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username")}
                  aria-invalid={Boolean(errors.username)}
                />
                {errors.username && (
                  <p className="text-xs text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full bg-navy text-white hover:bg-navy-light" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
