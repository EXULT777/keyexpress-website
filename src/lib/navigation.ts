// Every public page. The sitemap and the Admin's Search & Sharing list come from this list.
export const publicPages = [
  { path: "/", adminName: "Home page", sitemapPriority: 1 },
  { path: "/about", adminName: "About page", sitemapPriority: 0.6 },
  { path: "/contact", adminName: "Contact page", sitemapPriority: 0.8 },
  { path: "/privacy-policy", adminName: "Privacy Policy page", sitemapPriority: 0.2 },
] as const;

export type MenuLink = { href: string; label: string; homeSection?: "services" | "faq" };

// The menu, in order. Services and FAQ scroll to their sections on the home page,
// so they only show while the home page shows that section.
export const menuLinks: MenuLink[] = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services", homeSection: "services" },
  { href: "/about", label: "About" },
  { href: "/#faq", label: "FAQ", homeSection: "faq" },
  { href: "/contact", label: "Contact" },
];

export function visibleMenuLinks(homeShows: Record<NonNullable<MenuLink["homeSection"]>, boolean>) {
  return menuLinks.filter((link) => !link.homeSection || homeShows[link.homeSection]);
}

// The footer has the menu without Home, plus the Privacy Policy.
export function footerLinks(menu: MenuLink[]) {
  return [...menu.filter((link) => link.href !== "/"), { href: "/privacy-policy", label: "Privacy Policy" }];
}

// "Request Service" scrolls to the form on the home page and opens the Contact
// page (which has the same form) everywhere else, and from the home page too
// when the Admin has hidden the home page's form.
export function requestServiceHref(pathname: string, homeHasRequestForm: boolean) {
  return pathname === "/" && homeHasRequestForm ? "#request" : "/contact#request";
}
