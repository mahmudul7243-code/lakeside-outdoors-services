# Lakeside Outdoors Services — Watertown, NY Lawn Care Website

Lightweight, open-source, no-framework static website. Just HTML + CSS + vanilla JS.

## Structure
```
lakeside-outdoors-services/
  index.html      → all sections (one-page conversion site)
  css/style.css   → custom responsive styles, no Bootstrap needed
  js/main.js      → mobile nav, slider, FAQ, forms, scrollspy
  images/         → local photos (hero, before/after, crew)
  robots.txt / sitemap.xml → basic SEO
```

## Hero animation (cinematic background, no video file needed)
- 6 slow cross-dissolving scenes (mowing → treatment → aeration → cleanup → mulch → hedge), 18s seamless loop, gentle Ken Burns zoom. Pure CSS: zero JS cost, GPU-composited `transform`/`opacity` only.
- Text readability: dark-green gradient `.hero-shade` sits above every scene; content grid is layered on top (`z-index`).
- Accessibility: `prefers-reduced-motion` freezes on the static poster; slideshow is `aria-hidden`.
- Mobile (≤640px): animation off, static poster only (data + battery).
- First hero image is preloaded (`fetchpriority="high"`) for fast LCP.

## Optional: real background video
1. Export: 720p H.264 MP4 (<3MB), no audio, slow motion, first/last frame visually matching. Optional WebM copy.
2. Save as `videos/hero-lawn.mp4` (+ `videos/hero-lawn.webm`), poster stays `images/hero-lawn.jpg`.
3. In `index.html`, uncomment the `<video class="hero-video" autoplay muted loop playsinline preload="metadata">` block — slideshow auto-hides (`:has`), reduced-motion + mobile fallbacks already wired in CSS/JS.

## Photos (current: Unsplash samples, free for commercial use, no attribution required)
- `images/hero-lawn.jpg` (525KB) — Daniel Watson — hero background
- `images/work-after.jpg` (303KB) — Andres Siimon — Before/After slider (both sides; "before" side uses a CSS sepia/dull filter as a demo effect)
- `images/crew-mowing.jpg` (1200×800, 240KB) — Carl Tronders — About section
- `images/equip-*.jpg` (8 files, 1000–1280px wide) — equipment cards: zero-turn + stand-on + walk-behind + trimmer + blower + hedge (Unsplash, free license); aerator + overseeder + walk-behind + trimmer + blower + stand-on action shots (Wikimedia Commons contributors, CC BY-SA — keep attribution if you keep these files; swapping in your own machine photos is recommended).
- Replace with your OWN photos anytime: keep filenames (or update `index.html` + `.ba-before/.ba-after` in `css/style.css`). Keep each <500KB, add `width`/`height` + `loading="lazy"` on every `<img>`.

## Run locally
Option 1 (Python): `python -m http.server 8000` inside this folder → open http://localhost:8000
Option 2: just double-click `index.html` (map iframe needs internet).

## Customize (5 min)
1. Phone: search-replace `(315) 555-0199` and `+13155550199` with real number.
2. Email: replace `hello@lakesideoutdoorswatertown.com`.
3. Domain: replace `lakesideoutdoorswatertown.com` in canonical + JSON-LD + robots/sitemap.
4. Prices & towns in `index.html` (#services, #areas, plans).
5. Reviews: `#reviews` has a Google summary header (4.9★, 120+, Read all / Leave a review buttons) + `aggregateRating` schema. The 3 cards are PLACEHOLDER text — paste your real Google reviews there. Get your review link: Google Business Profile → Reviews → "Share review form" → copy link → replace the two `google.com/maps/search/...` hrefs in `#reviews`.
6. Photos: see "Photos" section above — swap sample JPGs for your own job photos.
7. Quote form → live via Formspree (free, 5 min, no backend):
   1. Go to formspree.io → Sign up → **New Form** → name it "Lakeside Quote" → set target email.
   2. Copy the endpoint ID from the URL, e.g. `https://formspree.io/f/mabcdwyz` → ID is `mabcdwyz`.
   3. Open `js/main.js` → paste the ID into `FORMSPREE_ID = ""` (top of file). Done — BOTH forms (hero + contact) go live instantly.
   4. Test: submit once → verify the email Formspree sends → form activates. Free tier: 50 submissions/month, spam filtering + honeypot included.

## Features included
- Sticky header + mobile menu + sticky Call/Quote bar
- Hero with quote card (lead capture), trust badges
- Services (6), Why Us, 3-step process, Service Area + Google Map embed
- Before/After drag slider (keyboard accessible)
- Plans, Reviews, FAQ (details/summary + FAQ schema)
- Contact form with validation, footer, social placeholders
- SEO: title/meta, canonical, OG, LocalBusiness + FAQ JSON-LD, semantic HTML
- Accessibility: skip link, labels, focus styles, aria for slider/nav
- Performance: zero external CSS/JS, system fonts, defer JS (~140KB total)

## Deploy free
- Netlify / Cloudflare Pages / GitHub Pages: drag-drop this folder.
- Enable HTTPS (auto), then submit sitemap to Google Search Console.
- Claim Google Business Profile for "Lawn care Watertown NY" and link this site.

## Next upgrades (optional)
- Separate pages: /services, /areas, /reviews for stronger local SEO
- Real photo gallery + Google reviews embed
- Online booking (Calendly) + click-to-text
