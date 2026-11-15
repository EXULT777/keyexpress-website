import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/admin/back-link";
import { AdminCard } from "@/components/admin/form-parts";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";
import { saveService } from "../actions";
import { ServiceForm } from "../service-form";

export const metadata: Metadata = { title: "Edit a service" };

export default async function EditServicePage({ params, searchParams }: PageProps<"/admin/services/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const service = Number.isInteger(id) ? await db.service.findUnique({ where: { id } }) : null;
  if (!service) notFound();
  const justAdded = (await searchParams).added === "1";

  return (
    <>
      <BackLink href="/admin/services" label="Back to all services" />
      <AdminPageTitle title={`Edit: ${service.title}`} />
      {justAdded && (
        <p role="status" className="mb-6 flex items-center gap-2 rounded-xl border-2 border-success bg-white p-4 text-xl font-bold text-success">
          <CircleCheck aria-hidden="true" className="size-7" />
          New service added ✓
        </p>
      )}
      <AdminCard>
        <ServiceForm
          isNew={false}
          action={saveService.bind(null, service.id)}
          values={{
            title: service.title,
            shortDescription: service.shortDescription,
            longDescription: service.longDescription,
            icon: service.icon,
            imageUrl: service.imagePath,
            visible: service.visible,
          }}
        />
      </AdminCard>
    </>
  );
}
