# Deploying Keys Express

These steps put the site on **Namecheap shared hosting** using cPanel's **Setup Node.js App**. At the end there's a short note on Vercel.

The idea in one paragraph: you build the site **on your own computer** into one folder (`deploy/`), upload it, and point cPanel at it. The database and uploaded images live in a **separate data folder** on the server, so uploading a new version later never touches them. When the site starts, it sets up its own database: it applies any database changes, fills in the starter content the first time, and creates your Admin login. Nothing is installed or built on the server.

> Your previous site (Speedster) was uploaded as plain files to `public_html` by a GitHub Action. This one is different: it's a small Node.js server, because the Admin panel and the request inbox need a running server and a database.

## What you need

- A Namecheap shared hosting plan with **Setup Node.js App** in cPanel. Check that its **Node.js version** list has **24** (or at least **22.13**).
- Your domain pointed at the hosting, with SSL (https) working. cPanel's **SSL/TLS Status** page should show the domain as secured; Namecheap's AutoSSL normally does this for you.
- On your computer: this project, Node.js 24 (`nvm use`), and `zip`.

## 1. Build the upload folder (on your computer)

```bash
npm ci
npm run build
npm run bundle
cd deploy && zip -r ../keyexpress-upload.zip . && cd ..
```

`keyexpress-upload.zip` now holds everything the server needs. It includes a hidden folder called `.next`; the `zip -r … .` command above includes it. If you zip some other way, make sure `.next` is in the zip, or the site will have no styling.

## 2. Create the data folder (on the server)

1. In cPanel, open **File Manager**. You start in your home folder, `/home/YOUR-CPANEL-USERNAME`. Your username is also shown in cPanel's sidebar under *Current User*.
2. Click **+ Folder** and create `keyexpress-data`. It must be in your home folder, **not** inside `public_html`.

Its full path, for example `/home/johnsmith/keyexpress-data`, is your **DATA_DIR**. Keep it handy.

## 3. Upload the site

1. Still in **File Manager**, create a second folder in your home folder: `keyexpress`. Again, not inside `public_html`.
2. Open `keyexpress`, click **Upload**, and upload `keyexpress-upload.zip`.
3. Right-click the zip, choose **Extract**, and extract it into `/keyexpress`. You should now see `server.js`, `package.json`, `.next` (turn on *Settings → Show Hidden Files* to see it), `node_modules`, `public`, `prisma` and `scripts`.
4. Delete the zip.

## 4. Create the Node.js app

In cPanel, open **Setup Node.js App** and click **+ CREATE APPLICATION**:

| Field | What to enter |
| --- | --- |
| **Node.js version** | 24 (or the newest 22 listed, at least 22.13) |
| **Application mode** | Production |
| **Application root** | `keyexpress` |
| **Application URL** | your domain |
| **Application startup file** | `server.js` |

If there's a **Passenger log file** box, enter `/home/YOUR-CPANEL-USERNAME/keyexpress-data/server.log`, so any error messages end up somewhere you can read them.

Under **Environment variables**, click **ADD VARIABLE** for each of these:

| Name | Value |
| --- | --- |
| `DATA_DIR` | the full path from step 2, e.g. `/home/johnsmith/keyexpress-data`. It must start with `/home/`; a short name like `data` would put your database inside the app folder, where an update could delete it |
| `SITE_URL` | your address, exactly as people should see it, e.g. `https://www.keyexpress.com` |
| `ADMIN_EMAIL` | the email or username you'll log in with (capitals don't matter) |
| `ADMIN_PASSWORD` | a password of at least 10 characters. A short sentence is easy to remember |

Email is optional (see *Email for new requests* below). Then click **CREATE** (or **SAVE**), and **START APP** (or **RESTART**).

**Don't click "Run NPM Install".** Everything the server needs is already in the folder you uploaded. That button expects an empty project and will complain that a `node_modules` folder already exists. That message is harmless; just don't use the button.

## 5. Check it works

1. Visit your domain. The very first visit can take a few seconds while the site creates its database.
2. Go to `https://your-domain/admin` and log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
3. In **Business Settings**, replace the placeholder phone number, email, city and towns. They change on every page as soon as you save.
4. Send yourself a test request from the Contact page and check it appears under **Service Requests**.

`ADMIN_PASSWORD` is only used to create the first Admin. Changing it later does **not** change your password; use **Change Password** in the Admin, or see *Forgot the Admin password* below. You can delete the `ADMIN_PASSWORD` variable after your first login if you like.

## Updating the site later

