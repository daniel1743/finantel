
# Changelog

## [2.0.0] - 2025-11-21

### Added
- **Vercel Deployment**: Added `vercel.json` configuration, headers security, and caching.
- **SEO Engine**: Implemented dynamic meta tags, Open Graph, JSON-LD structured data, and sitemaps.
- **PWA Support**: Added manifest, service worker for offline cache, and install capability.
- **A/B Testing**: Created `ABTestContext` and Dashboard to run and analyze split tests (Hero CTA, etc.).
- **Email Marketing**: Added Newsletter signup, Email Preferences page, and subscription flow.
- **Performance**: Implemented code splitting with `React.lazy` for all routes.
- **Analytics**: Integrated mock analytics for A/B tests and prepared env vars for Vercel Analytics.

### Changed
- **App Structure**: Wrapped application in `ABTestProvider`.
- **Routing**: All routes are now lazy-loaded to improve initial load time (LCP).
- **Security**: Added security headers in `vercel.json`.
