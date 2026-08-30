"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Phone, ShieldCheck, XCircle } from "lucide-react";
import { formSchema, type FormInput } from "@/schemas/form.schema";
import { checkPhoneExists } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PublicLayout } from "@/components/site/public-layout";

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const YEARS = Array.from({ length: 86 }, (_, i) => 1940 + i);

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-1.5 flex items-center gap-1 text-xs text-red-600"
    >
      <XCircle className="size-3.5 shrink-0" />
      {message}
    </motion.p>
  );
}

function ValidMark({ show }: { show: boolean }) {
  if (!show) return null;
  return <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />;
}

export default function FormPage() {
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
  });

  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneStatus, setPhoneStatus] = useState<"idle" | "checking" | "taken" | "free">("idle");
  const phoneCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phoneValue = watch("number");

  const handlePhoneBlur = async () => {
    const valid = await trigger("number");
    if (!valid || !phoneValue) {
      return;
    }
    setPhoneStatus("checking");
    if (phoneCheckTimer.current) clearTimeout(phoneCheckTimer.current);
    phoneCheckTimer.current = setTimeout(async () => {
      try {
        const exists = await checkPhoneExists(String(phoneValue));
        setPhoneStatus(exists ? "taken" : "free");
      } catch {
        setPhoneStatus("idle");
      }
    }, 150);
  };

  const onSubmit = async (data: FormInput) => {
    try {
      setErrorMessage(null);
      const response = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          throw new Error(
            retryAfter
              ? `Too many submissions. Please try again in ${retryAfter} seconds.`
              : "Too many submissions. Please try again later."
          );
        }
        throw new Error(result.message || "Submission failed");
      }

      sessionStorage.setItem(
        "nvpsa:submission",
        JSON.stringify({
          reference: result.member?._id ?? "",
          name: data.name,
          number: data.number,
          email: data.email || undefined,
          year: data.year || undefined,
          pass: data.pass || undefined,
        })
      );
      router.push("/success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Submission failed");
    }
  };

  return (
    <PublicLayout>
      <div className="bg-grid p-4 sm:p-6 lg:p-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl"
      >
        <div className="mb-6 text-center">
          <Badge variant="outline" className="mb-3 border-heritage/20 bg-heritage/5 text-heritage-dark backdrop-blur">
            <ShieldCheck className="size-3.5 mr-1" />
            N.V. Society · Kalaburagi
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Past Students Association
          </h1>
          <p className="mt-2 text-sm text-slate-600">Life Member Data Update · GLB 2025</p>
        </div>

        <Card className="border-slate-200/80 bg-white/85 shadow-xl shadow-indigo-100/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Member Information</CardTitle>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <motion.section
                custom={0}
                variants={SECTION_VARIANTS}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-navy">
                  <span className="flex size-6 items-center justify-center rounded-full bg-navy text-xs font-bold text-white tabular-nums">1</span>
                  Personal Details
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Enter your full name"
                      aria-invalid={Boolean(errors.name)}
                    />
                      <ValidMark show={Boolean(touchedFields.name && !errors.name)} />
                  </div>
                  <FieldError message={errors.name?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">
                    Residential Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Enter your residential address"
                    aria-invalid={Boolean(errors.address)}
                  />
                  <FieldError message={errors.address?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="aadhar">Aadhar Number</Label>
                  <Input
                    id="aadhar"
                    {...register("aadhar")}
                    onInput={(e) => (e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""))}
                    placeholder="Enter your 12 digit Aadhar number"
                    maxLength={12}
                    aria-invalid={Boolean(errors.aadhar)}
                  />
                  <FieldError message={errors.aadhar?.message} />
                </div>
              </motion.section>

              <Separator />

              <motion.section
                custom={1}
                variants={SECTION_VARIANTS}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-navy">
                  <span className="flex size-6 items-center justify-center rounded-full bg-navy text-xs font-bold text-white tabular-nums">2</span>
                  Academic Record
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="pass">Last Attended Program At NV</Label>
                  <select
                    id="pass"
                    {...register("pass")}
                    className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">-- Select --</option>
                    <option value="SSLC">SSLC</option>
                    <option value="PUC">PUC</option>
                    <option value="Degree">Degree</option>
                    <option value="Others">Others</option>
                  </select>
                  <FieldError message={errors.pass?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="year">Graduation Year</Label>
                  <select
                    id="year"
                    {...register("year")}
                    className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">-- Select Year --</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.year?.message} />
                </div>
              </motion.section>

              <Separator />

              <motion.section
                custom={2}
                variants={SECTION_VARIANTS}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-navy">
                  <span className="flex size-6 items-center justify-center rounded-full bg-navy text-xs font-bold text-white tabular-nums">3</span>
                  Contact Information
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="number">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="number"
                      type="text"
                      inputMode="numeric"
                      className="pl-8"
                      {...register("number", { valueAsNumber: true })}
                      onInput={(e) => (e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""))}
                      onBlur={handlePhoneBlur}
                      placeholder="Enter your 10 digit contact number"
                      aria-invalid={Boolean(errors.number)}
                    />
                    {phoneStatus === "checking" && (
                      <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-slate-400" />
                    )}
                    {phoneStatus === "free" && !errors.number && (
                      <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                    )}
                  </div>
                  <FieldError message={errors.number?.message} />
                  {phoneStatus === "taken" && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1.5 flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-700 ring-1 ring-amber-200"
                    >
                      This phone number is already registered. If this is a mistake, contact an administrator.
                    </motion.p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter your email address"
                    aria-invalid={Boolean(errors.email)}
                  />
                  <FieldError message={errors.email?.message} />
                </div>
              </motion.section>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || phoneStatus === "checking"}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Details"
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </PublicLayout>
  );
}
