# Zylos Landing

Platform landing page and tenant registration system.

## Purpose

Handles:
- Public landing page
- User authentication
- Tenant registration/onboarding
- Marketing content

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + Shadcn/UI
- **Validation**: Zod
- **Types**: @zylos/shared-types (NPM package)

## Getting Started

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env.local` and configure:
- Supabase URL and anon key
- Next.js configuration

## Deployment

Deployed to Vercel at `zylos.com` (root domain).