1. **First, check where your data is.** In **Setup Node.js App**, open the app and look at `DATA_DIR`. It must be a full path starting with `/home/` and pointing outside the `keyexpress` folder, e.g. `/home/johnsmith/keyexpress-data`. If it's missing or doesn't start with `/home/`, **stop**: your database is inside the app folder, and the steps below could delete it. Back up the app folder first (see *Backups*), then set `DATA_DIR` as in step 4 and move the `data` folder's contents into it.
2. On your computer: `npm ci`, `npm run build`, `npm run bundle`, and zip `deploy/` as in step 1.
3. In **File Manager**, open `keyexpress` and delete only the `.next` and `node_modules` folders (they never hold your data). This clears out files from the old version.
4. Upload the new zip into `keyexpress` and **Extract** it. It replaces the old files.
5. In **Setup Node.js App**, click **RESTART** on the app.

If the new version changes the database, those changes are applied automatically when it starts. Your content, uploaded images and service requests stay as they were.

## Database changes and starter content

This is all automatic. Each time the server starts, `src/instrumentation.ts`:

1. applies any new database changes from `prisma/migrations` (the same thing as `npx prisma migrate deploy`, recorded the same way);
2. fills in the starter content, but only on the very first start, into an empty database. It never overwrites your edits or brings back things you deleted;
3. creates the Admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD`, but only if there's no Admin yet.

To do the same by hand on a computer or server that has the whole project (not the upload folder):

```bash
DATA_DIR=/path/to/keyexpress-data npx prisma migrate deploy
DATA_DIR=/path/to/keyexpress-data ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run db:seed
```

The start command is `node server.js`, which is what cPanel runs.

## Email for new requests (optional)

Without email settings, requests are only saved in the Admin inbox. To also get an email for each one:

1. Create a mailbox for the website to send from, e.g. `website@your-domain` (cPanel → **Email Accounts**, or Namecheap Private Email).
2. Add these environment variables to the app, then **RESTART** it:

| Name | Value |
| --- | --- |
| `SMTP_HOST` | `mail.your-domain.com` for a cPanel mailbox, or `mail.privateemail.com` for Namecheap Private Email |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | the full mailbox address, e.g. `website@your-domain.com` |
| `SMTP_PASSWORD` | that mailbox's password |
| `SMTP_FROM` | e.g. `Keys Express Website <website@your-domain.com>` |

Emails go to the **Send new service requests to** address in Business Settings, or to the business email if that's empty. Emergencies start with **EMERGENCY** in the subject.

## Backups

Everything that changes lives in `keyexpress-data`: the database (`keyexpress.db`), uploaded images (`uploads/`) and the login key (`session-secret`). To back up, right-click `keyexpress-data` in File Manager, choose **Compress**, and download the zip. To restore, stop the app, upload and extract the backup into `keyexpress-data`, and start the app again.

## Forgot the Admin password

1. In **Setup Node.js App**, click the edit (pencil) icon on the app.
2. Set `ADMIN_EMAIL` and a new `ADMIN_PASSWORD` (at least 10 characters) and click **SAVE**.
3. Click **Run JS script**, choose **reset-admin-password**, and run it.
4. Log in at `/admin` with the new password. Every other device is signed out.

If you use SSH or cPanel's Terminal instead: run the "enter virtual environment" command that **Setup Node.js App** shows at the top of the app's page, then `npm run reset-admin-password`, with `DATA_DIR`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` set.

## If something goes wrong

- **"Incomplete response" or an error page instead of the site.** Open the log file from step 4 (`server.log` in `keyexpress-data`), or the `stderr.log` file if there's one in the `keyexpress` folder. The most common causes:
  - `DATA_DIR` isn't a full path, or the folder doesn't exist.
  - The Node.js version is older than 22.13.
  - The zip was extracted without the `.next` folder, or into the wrong folder. `server.js` must be directly inside `keyexpress`.
- **The site has no colors or styling.** The `.next` folder is missing. Re-zip as in step 1 and extract again.
- **You log in and immediately end up at the login page again.** `SITE_URL` starts with `https://`, but you're visiting with `http://`. Use the https address, and turn on cPanel → **Domains** → **Force HTTPS Redirect**.
- **You changed an environment variable and nothing happened.** Click **RESTART**; variables are read when the app starts.
- **Search results or social previews show the wrong address.** Fix `SITE_URL` and restart.

## Deploying to Vercel instead (note)

Vercel can host the Next.js part, but its servers have no permanent disk, so the SQLite file and uploaded images would be lost between requests. Moving there is a code change, not a setting:

- Switch Prisma to **PostgreSQL** (for example Vercel Postgres/Neon) with `@prisma/adapter-pg`, and create a new first migration for Postgres.
- Store uploads in **Vercel Blob** (or similar) instead of `DATA_DIR/uploads`, and remove the `/uploads` route.
- Run `prisma migrate deploy` (and the seed once) as part of the deploy instead of at server start, and remove `DATA_DIR`.
- Set `SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` (32+ random characters, since there's no data folder to keep a generated one) and the SMTP variables in Vercel's project settings.
