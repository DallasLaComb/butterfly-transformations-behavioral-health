# Butterfly Transformations Behavioral Health

Marketing website for **Butterfly Transformations Behavioral Health**, the private therapy
practice of **Jessica LaComb, LCSW**.

This is a personal project I built for my mother as she launches her own private practice.
The site is her advertising page — it introduces her and the practice, explains the areas of
support she offers, and gives prospective clients a clear path to booking a free consultation.

Live at **https://butterflytransformations.health**

---

## Scope

**This is a static frontend advertising site and nothing more.** There is no backend, no
database, no API, no authentication, and no user data of any kind — the project collects,
stores, and processes nothing. It is strictly a set of public static files (HTML, CSS, JS,
fonts, and images) built by Angular and served from S3 through CloudFront.

Booking and contact are handled by linking out to external services, so no visitor information
ever touches this project. Nothing here is in scope for PHI or client records.

---

## Why I built it this way

I wanted my mom to have a real, professional web presence without a monthly website-builder
subscription or a hosting bill she has to think about. A static site on AWS turns out to be
both the easiest and the cheapest way to do that:

- **Cheap.** The whole thing is a static site in an S3 bucket served through CloudFront. There
  are no servers, containers, or databases to pay for — just storage measured in megabytes and
  bandwidth for a low-traffic landing page. In practice the recurring cost is a few cents a
  month plus the domain registration; most months the AWS spend rounds to nothing.
- **Easy.** The entire stack is one SAM template (`infrastructure/template.yaml`). One
  `sam deploy` creates the bucket, the CloudFront distribution, the Origin Access Control, and
  the bucket policy, and after that every push to `master` builds and ships the site on its own.
  There is nothing to patch, restart, or babysit.
- **Solid.** CloudFront gives her HTTPS, a free ACM certificate, a global CDN, and enough
  headroom that traffic spikes are a non-issue — the same setup a much larger site would use.

If the practice outgrows a single page, the same stack handles it without changes.

---

## What's on the site

A single-page, mobile-first landing page:

| Section | Purpose |
|---|---|
| Hero | Practice name, tagline, and the primary "Schedule a Free Consultation" call to action |
| About | Jessica's background and approach, plus practice highlights (LCSW, telehealth & in-person, confidentiality) |
| Areas of Support | Anxiety & stress, depression, life transitions, trauma & PTSD, relationship & family, self-growth |
| CTA banner | Second conversion point partway down the page |
| Contact | How to get in touch and book |

Design notes: a calm sage/cream palette, Cormorant Garamond for headings with Lato for body
text, smooth-scroll section navigation, and a hamburger menu on small screens.

---

## Tech stack

- **Angular 21** (standalone components, signals) — `butterfly-app/`
- **Tailwind CSS v4** via the PostCSS plugin, with the brand palette defined in `src/styles.css`
- **Vitest** for unit tests
- **Angular service worker** — the app ships as an installable PWA
- **AWS S3 + CloudFront** for hosting, defined as infrastructure-as-code with **AWS SAM**
- **GitHub Actions** for CI and CD, authenticating to AWS via OIDC (no long-lived keys)

---

## Repository layout

```
butterfly-app/          Angular application (the site itself)
  src/app/app.html      The full landing page markup
  src/app/app.ts        Nav state, smooth scrolling, booking/contact links
  src/styles.css        Tailwind import + brand color and font tokens
infrastructure/
  template.yaml         SAM/CloudFormation: S3 bucket, CloudFront, OAC, bucket policy
  samconfig.toml        Stack name, region, domain and ACM certificate parameters
  github-actions-role.json  IAM policy for the deploy role
docs/
  acm-dns-setup.md      Requesting the ACM cert and validating DNS at NameCheap
  aws-cli-sso.md        Logging into AWS locally with SSO
.github/workflows/
  ci.yml                Build check on every PR and push to master
  cd.yml                Deploy to AWS on push to master
```

---

## Local development

Requires Node 22 and npm 11.

```bash
cd butterfly-app
npm install
npm start           # dev server at http://localhost:4200
```

Other commands:

```bash
npm run build       # production build to dist/butterfly-app/browser
npm test            # unit tests (Vitest)
npm run watch       # rebuild on change, development configuration
```

VS Code users can run the default build task (**Run All**), which installs dependencies and
starts the dev server.

---

## Deployment

Pushing to `master` triggers `.github/workflows/cd.yml`, which:

1. Builds the Angular app with the production configuration.
2. Assumes the deploy role in AWS via GitHub OIDC.
3. Runs `sam deploy` against `infrastructure/template.yaml` to create or update the stack
   (`butterfly-transformations` in `us-east-1`).
4. Reads the bucket name and distribution ID from the stack outputs — nothing is hardcoded in
   the workflow.
5. Syncs the build to S3. Hashed assets get a one-year immutable cache; `index.html` is sent
   with `no-cache` so visitors always load the latest shell.
6. Creates a CloudFront invalidation for `/*`.

The S3 bucket stays private; CloudFront reads it through an Origin Access Control. CloudFront
maps 403/404 responses to `/index.html` so client-side routing works if the site grows beyond
one page.

### One-time setup

- `AWS_ROLE_ARN` must be set as a repository secret, pointing at the role described by
  `infrastructure/github-actions-role.json`.
- The ACM certificate must live in `us-east-1` and cover both the apex and `www` hostnames —
  see `docs/acm-dns-setup.md`.

To deploy the infrastructure by hand:

```bash
aws sso login --profile butterfly
cd infrastructure
sam deploy --config-file samconfig.toml
```

---

## Before launch

- `bookingUrl` and `contactUrl` in `butterfly-app/src/app/app.ts` are still placeholders
  (`https://www.google.com`) — point them at the real scheduling and contact destinations.
- The PWA manifest (`butterfly-app/public/manifest.webmanifest`) still uses the generated
  `butterfly-app` name; update it to the practice name.

---

## License

Private project. All practice content, branding, and copy belong to Butterfly Transformations
Behavioral Health.
