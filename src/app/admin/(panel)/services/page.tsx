import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/page-title";
import { SortableList } from "@/components/admin/sortable-list";
import { ButtonLink } from "@/components/site/buttons";
import { requireAdmin } from "@/server/admin-session";
import { listServices } from "@/server/content";
import { db } from "@/server/db";
import { deleteService, moveService, setServiceVisible } from "./actions";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesAdminPage() {
  await requireAdmin();
  const services = await listServices(db, { visibleOnly: false });

  return (
    <>
      <AdminPageTitle title="Services">
        <p>The services shown on the home page and the Services page, in this order.</p>
      </AdminPageTitle>
      <ButtonLink href="/admin/services/new" className="mb-8">
        <Plus aria-hidden="true" className="size-6" />
        Add a new service
      </ButtonLink>
      <SortableList
        items={services.map((service) => ({ id: service.id, title: service.title, visible: service.visible }))}
        itemName="services"
        editHrefBase="/admin/services"
        move={moveService}
        setVisible={setServiceVisible}
        remove={deleteService}
      />
    </>
  );
}
