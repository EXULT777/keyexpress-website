# Key Express website

The website and Admin panel for **Key Express**, a fully mobile locksmith for cars, homes and businesses. It's built to be easy for older visitors and for people who aren't comfortable with technology: large text, big buttons, the phone number always one tap away, and no popups, sliders or animations.

Built from the project brief in [`docs/spec.md`](docs/spec.md).

## What's in it

**The public website**
- Home, Services, About, FAQ, Contact and Privacy Policy pages, plus a friendly "page not found" page.
- The phone number is always in view: in the header on large screens, and in a bar fixed to the bottom of the screen on phones. Every phone number is a tap-to-call link.
- A Request Service form. Requests are saved to the Admin inbox and, once email is set up, emailed too (with **EMERGENCY** at the start of the subject when the box is ticked).
- Search-engine basics: a title and description for every page, Locksmith structured data, a sitemap, `robots.txt` (keeps `/admin` out of search results) and a sharing picture.

**The Admin panel** at `/admin`
- **Service Requests**: the inbox, newest first, with emergencies in red, status (New, Contacted, Done), delete, and a spreadsheet (CSV) download.
- **Business Settings**: name, phone, email, city, towns, payment methods, the emergency badge, license number, footer text and the logo.
- **Page Content**: every block of text on every page; home page sections can be hidden.
- **Services** and **Questions (FAQ)**: add, edit, reorder, show or hide, delete.
- **Privacy Policy**: an editor with a live preview; saving updates "Last updated".
- **Search & Sharing**: each page's Google title, description and sharing picture.
- **Change Password**.

Everything the public site shows comes from the database, so changes made in the Admin appear as soon as they're saved.

## Before going live

1. In **Admin → Business Settings**, replace the placeholders: the phone number `(555) 014-7823`, the email `info@keyexpress.example`, "Your City" and "Nearby Town 1–8".
2. Add your **license number** if your state requires it on your website (many do). It then appears at the top and bottom of every page.
3. **Have the Privacy Policy reviewed** for your state's laws. The text provided is a plain-English starting point, not legal advice.
4. Upload your real logo in **Business Settings → Logo** (the current one is a placeholder).

## Run it on your computer

You need Node.js 22.13 or newer; 24 is recommended (see `.nvmrc`).

```bash
nvm use                 # or install Node.js 24
npm install
cp .env.example .env    # then set ADMIN_PASSWORD to at least 10 characters
npm run dev             # http://localhost:3000, and the Admin at http://localhost:3000/admin
```

The first start creates a `data/` folder holding the database (filled with the starter content) and uploaded images, and creates the Admin login from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Delete `data/` to start over.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the site locally with live reloading |
| `npm run build` | Builds the production version |
| `npm run bundle` | Turns the build into `deploy/`, the folder you upload (see [DEPLOY.md](DEPLOY.md)) |
| `npm test` | Runs the unit and integration tests |
| `npm run test:e2e` | Builds, bundles and clicks through every page and Admin feature in a real browser |
| `npm run check:contrast` | Checks every text/background color pair against WCAG AA |
| `npm run lint` / `npm run typecheck` | Code checks |
| `npm run db:migrate` / `npm run db:seed` | Applies database changes / adds the starter content by hand (the server does both on its own when it starts) |
| `npm run reset-admin-password` | Resets the Admin login to `ADMIN_EMAIL` and `ADMIN_PASSWORD` |

## How it's put together

Next.js 16 (App Router) with TypeScript and Tailwind CSS 4. SQLite through Prisma 7 and the libsql driver. zod checks every form, iron-session seals the Admin's login cookie, bcrypt hashes the password, nodemailer sends email, and lucide-react provides the icons.

```text
src/
├── app/
│   ├── (site)/         # the public pages and the Request Service action
│   ├── admin/          # login, plus every Admin page and its actions in (panel)/
│   ├── uploads/        # serves uploaded images from DATA_DIR
│   ├── og-image/       # the default sharing picture
│   ├── sitemap.ts, robots.ts, not-found.tsx
│   └── layout.tsx      # font and colors; every page renders on request
├── components/         # site/ (public) and admin/ building blocks
├── lib/                # shared by browser and server: icons, page sections, phone links
├── server/             # database, content, login, uploads, email, CSV (with tests)
└── instrumentation.ts  # prepares the database when the server starts
prisma/                 # schema, migrations, seed.ts
scripts/                # bundle, contrast check, Admin password reset
e2e/                    # click-through tests
```

- **Data lives outside the code.** The database, uploaded images and the session key live in `DATA_DIR`, so uploading a new version of the site never touches them. When the server starts, it applies any new database changes, adds the starter content the very first time, and creates the Admin if there isn't one. See [ADR 0002](docs/adr/0002-data-folder-outside-the-code.md).
- **SQLite through libsql**, because it runs on shared hosting's older Linux. See [ADR 0001](docs/adr/0001-sqlite-through-libsql.md).
- **Text placeholders.** Admin text can include `{phone}`, `{email}` and `{city}`; the site fills in the current Business Settings, and phone numbers become tap-to-call links.
- **Words.** [`GLOSSARY.md`](GLOSSARY.md) defines the terms used in the code and Admin (Service Request, Page Section, Business Account…).

### Security

- The Admin password is hashed with bcrypt. Login is limited to 5 wrong tries per 15 minutes per IP address, and changing the password signs out every other device.
- The login cookie is httpOnly and SameSite=Lax, and it's only sent over HTTPS once `SITE_URL` starts with `https://`.
- Every Admin page, action and download checks the login itself. Next.js server actions also reject requests from other websites.
- Every form is checked on the server with zod. The Request Service form has a hidden field that catches spam robots and a limit of 5 requests per hour per visitor.
- The Privacy Policy Markdown is cleaned down to plain formatting. Uploads are checked by their contents (PNG, JPG, WebP or SVG, 2 MB at most), SVGs are stripped of scripts and served under a script-blocking policy, and the spreadsheet download keeps values from running as formulas.
- `.env`, the `data/` folder and uploads are never committed or bundled.

## Testing

- `npm test`: 43 tests covering database setup (including several server processes starting at once), the Request Service form, login and passwords, rate limiting, uploads, Markdown cleaning, the CSV download and the notification email.
- `npm run test:e2e`: 26 browser tests against the real upload folder on an empty database, covering every public page at phone size, keyboard use, the request form through to the inbox, and every Admin feature.
- Lighthouse (mobile) on the production build: 100 for Performance, Accessibility, Best Practices and SEO on every public page.

## Deploying

See **[DEPLOY.md](DEPLOY.md)** for Namecheap shared hosting (cPanel "Setup Node.js App"), step by step, and a note on Vercel.

## Credits

The font is Atkinson Hyperlegible Next by the Braille Institute, under the SIL Open Font License ([`src/fonts/OFL.txt`](src/fonts/OFL.txt)). Icons are from [Lucide](https://lucide.dev).
