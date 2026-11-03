# Avenue — venue media

Real Avenue Club media goes in this folder (ABOVE MIDNIGHT DXB).
Files are picked up automatically once they exist — no code changes needed.
Until a file is supplied, the site renders a designed placeholder
(see `src/lib/asset-manifest.ts` and the internal `/asset_manifest` view).

Expected files:

| File | Purpose | Recommended size |
| --- | --- | --- |
| `avenue_hero_desktop.webp` | Wide Avenue room — crowd, lighting, skyline context | 2400 × 1350 |
| `avenue_hero_mobile.webp` | Vertical Avenue crowd or performer moment | 1080 × 1440 |
| `avenue_logo_light.svg` | Avenue logo for dark backgrounds | vector |
| `avenue_logo_dark.svg` | Avenue logo for light backgrounds | vector |
| `avenue_floorplan.svg` | Seating and table plan (VIP) | vector |
| `avenue_og.jpg` | Social sharing image | 1200 × 630 |
| `avenue_gallery_01.webp` … `avenue_gallery_12.webp` | Gallery images | 1600 × 2000 |

Wired in: `src/lib/venue-data.ts` (heroDesktop, heroMobile, first gallery item).

Asset rules: real venue media only — owned or properly licensed. Never use
competitor imagery or AI-generated interiors presented as the real venue.
