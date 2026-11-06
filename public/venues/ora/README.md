# Ora — venue media

Real Ora Club media goes in this folder (ABOVE MIDNIGHT DXB).
Files are picked up automatically once they exist — no code changes needed.
Until a file is supplied, the site renders a designed placeholder
(see `src/lib/asset-manifest.ts` and the internal `/asset_manifest` view).

Expected files:

| File | Purpose | Recommended size |
| --- | --- | --- |
| `ora_hero_desktop.webp` | Wide Ora room showing its immersive visual identity | 2400 × 1350 |
| `ora_hero_mobile.webp` | Vertical Ora crowd or performance image | 1080 × 1440 |
| `ora_logo_light.svg` | Ora logo for dark backgrounds | vector |
| `ora_logo_dark.svg` | Ora logo for light backgrounds | vector |
| `ora_floorplan.svg` | Seating and table plan (VIP) | vector |
| `ora_og.jpg` | Social sharing image | 1200 × 630 |
| `ora_gallery_01.webp` … `ora_gallery_12.webp` | Gallery images | 1600 × 2000 |

Wired in: `src/lib/venue-data.ts` (heroDesktop, heroMobile, first gallery item).

Asset rules: real venue media only — owned or properly licensed. Never use
competitor imagery or AI-generated interiors presented as the real venue.
