import type { Metadata } from "next";
import { AdminCard } from "@/components/admin/form-parts";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireAdmin } from "@/server/admin-session";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Change Password" };

export default async function PasswordPage() {
  await requireAdmin();
  return (
    <>
      <AdminPageTitle title="Change Password">
        <p>After you change it, any other phone or computer signed in to this Admin is signed out.</p>
      </AdminPageTitle>
      <AdminCard className="max-w-2xl">
        <PasswordForm />
      </AdminCard>
    </>
  );
}
