"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Mail, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import type { FormRow } from "@/lib/fetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        {member && (
          <>
            <SheetHeader>
              <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-600/10">
                <User className="size-6 text-indigo-600" />
              </div>
              <SheetTitle className="text-xl font-bold text-slate-900">
                {member.name}
              </SheetTitle>
              <SheetDescription>
                {member.serialNumber
                  ? `Member #${member.serialNumber}`
                  : "Member profile"}
              </SheetDescription>
              <div className="flex flex-wrap gap-2 pt-1">
                {member.pass && <Badge variant="secondary">{member.pass}</Badge>}
                {member.year && <Badge variant="outline">Batch {member.year}</Badge>}
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="font-medium text-slate-900">{member.number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="break-all font-medium text-slate-900">
                        {member.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Address</p>
                      <p className="font-medium text-slate-900">{member.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Aadhar</p>
                      <p className="font-mono font-medium text-slate-900">
                        {member.aadhar || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Registered</p>
                      <p className="font-medium text-slate-900">
                        {formatDate(member.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Last Updated</p>
                      <p className="font-medium text-slate-900">
                        {formatDate(member.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(member);
                  }}
                >
                  Edit Details
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    onOpenChange(false);
                    onDelete(member);
                  }}
                >
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
  const [saving, setSaving] = useState(false);
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
    setSaving(true);
    setErrorMessage(null);
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
      onSaved({ ...member, ...data } as FormRow);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not update member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
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
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
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
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!member?._id) return;
    setDeleting(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/members/${member._id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Could not delete member");
      }
      toast.success("Member deleted");
      onDeleted();
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete member");
    } finally {
      setDeleting(false);
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
          <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
