import type { Metadata } from "next";
import { BackLink } from "@/components/admin/back-link";
import { AdminCard } from "@/components/admin/form-parts";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireAdmin } from "@/server/admin-session";
import { saveFaq } from "../actions";
import { FaqForm } from "../faq-form";

export const metadata: Metadata = { title: "Add a question" };

export default async function NewFaqPage() {
  await requireAdmin();
  return (
    <>
      <BackLink href="/admin/faq" label="Back to all questions" />
      <AdminPageTitle title="Add a new question" />
      <AdminCard>
        <FaqForm isNew action={saveFaq.bind(null, null)} values={{ question: "", answer: "", visible: true }} />
      </AdminCard>
    </>
  );
}
