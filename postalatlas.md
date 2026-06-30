# PostalAtlas — Project Blueprint (plain English)

_Last updated: 2026-06-15_

This document explains what PostalAtlas is, how every piece fits together, and
what lives where — written so you can understand the whole thing without being
technical.

---

## 1. What is PostalAtlas?

PostalAtlas is a **website that lets people look up postal / ZIP / PIN codes**
for places around the world. You type a city or a code, and you get a page with:

- the postal code,
- the place name, region/state, and district,
- all the localities that share that code,
- the GPS coordinates and a map,
- a short FAQ.

**Live at:** https://postalatlas.com

It makes money through **Google AdSense** (ad slots are already placed on the
pages) and is built to rank well in **Google search AND AI answer engines**
(ChatGPT, Perplexity, Google AI Overviews) — that's the "SEO/GEO" work.

---

## 2. The big picture (how it all connects)

Think of it as an assembly line with 4 stations:

```
[1] Supabase database  ->  [2] Build script on your PC  ->  [3] Cloudflare R2 storage  ->  [4] Cloudflare Worker  ->  visitor's browser
   (raw postal data)        (turns data into web pages)     (holds the finished pages)    (serves them on the domain)
```

1. **Supabase** — an online database that stores the raw postal data (millions
   of rows). Think of it as the giant spreadsheet of facts.
2. **The build** — a program on your PC reads the data and **generates one ready-made
   HTML page per postal code** (this is "static site generation"). The result is
   a folder full of plain web pages.
3. **Cloudflare R2** — cloud storage (like a hard drive in the cloud) that holds
   all those finished pages.
4. **Cloudflare Worker** — a tiny program at Cloudflare that takes each visitor
   request (e.g. `postalatlas.com/directory/in/110001/`) and hands back the right
   page from R2.

**Why static pages?** Because they're cheap, extremely fast, and — most
importantly — search engines and AI bots can read the full content instantly.
That's the whole SEO strategy.

---

## 3. What is in Supabase?

One table called **`postal_codes`**. Each row = one place. Columns:

| Column | Meaning | Example |
|---|---|---|
| `country_code` | 2-letter country (ISO) | `IN`, `US`, `GB` |
| `postal_code` | the code | `110001` |
| `place_name` | town/locality | `Baroda House` |
| `admin_name1` | state / province | `Delhi` |
| `admin_name2` | district / county | `Central Delhi` |
| `admin_name3` | smaller area (optional) | — |
| `lat`, `lng` | GPS coordinates | `28.61, 77.21` |

The original source of all this data is a local file: **`global_postal_codes.parquet`**
(a compressed data file in the project, ~29 MB, 121 countries). A loader script
uploads one country at a time from that file into Supabase.

