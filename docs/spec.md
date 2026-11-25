# Build the "Keys Express" Locksmith Website (Public Site + Admin Panel)

## Your role
Act as a **senior UI/UX designer** and a **senior full-stack developer** (front end and back end). Every decision should make the site look clean and professional and be very easy to use, **especially for older people and people who are not good with technology**. Plan the work first, then build it step by step, and test it before you say you are finished.

---

## 1. Project summary
- **Business name:** Keys Express
- **Type:** A fully mobile locksmith (no storefront). Technicians drive to the customer for car, home, and business lock and key jobs.
- **Specialty:** Advanced car key cutting and programming, including smart keys, fobs, transponder keys, and European makes.
- **Phone (placeholder):** (555) 014-7823. Store it in ONE place (site settings) so it can be changed from the admin panel.
- **Email (placeholder):** info@keyexpress.example
- **Service area (placeholder):** "Your City and surrounding areas", with a list of 8 nearby towns, all editable in the admin panel.
- **Availability:** 24/7 emergency service.
- **Payment methods:** Cash, Visa, Mastercard, American Express, Discover, Apple Pay, Google Pay (editable).
- **Logo:** We have no logo yet. Create a simple placeholder **SVG logo**: a rounded silver-and-blue key icon plus the wordmark "KEYS EXPRESS" in a bold, clean sans-serif. Save it as `/public/logo.svg` and make it replaceable through an upload in the admin panel.

---

## 2. Tech stack
- **Next.js (App Router) + TypeScript + Tailwind CSS**
- **Database:** SQLite with **Prisma** (simple, a single file, works on shared Node hosting)
- **Admin authentication:** a single admin account. The password is hashed with bcrypt and set from `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) on the first seed. Sessions use a secure httpOnly cookie (for example with `iron-session` or a signed JWT). Add login rate limiting.
- **Image uploads** (logo, optional service images): stored in `/public/uploads`, accepting only png, jpg, webp, and svg, with a 2 MB limit.
- **Forms:** server actions or API routes with **zod** validation, plus a honeypot field against spam.
- **Email notifications** for new service requests: optional, through SMTP settings in `.env` (nodemailer). If SMTP is not set up, just save the request to the database.
- Must deploy on **Namecheap shared hosting (cPanel → "Setup Node.js App")**, the same setup as our previous site. Include a `DEPLOY.md` with exact step-by-step instructions (build, upload, environment variables, `prisma migrate deploy`, seed, start command). Also add a short note on how to deploy to Vercel instead (that would need Postgres instead of SQLite).
- Put the code on GitHub-ready: add `.gitignore` (exclude `.env`, the database file, and uploads) and a clear `README.md`.

---

## 3. Design system (silver + blue, simple, senior-friendly)

### Colors
| Role | Color |
|---|---|
| Primary dark blue (header, footer, headings) | `#0B2545` |
| Action blue (buttons, links) | `#1E56C7` |
| Action blue hover | `#16439E` |
| Silver (borders, accents, cards) | `#C5CCD6` |
| Light silver background | `#F3F5F8` |
| White | `#FFFFFF` |
| Body text | `#1A202C` |
| Emergency accent (only the "24/7 Emergency" badge) | `#C62828` |

- Use a subtle **brushed-silver gradient** (`#E9EDF2 → #C5CCD6`) only on section dividers, card tops, or the hero background. Keep it soft and never busy.
- **All text must meet WCAG AA contrast** (4.5:1 minimum). Check every color pair.

### Typography
- Font: **Inter** or **Atkinson Hyperlegible** (both very readable), loaded with `next/font`.
- Body text **18px minimum**, line-height 1.6. Headings are large and bold (H1 about 40–48px on desktop, 32px on mobile).
- No thin font weights, no all-caps paragraphs, no italics for important text.

### Usability rules (very important)
- **No 3D, no parallax, no carousels or sliders, no autoplay, no popups.** At most a gentle hover color change, and respect `prefers-reduced-motion`.
- **Big buttons:** at least 56px tall, with large tap areas and clear labels like "Call Now" and "Request Service".
- The **phone number is always visible**:
  - Desktop: in the top header, large and clickable.
  - Mobile: a **sticky bottom bar** with a large "📞 Call Now" button and a "Request Service" button.
- Every phone number is a `tel:` link.
- Simple one-page-style home with a **short, plain navigation**: Home · Services · About · FAQ · Contact. The menu is a large, simple hamburger on mobile, with the word "Menu" next to the icon.
- Plenty of white space, one idea per section, short sentences.
- Icons always have a text label next to them (no icon-only buttons except the menu, which also says "Menu").
- Forms: large fields, labels above the fields (not placeholder-only), clear error messages in plain words, and a big confirmation message after sending.
- Fully responsive (test at 360px, 768px, 1280px). Accessible: semantic HTML, alt text, keyboard navigation, visible focus outlines, a skip-to-content link, and ARIA where needed.
- Use simple line icons (`lucide-react`) for services: car, key, smartphone/fob, chip, ignition, building, home, door.

