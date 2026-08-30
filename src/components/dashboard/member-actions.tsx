"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Edit3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { FormRow } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, type FormInput } from "@/schemas/form.schema";

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Phone;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

export function MemberDetailSheet({
  member,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  member: FormRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (member: FormRow) => void;
  onDelete: (member: FormRow) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-hidden border-l border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg"
      >
        {member && (
          <>
            {/* ─── Fixed Header ─── */}
            <div className="flex shrink-0 border-b border-slate-100 bg-white px-6 pb-5 pr-10 pt-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy/10 font-semibold text-lg text-navy ring-4 ring-navy/5">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <SheetTitle className="text-xl font-bold leading-snug tracking-tight text-slate-900">
                    {member.name}
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Member profile details
                  </SheetDescription>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {member.serialNumber != null && (
                      <span className="rounded-md bg-navy px-2.5 py-0.5 font-mono text-xs font-semibold text-white">
                        #{member.serialNumber}
                      </span>
                    )}
                    {member.pass && (
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {member.pass}
                      </span>
                    )}
                    {member.year && (
                      <span className="rounded-md border border-heritage/20 bg-heritage/10 px-2.5 py-0.5 text-xs font-semibold text-heritage-dark">
                        Batch {member.year}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Scrollable Body ─── */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/40 px-6 py-5">
              {/* Card 1: Contact & Address */}
              <div className="space-y-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <DetailRow icon={Phone} label="Phone">
                  <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {member.number}
                  </p>
                </DetailRow>
                <DetailRow icon={Mail} label="Email">
                  <p className="break-all text-sm font-medium text-slate-800">
                    {member.email || "Not provided"}
                  </p>
                </DetailRow>
                <DetailRow icon={MapPin} label="Address">
                  <p className="break-words text-sm leading-relaxed text-slate-700">
                    {member.address}
                  </p>
                </DetailRow>
              </div>

              {/* Card 2: Identification & Timestamps */}
              <div className="space-y-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <DetailRow icon={ShieldCheck} label="Aadhar (UID)">
                  <p className="font-mono text-sm text-slate-800">
                    {member.aadhar || "Not provided"}
                  </p>
                </DetailRow>
                <DetailRow icon={Calendar} label="Registered">
                  <p className="font-mono text-sm text-slate-700">
                    {formatDate(member.createdAt)}
                  </p>
                </DetailRow>
                <DetailRow icon={Clock} label="Last Updated">
                  <p className="font-mono text-sm text-slate-700">
                    {formatDate(member.updatedAt)}
                  </p>
                </DetailRow>
              </div>
            </div>

            {/* ─── Sticky Action Footer ─── */}
            <div className="flex shrink-0 border-t border-slate-200/80 bg-white px-6 py-4">
              <div className="grid w-full grid-cols-2 gap-3">
                <Button
                  className="flex items-center justify-center gap-2 rounded-lg bg-navy py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-navy-light"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(member);
                  }}
                >
                  <Edit3 className="size-4" />
                  Edit Details
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 rounded-lg border-red-200 py-2.5 font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
                  onClick={() => {
                    onOpenChange(false);
                    onDelete(member);
                  }}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function EditMemberDialog({
  member,
  open,
  onOpenChange,
  onSaved,
}: {
  member: FormRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: FormRow) => void;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    if (member && open) {
      reset({
        name: member.name,
        number: member.number,
        email: member.email ?? "",
        address: member.address,
        aadhar: member.aadhar ?? "",
        pass: member.pass as FormInput["pass"],
        year: member.year ?? "",
      });
      setErrorMessage(null);
    }
  }, [member, open, reset]);

  const onSubmit = async (data: FormInput) => {
    if (!member?._id) return;
    setErrorMessage(null);

    const optimistic: FormRow = {
      ...member,
      name: data.name,
      number: data.number,
      email: data.email || undefined,
      address: data.address,
      aadhar: data.aadhar || undefined,
      pass: (data.pass as FormRow["pass"]) || "",
      year: data.year || undefined,
    };
    onSaved(optimistic);
    onOpenChange(false);

    try {
      const response = await fetch(`/api/members/${member._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not update member");
      }
      toast.success("Member updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update member");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-navy">Edit Member</DialogTitle>
          <DialogDescription>
            Update the member&apos;s details. All fields are validated.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200"
          >
            {errorMessage}
          </motion.p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-number">Phone Number</Label>
            <Input
              id="edit-number"
              {...register("number", { valueAsNumber: true })}
              onInput={(e) => (e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""))}
            />
            {errors.number && <p className="text-xs text-red-600">{errors.number.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-address">Address</Label>
            <Input id="edit-address" {...register("address")} />
            {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-pass">Education</Label>
              <select
                id="edit-pass"
                {...register("pass")}
                className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm"
              >
                <option value="">-- Select --</option>
                <option value="SSLC">SSLC</option>
                <option value="PUC">PUC</option>
                <option value="Degree">Degree</option>
                <option value="Others">Others</option>
              </select>
              {errors.pass && <p className="text-xs text-red-600">{errors.pass.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-year">Year</Label>
              <select
                id="edit-year"
                {...register("year")}
                className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm"
              >
                <option value="">-- Select --</option>
                {Array.from({ length: 86 }, (_, i) => 1940 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.year && <p className="text-xs text-red-600">{errors.year.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-aadhar">Aadhar</Label>
            <Input
              id="edit-aadhar"
              {...register("aadhar")}
              onInput={(e) => (e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""))}
              maxLength={12}
            />
            {errors.aadhar && <p className="text-xs text-red-600">{errors.aadhar.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteMemberDialog({
  member,
  open,
  onOpenChange,
  onDeleted,
}: {
  member: FormRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!member?._id) return;
    setErrorMessage(null);

    const memberId = member._id;
    onDeleted(memberId);
    onOpenChange(false);

    try {
      const response = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Could not delete member");
      }
      toast.success("Member deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete member");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Member</DialogTitle>
          <DialogDescription>
            This will permanently remove <strong>{member?.name}</strong> from the database.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
            {errorMessage}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={confirmDelete}>
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