**Supabase project:** ref `wkkizolomgdcmhevyimy`. Free tier. The data is public,
read-only (protected so visitors can't change it).

> ⚠️ There is a temporary "insert" permission still enabled so the loader can add
> countries. When you're completely done adding countries, it should be turned
> off (run the `drop policy "temp load insert"...` line from `supabase_setup.sql`
> in the Supabase SQL editor). Ask me and I'll walk you through it.

---

## 4. What is on the website right now?

- **Countries live:** India, United States, United Kingdom (more added in batches).
- The **data for ~34 countries is already uploaded to Supabase** — they just need
  to be "switched on" in the config and rebuilt to appear on the site.
- Each country adds thousands–hundreds of thousands of pages. India alone ≈ 19,238
  codes; the US ≈ 41,488; etc.

To add a country, I: switch it on → rebuild → strip → refresh the upload folder →
you deploy. (See section 7.)

---

## 5. The project folder (`C:\prjt\Po`) — what each thing is

| File / folder | What it's for |
|---|---|
| `app/` | The website's pages & layout (the actual design and page templates). |
| `components/` | Reusable pieces: the search box, header, footer, logo. |
| `lib/` | Helper code (database connection, data shaping, country flags, SEO). |
| `config/buildConfig.ts` | **The on/off switch for countries.** `TARGET_COUNTRIES` lists which countries get built. |
| `scripts/` | The automation: data loader, build orchestrator, the page-cleanup script. |
| `global_postal_codes.parquet` | The raw source data file (all countries). |
| `.env.local` | Secret keys (Supabase + the site domain). Never share. |
| `out/` | The freshly built website (temporary, recreated every build). |
| `server/` | **A clean copy of the finished site, ready to upload.** This is what gets deployed. |
| `deploy-to-r2.cmd` | **Double-click this to publish `server/` to the live site.** |
| `rclone-r2.conf` | The connection settings (with secret keys) for uploading to R2. Never share/commit. |
| `worker/` | The little Cloudflare program that serves pages from R2 on the domain. |
| `postalatlas.md` | This file. |
| `R2.md` | How to set up uploading on a new computer. |

---

## 6. How a build actually works (the assembly line in detail)

When I "build", this happens automatically (via `npm run build:all`):

1. **Fetch + prepare** — downloads the enabled countries' data from Supabase and
   writes small helper files: the search index, the sitemaps, the stats.
2. **Generate pages** — creates one HTML page for every postal code, plus country,
   region, and district browse pages. (Big countries are split into chunks so the
   build doesn't run out of memory.)
3. **Combine** — merges everything into the `out/` folder.
4. **Strip** — runs `scripts/strip-rsc.cmd` to delete leftover helper files
   (`.txt` files Next.js creates) that aren't needed — this cuts the file count by
   ~85% so uploads are fast.
5. **Copy to `server/`** — the clean, final site is copied to `server/` for you.

Then **you deploy** (section 7).

**Important technical note:** the site is huge (tens of thousands of files). That's
too many for Cloudflare's drag-and-drop "Pages" deploy (which caps at 20,000
files). That's why it lives on **R2** (no limit) and is served by a **Worker**.
Don't try to deploy via the Cloudflare Pages/"Compute" upload — it will be
rejected. Always use `deploy-to-r2.cmd` / R2.

---

## 7. How to publish changes (your part)

After I prepare a new `server/` folder, you just:

1. Double-click **`C:\prjt\Po\deploy-to-r2.cmd`**
2. Wait for **"SUCCESS — your site is live at https://postalatlas.com"**

That's it. It only uploads files that changed, and it's safe to re-run.
(Full setup-from-scratch instructions are in **R2.md**.)

---

## 8. The accounts & pieces (your "keys to the kingdom")

| Thing | What it is | Where |
|---|---|---|
| **Domain** | postalatlas.com | Bought at Namecheap, managed by Cloudflare |
| **Cloudflare** | Hosting (R2 storage + Worker + DNS) | account `9106ad535e6a4c4539f5558b7cba714e`, email techorbit71@gmail.com |
| **R2 bucket** | Where the website files live | bucket name: `postalatlas` |
| **Worker** | Serves the site on the domain | worker name: `postalatlas` |
| **Supabase** | The postal database | project `wkkizolomgdcmhevyimy` |
| **Google Analytics** | Visitor tracking | tag `G-71BZ6BGF71` (on every page) |
| **AdSense** | Ad revenue | ad slots are placed; paste your AdSense code into the marked spots when approved |

**Rough running cost:** essentially free right now — Supabase free tier, Cloudflare
R2 free tier (a few GB), Worker free tier. Only ongoing cost is the domain renewal
(~once a year).

---

## 9. SEO / GEO features already built in

- A unique, indexable page per postal code (the core of the strategy).
- **Structured data** (JSON-LD: Place, FAQ, Breadcrumbs, Organization) so Google
  and AI engines can read the facts.
- A plain-language "direct answer" sentence + FAQ on every page (what AI engines
  quote).
- `sitemap.xml`, `robots.txt`, and `llms.txt` (a guide for AI crawlers).
- Trust pages: `/about/`, `/methodology/`, `/contact/`, `/postal-code-guide/`.
- Fast loading (static + global CDN).

**Still to do (your side):** submit the site to Google Search Console and Bing
Webmaster Tools after launch; build some backlinks; set up Cloudflare Email
Routing so `contact@postalatlas.com` receives mail.

---

## 10. One-line summary

> PostalAtlas turns a postal-code database (Supabase) into hundreds of thousands
> of ready-made web pages, stores them on Cloudflare R2, and serves them on
> postalatlas.com through a tiny Cloudflare Worker — fast, cheap, and built to be
> found by both Google and AI assistants.
