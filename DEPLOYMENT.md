
# Finantel Deployment Guide

## Prerequisites
- Node.js v20+
- Supabase Account
- Vercel Account

## Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous API key

## Vercel Deployment
1. **Connect Repository**: Link your GitHub/GitLab repo to Vercel.
2. **Configure Project**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**: Add the variables from your `.env` file to the Vercel project settings.
4. **Deploy**: Click "Deploy".

## PWA & SEO
- The `manifest.json` and `robots.txt` are automatically served from the `public` folder.
- Verify SEO meta tags using the "Inspect Element" tool or an SEO checker.

## A/B Testing
- Active tests are defined in `src/contexts/ABTestContext.jsx`.
- Analytics for tests are currently stored in local state but set up to be sent to Supabase.
