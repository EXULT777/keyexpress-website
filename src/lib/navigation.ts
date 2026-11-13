export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

// "Request Service" scrolls to the form on the home page and opens the Contact
// page (which has the same form) everywhere else.
export function requestServiceHref(pathname: string) {
  return pathname === "/" ? "#request" : "/contact#request";
}
