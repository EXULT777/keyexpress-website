import "server-only";
import { cache } from "react";
import { placeholderValues } from "@/lib/placeholders";
import { getBusinessSettings, getPageSections, getPrivacyPolicy, listFaqs, listPageSeo, listServices } from "./content";
import { db } from "./db";

// What public pages read. Each is fetched at most once per request, however many
// components (layout, page, metadata) ask for it.
export const getSettings = cache(() => getBusinessSettings(db));
export const getSections = cache(() => getPageSections(db));
export const getVisibleServices = cache(() => listServices(db, { visibleOnly: true }));
export const getVisibleFaqs = cache(() => listFaqs(db, { visibleOnly: true }));
export const getPolicy = cache(() => getPrivacyPolicy(db));
export const getAllPageSeo = cache(() => listPageSeo(db));

export async function getPlaceholderValues() {
  return placeholderValues(await getSettings());
}
