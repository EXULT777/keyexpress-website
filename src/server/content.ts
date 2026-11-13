import { z } from "zod";
import { pageSections, sectionKeys, type SectionContent, type SectionKey } from "@/lib/page-sections";
import type { Db } from "./db";
import { starterSections } from "./starter-content";

const stringList = z.array(z.string()).catch([]);

export const DEFAULT_LOGO_URL = "/logo.svg";

export type BusinessSettings = {
  businessName: string;
  phone: string;
  email: string;
  notificationEmail: string;
  serviceAreaCity: string;
  towns: string[];
  paymentMethods: string[];
  emergencyBadge: boolean;
  licenseNumber: string;
  footerText: string;
  logoUrl: string;
  hasCustomLogo: boolean;
};

export async function getBusinessSettings(db: Db): Promise<BusinessSettings> {
  const row = await db.businessSettings.findUniqueOrThrow({ where: { id: 1 } });
  return {
    businessName: row.businessName,
    phone: row.phone,
    email: row.email,
    notificationEmail: row.notificationEmail,
    serviceAreaCity: row.serviceAreaCity,
    towns: stringList.parse(row.towns),
    paymentMethods: stringList.parse(row.paymentMethods),
    emergencyBadge: row.emergencyBadge,
    licenseNumber: row.licenseNumber,
    footerText: row.footerText,
    logoUrl: row.logoPath ?? DEFAULT_LOGO_URL,
    hasCustomLogo: row.logoPath !== null,
  };
}

export type SectionState<K extends SectionKey> = { content: SectionContent<K>; visible: boolean };
export type PageSectionMap = { [K in SectionKey]: SectionState<K> };

// Every Page Section, checked against its schema. A section with no row, or a row
// that no longer fits its schema, falls back to the starter text instead of
// breaking the page.
export async function getPageSections(db: Db): Promise<PageSectionMap> {
  const rows = new Map((await db.pageSection.findMany()).map((row) => [row.key, row]));
  const entries = sectionKeys.map((key) => {
    const row = rows.get(key);
    const parsed = pageSections[key].schema.safeParse(row?.content);
    return [key, { content: parsed.success ? parsed.data : starterSections[key], visible: row?.visible ?? true }];
  });
  return Object.fromEntries(entries) as PageSectionMap;
}

export type Service = {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  imageUrl: string | null;
  visible: boolean;
};

export async function listServices(db: Db, options: { visibleOnly: boolean }): Promise<Service[]> {
  const rows = await db.service.findMany({
    where: options.visibleOnly ? { visible: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.shortDescription,
    longDescription: row.longDescription,
    icon: row.icon,
    imageUrl: row.imagePath,
    visible: row.visible,
  }));
}

export type Faq = { id: number; question: string; answer: string; visible: boolean };

export async function listFaqs(db: Db, options: { visibleOnly: boolean }): Promise<Faq[]> {
  return db.faq.findMany({
    where: options.visibleOnly ? { visible: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, question: true, answer: true, visible: true },
  });
}

export async function getPrivacyPolicy(db: Db): Promise<{ markdown: string; lastUpdated: Date }> {
  const row = await db.privacyPolicy.findUniqueOrThrow({ where: { id: 1 } });
  return { markdown: row.markdown, lastUpdated: row.updatedAt };
}

export type PageSeo = { path: string; title: string; description: string; ogImageUrl: string | null };

export async function listPageSeo(db: Db): Promise<PageSeo[]> {
  const rows = await db.pageSeo.findMany({ orderBy: { path: "asc" } });
  return rows.map(({ ogImagePath, ...seo }) => ({ ...seo, ogImageUrl: ogImagePath }));
}