---

## 4. Pages and content
Use the content below. The text has been rewritten in our own words and keeps the same meaning as the reference site. Do not copy any other website's text. All content must load from the database so the admin can edit it.

### 4.1 Home page (`/`), sections from top to bottom

**1. Header**
Logo (left) · nav · large phone number + "Call Now" button (right). A small red badge: "24/7 Emergency Service".

**2. Hero**
- H1: **"Locked Out or Lost Your Keys? We'll Get You Back In, Fast."**
- Text: "Keys Express is a mobile locksmith serving Your City and nearby areas. We come straight to you, for cars, homes, and businesses."
- Buttons: **"Get Help Now"** (calls the phone number) + **"Request Service"** (scrolls to the form)
- The phone number in large text below the buttons.

**3. Emergency Help, 24/7**
- H2: "Emergency Lockout? We're Available Day and Night"
- Text: "Locked out of your car, house, or office? Call us any hour, any day. A technician will head your way quickly to get you back inside without damaging your locks."
- Button: "Call Now"

**4. Service for Businesses**
- H2: "Reliable Locksmith Service for Your Business"
- Text: "From company vehicles to office doors to tenant locks, we keep your property secure and your keys under control. Property managers, offices, and shops can count on us."
- Button: "Request Service"

**5. About Us**
- H2: "Locksmith Help That Comes to You"
- Text: "Keys Express is a fully mobile locksmith company. Instead of you coming to a shop, we bring the tools and the expertise to your driveway, home, or business. We're known for handling the difficult jobs: the advanced car keys and tricky locks that other companies often turn down."

**6. Why Choose Us** (5 simple badges in a row; they wrap to 2 columns on mobile, each with an icon and a short line)
- **Mobile Service:** "We come to your location."
- **Expert Technicians:** "Highly experienced professionals."
- **Fast Response:** "Quick help when you need it."
- **Licensed & Insured:** "Trained, professional technicians."
- **Satisfaction Guaranteed:** "We're not done until you're happy."

**7. Our Services** (a 3×3 grid of large cards, each with an icon, a title, a 1–2 sentence description, and a "Call for this service" link)
1. **European & Foreign Vehicles:** Keys and programming for Audi, Volkswagen, Volvo, Mercedes-Benz, BMW, and other imported makes.
2. **Domestic Vehicles:** Key cutting and programming for Ford, Chevrolet, Dodge, Jeep, GMC, and other American brands.
3. **Smart Keys:** Push-to-start and proximity keys made and programmed on the spot.
4. **Key Fob Programming:** Lost or broken remote? We replace and program key fobs for less than the dealership.
5. **Transponder Keys:** Chip keys cut and paired to your vehicle so it starts right away.
6. **Ignition Repair & Replacement:** Key stuck or ignition won't turn? We repair or replace the ignition.
7. **Apartments:** Lockouts, rekeys, and lock changes for tenants and property managers.
8. **Residential:** Home lockouts, rekeying after a move, and new locks for better security.
9. **Commercial:** Lock replacement, hardware upgrades, and master key systems for businesses.

**8. Key Fob Highlight**
- H2: "Need a New Key Fob? Get It Done Today"
- Text: "Lost your remote or did it stop working? We replace and program key fobs at prices well below the dealer, often the same day, right where your car is parked."
- Button: "Call Now"

**9. Business Accounts**
- H2: "Open a Business Account"
- Text: "Let us manage the locks and keys for your company, buildings, or rental properties. One call handles rekeys, lock changes, and key control, so you can focus on running your business."
- Button: "Call to Set Up an Account"

**10. Request Service Form** (id `#request`)
Fields: Full name · Phone number · Email (optional) · Service needed (dropdown of services + "Not sure") · Address or area · Message (optional) · a "This is an emergency" checkbox · large "Send Request" button.
Text above the form: "Prefer to talk? Call us at [phone]. It's the fastest way to get help."
On success: "Thank you! We received your request and will call you shortly. For emergencies, please call [phone]."

**11. FAQ preview:** show all 5 FAQs as large accordions (see 4.2).

**12. Service Area**
- H2: "Areas We Serve"
- Text: "We proudly serve Your City and the surrounding communities, including:" followed by a simple list of the 8 towns from settings.

**13. Footer** (dark blue)
Logo, short description, phone (large), email, service area, "Open 24/7 for emergencies", accepted payment method icons and labels, links (Services, About, FAQ, Contact, Privacy Policy), "© {year} Keys Express. All rights reserved."

### 4.2 FAQ (`/faq` page + section on home), all editable in the admin panel
1. **How quickly can you get to me?**
   We're a mobile service, so a technician heads to you as soon as you call. In most cases we arrive within 20–40 minutes, depending on your location and traffic.
