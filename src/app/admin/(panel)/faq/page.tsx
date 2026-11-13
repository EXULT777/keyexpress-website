import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/page-title";
import { SortableList } from "@/components/admin/sortable-list";
import { ButtonLink } from "@/components/site/buttons";
import { requireAdmin } from "@/server/admin-session";
import { listFaqs } from "@/server/content";
import { db } from "@/server/db";
import { deleteFaq, moveFaq, setFaqVisible } from "./actions";

export const metadata: Metadata = { title: "Questions (FAQ)" };

export default async function FaqAdminPage() {
  await requireAdmin();
  const faqs = await listFaqs(db, { visibleOnly: false });

  return (
    <>
      <AdminPageTitle title="Questions (FAQ)">
        <p>The questions and answers on the home page and the FAQ page, in this order.</p>
      </AdminPageTitle>
      <ButtonLink href="/admin/faq/new" className="mb-8">
        <Plus aria-hidden="true" className="size-6" />
        Add a new question
      </ButtonLink>
      <SortableList
        items={faqs.map((faq) => ({ id: faq.id, title: faq.question, visible: faq.visible }))}
        itemName="questions"
        editHrefBase="/admin/faq"
        move={moveFaq}
        setVisible={setFaqVisible}
        remove={deleteFaq}
      />
    </>
  );
}
