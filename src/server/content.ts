import { z } from "zod";
import type { Db } from "./db";

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