2. **Do you really work 24 hours a day?**
   Yes. Emergency lockout help is available 24 hours a day, 7 days a week, including weekends and holidays.
3. **Can you make a car key if I lost all of my keys?**
   Yes. We can cut and program a brand-new key on the spot, even with no original key, for most domestic and European vehicles, including smart keys and transponder keys.
4. **Are you cheaper than the car dealership?**
   In most cases, yes. Our key and fob replacement usually costs much less than the dealer, and we come to you, so there's no towing.
5. **Are your locksmiths licensed and insured?**
   Yes. Our technicians are trained, licensed, and insured professionals, and we stand behind our work with a satisfaction guarantee.

### 4.3 Other pages
- `/services`: all 9 services in more detail (2–3 short paragraphs each), plus call buttons.
- `/about`: an expanded About section plus the Why Choose Us badges.
- `/contact`: phone (large), email, service area, the Request Service form.
- `/privacy-policy`: see section 5.
- A custom `404` page with a big "Go to Home" button and the phone number.

---

## 5. Privacy Policy (`/privacy-policy`, editable in the admin panel as rich text or markdown)
Write a clear, plain-English privacy policy with these headings, and show "Last updated: {date}" at the top:
1. **Who We Are:** Keys Express, a mobile locksmith service; contact details.
2. **Information We Collect:** name, phone, email, address or location, service details from the request form or phone calls; basic technical data (browser type, pages visited) through cookies or analytics.
3. **How We Use Your Information:** to respond to requests, dispatch technicians, provide quotes, process payments, improve the website, and meet legal obligations.
4. **Sharing Your Information:** we never sell personal data. It is shared only with service providers who help run the business (hosting, payment processing, email) or when required by law.
5. **Cookies:** what they are, and that the user can disable them in the browser.
6. **Data Security:** reasonable safeguards; no method is 100% secure.
7. **Data Retention:** kept only as long as needed for service, records, and legal reasons.
8. **Your Rights:** request access, correction, or deletion by contacting us.
9. **Children's Privacy:** the site is not directed to children under 13.
10. **Third-Party Links:** we are not responsible for other sites' practices.
11. **Changes to This Policy:** updates are posted on this page.
12. **Contact Us:** phone and email from settings.
Add a short note in the README that the owner should have the policy reviewed for their state's laws before going live.

---

## 6. Admin panel (`/admin`)
It must be **very simple to use**: big buttons, plain words, a sidebar menu, and a "Saved ✓" message after every change. It also needs to work on a phone.

**Login:** `/admin/login` (email + password). Every `/admin/*` route and admin API is protected. Add a "Log out" button and a "Change password" page.

**Dashboard:** counts of new service requests, plus quick links.

**Sections:**
1. **Business Settings:** business name, phone, email, service area city, list of towns (add/remove), payment methods, emergency badge on/off, logo upload (with preview and a "restore default logo" option), footer text.
2. **Home Page Content:** edit the text of every home section (headings, paragraphs, button labels). Each section can be shown or hidden.
3. **Services:** add, edit, delete, reorder (up/down buttons; no drag and drop required), show or hide; fields: title, short description, long description, icon (pick from a list), optional image.
4. **FAQ:** add, edit, delete, reorder, show or hide.
5. **Privacy Policy:** a markdown editor with live preview; "Last updated" refreshes automatically on save.
6. **Service Requests (inbox):** a table of form submissions (newest first, emergencies highlighted in red), status New / Contacted / Done, a click-to-call link on the phone number, delete, CSV export.
7. **SEO:** page title, meta description, Open Graph image for each page.

Every change on the public site shows up right after saving (use `revalidatePath`, or render the pages dynamically).

---

## 7. SEO and performance
- Metadata on every page; `LocalBusiness` / `Locksmith` JSON-LD schema using values from settings; `sitemap.xml`; `robots.txt` (disallow `/admin`); Open Graph images.
- Lighthouse target: **95+** for Performance, Accessibility, Best Practices, and SEO on mobile.
- Optimized images (`next/image`), no heavy libraries, minimal JavaScript on public pages.

## 8. Security
- Passwords hashed with bcrypt; httpOnly, secure, sameSite cookies; CSRF-safe server actions; zod validation on all input; sanitize markdown output; rate-limit login and the request form; restrict upload file types and sizes; never expose `.env`.

## 9. Seed data
Create `prisma/seed.ts` that fills in everything above (settings, home content, 9 services, 5 FAQs, privacy policy, admin user from `.env`), so the site looks complete right after setup.

## 10. Before you finish
1. Run `npm run build` with no errors or type errors.
2. Click through every public page and every admin feature, including add/edit/delete for services and FAQs, the logo upload, and the request form → inbox.
3. Check mobile (360px) and desktop, the sticky call bar, keyboard navigation, and contrast.
4. Give me a short summary of what was built, the admin login steps, and how to deploy (and point to `DEPLOY.md`).
