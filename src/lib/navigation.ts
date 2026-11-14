// Every public page, in menu order. The menu, the footer, the sitemap and the
// Admin's Search & Sharing list all come from this one list.
export const publicPages = [
  { path: "/", label: "Home", inMenu: true, adminName: "Home page", sitemapPriority: 1 },
  { path: "/services", label: "Services", inMenu: true, adminName: "Services page", sitemapPriority: 0.9 },
  { path: "/about", label: "About", inMenu: true, adminName: "About page", sitemapPriority: 0.6 },
  { path: "/faq", label: "FAQ", inMenu: true, adminName: "Questions (FAQ) page", sitemapPriority: 0.6 },
  { path: "/contact", label: "Contact", inMenu: true, adminName: "Contact page", sitemapPriority: 0.8 },
  { path: "/privacy-policy", label: "Privacy Policy", inMenu: false, adminName: "Privacy Policy page", sitemapPriority: 0.2 },
] as const;

export const mainNav = publicPages.filter((page) => page.inMenu);

export const footerLinks = publicPages.filter((page) => page.path !== "/");

// "Request Service" scrolls to the form on the home page and opens the Contact
// page (which has the same form) everywhere else, and from the home page too
// when the Admin has hidden the home page's form.
export function requestServiceHref(pathname: string, homeHasRequestForm: boolean) {
  return pathname === "/" && homeHasRequestForm ? "#request" : "/contact#request";
}
