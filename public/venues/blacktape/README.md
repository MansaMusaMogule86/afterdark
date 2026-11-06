# Black Tape — venue media

Real Black Tape Club media goes in this folder (ABOVE MIDNIGHT DXB).
Files are picked up automatically once they exist — no code changes needed.
Until a file is supplied, the site renders a designed placeholder
(see `src/lib/asset-manifest.ts` and the internal `/asset_manifest` view).

Expected files:

| File | Purpose | Recommended size |
| --- | --- | --- |
| `black_tape_hero_desktop.webp` | Wide Black Tape room with a strong urban crowd | 2400 × 1350 |
| `black_tape_hero_video.mp4` | Official Black Tape urban reel (plays as the venue hero) | 1080 × 1080 |
| `black_tape_hero_mobile.webp` | Vertical crowd, DJ, or performance image | 1080 × 1440 |
| `black_tape_logo_light.svg` | Black Tape logo for dark backgrounds | vector |
| `black_tape_logo_dark.svg` | Black Tape logo for light backgrounds | vector |
| `black_tape_floorplan.svg` | Seating and table plan (VIP) | vector |
| `black_tape_og.jpg` | Social sharing image | 1200 × 630 |
| `black_tape_gallery_01.webp` … `black_tape_gallery_12.webp` | Gallery images | 1600 × 2000 |

> Note: `black_tape_hero_desktop.webp` currently holds a 1080 × 1080 poster frame
> extracted from the official reel. Replace it with a licensed press image when available.

Wired in: `src/lib/venue-data.ts` (heroDesktop, heroMobile, first gallery item).

Asset rules: real venue media only — owned or properly licensed. Never use
competitor imagery or AI-generated interiors presented as the real venue.
