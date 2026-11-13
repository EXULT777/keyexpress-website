import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/admin/back-link";
import { AdminCard } from "@/components/admin/form-parts";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";
import { saveFaq } from "../actions";
import { FaqForm } from "../faq-form";

export const metadata: Metadata = { title: "Edit a question" };

export default async function EditFaqPage({ params, searchParams }: PageProps<"/admin/faq/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const faq = Number.isInteger(id) ? await db.faq.findUnique({ where: { id } }) : null;
  if (!faq) notFound();
  const justAdded = (await searchParams).added === "1";

  return (
    <>
      <BackLink href="/admin/faq" label="Back to all questions" />
      <AdminPageTitle title="Edit a question" />
      {justAdded && (
        <p role="status" className="mb-6 flex items-center gap-2 rounded-xl border-2 border-success bg-white p-4 text-xl font-bold text-success">
          <CircleCheck aria-hidden="true" className="size-7" />
          New question added ✓
        </p>
      )}
      <AdminCard>
        <FaqForm
          isNew={false}
          action={saveFaq.bind(null, faq.id)}
          values={{ question: faq.question, answer: faq.answer, visible: faq.visible }}
        />
      </AdminCard>
    </>
  );
}
