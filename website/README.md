# Lunara Fit — Marketing Website

Marketing site for Lunara Fit, built with Next.js (App Router), TypeScript
and Tailwind CSS v4. The visual style — colors, type, radii, card and button
treatments — is pulled from the app's own design tokens in
`../constants/theme.ts` so the site reads as a natural extension of the app.

## Structure

```
app/
  page.tsx                    Home
  features/page.tsx           Features
  privacy/page.tsx            Privacy & Data Security (plain-language)
  about/page.tsx               About / Team
  faq/page.tsx                 FAQ
  pricing/page.tsx             Pricing
  contact/page.tsx             Contact
  blog/page.tsx                 Blog landing (placeholder posts)
  legal/terms/page.tsx          Terms of Service (placeholder legal text)
  legal/privacy-policy/page.tsx Privacy Policy (placeholder legal text)
components/                    Shared Header, Footer, Button, PhoneFrame, etc.
```

## Editable placeholder content

These are written as realistic copy, not lorem ipsum, but are explicitly
marked in the code as needing real content before launch:

- `app/about/page.tsx` — founder bios and portrait images (`PortraitPlaceholder`)
- `app/pricing/page.tsx` — tier pricing and feature lists
- `app/legal/terms/page.tsx`, `app/legal/privacy-policy/page.tsx` — full legal
  text, needs review by counsel
- `app/blog/page.tsx` — dummy post cards
- Every `PhoneFrame` — screenshot placeholders; swap `children` for a real
  `<Image>` of an app screenshot
- `components/StoreBadges.tsx` — App Store / Google Play links point to `#`
  until the app is published

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm run start
```

## Deploy

This is a standard Next.js app — deploy to Vercel, Netlify, or any Node
host. No backend/API is required; the contact form is front-end only
(see `components/ContactForm.tsx`) until a real submission endpoint exists.
