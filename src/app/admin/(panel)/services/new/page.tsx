import type { Metadata } from "next";
import { BackLink } from "@/components/admin/back-link";
import { AdminCard } from "@/components/admin/form-parts";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireAdmin } from "@/server/admin-session";
import { saveService } from "../actions";
import { ServiceForm } from "../service-form";

export const metadata: Metadata = { title: "Add a service" };

export default async function NewServicePage() {
  await requireAdmin();
  return (
    <>
      <BackLink href="/admin/services" label="Back to all services" />
      <AdminPageTitle title="Add a new service" />
      <AdminCard>
        <ServiceForm
          isNew
          action={saveService.bind(null, null)}
          values={{ title: "", shortDescription: "", longDescription: "", icon: "key", imageUrl: null, visible: true }}
        />
      </AdminCard>
    </>
  );
}
