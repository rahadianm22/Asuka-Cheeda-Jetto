# DESIGN.md: Website Asuka Jetto

Transcribed from the owner's own direction (2026-09-28). The owner is the author; this file only records it.

## Purpose
A gift from Rahadian to Jetto (Asuka Cheeda Jetto, VTuber with a virtual vet-doctor persona).
Owner's words: "buat seheboh mungkin dan tetap dalam design yg eye catching".

## Identity
- Concept (accepted by the owner): a vet clinic's records. Dark instrument-panel chrome, paper documents for the doctor's file, stamps, JT serial numbers, a WIB clock, paw prints.
- Voice: Jetto's own persona lines, including her emoji and "~". Written copy stays hers.

## Palette
- Lavender `#c1a1cf` / `#dcc4e6` as the single accent; dark `#0c0812` / `#17111f` / `#1f1729`; paper `#ede6ec` with ink `#191221`.
- Semantic only: green and amber for "Bikin Aku Happy" / "Bikin Aku Badmood". Pink `#f2a6c4` belongs to Cipet.

## Typography
- Archivo, stretched to its widest (`wdth` 118 to 125) for loud display text; normal width for reading.
- JetBrains Mono for chart-label text (field names, indexes, metadata).

## Owner decisions
- The "Hasil observasi klinisku" section keeps its original look (dark panel, grid texture, soft rounded pills). Owner request, 2026-09-28. Improved at the owner's request on 2026-09-29: two columns (happy / badmood), a heart and a broken-heart badge, pills tilted like stickers that wiggle on hover, and "Kamu" highlighted as the first thing that makes Jetto happy.
- Text stays at normal website sizes everywhere, including the hero "JETTO" name (max 96px) and its kicker (max 17px): no giant display type, because oversized text can be uncomfortable for some visitors. Section titles about 40px. Owner request, 2026-09-28, reaffirmed 2026-10-01 after briefly trying a giant hero name. The energy comes from motion, interaction and composition, not from type size.

- "Dukung Jetto" has a transparent background (no lavender panel); its two links are dark tiles like the rest of the page. Owner request, 2026-09-28.

- All section titles are left-aligned. Owner request, 2026-09-28. Section variety comes from layout and content, not title alignment.
- All section titles share one size and stay on one line (the size scales down on phones instead of wrapping), each with its "No." index. Owner request, 2026-09-29.
- Cheeda and Cipet pop out over the top of their frames; Cipet is "Peliharaan Jetto". Owner request, 2026-09-29.

- "Website Asuka Jetto" in the top bar is a link back to the top, and a lavender paw button ("Ke atas") hops in near the bottom of the page. Owner request, 2026-09-29.
- All character art and illustrations come from Jetto herself; the footer states that ownership instead of per-artist credits. Owner confirmation, 2026-09-29.
- The 404 page is the clinic's "patient not found" chart, with Cheeda peeking over the corner.
- A 3D Three.js diorama of Jetto's night gaming room, ported from a separate prototype project ("Kamar Main Malam"), lives at its own route `/kamar` rather than inline on the homepage, so the drag-to-orbit canvas never fights the page's own scroll and Three.js only loads for visitors who click through. Linked from a "No. 08" teaser section at the bottom of the homepage with the CTA "Lihat Gaming Room ku". Owner trial, 2026-10-06.
- The diorama's character is Jetto herself as a chibi built from her character sheet (wolf ears and tail, lavender bob with a pointed-strand fringe and big lavender wolf ears, matched to her chibi figure on 2026-10-07, amber/blue heterochromia, fang, white cropped jacket with purple quilted collar, black crop top, white shorts with purple belt, black socks, bandage, pink X clips). The owner drew Jetto and approved the swap. Owner request, 2026-10-07.
- In the diorama a "Main" button swivels Jetto between facing the visitor and facing her monitors; owner-picked Cinnamoroll pictures (public/kamar/cinna-*.png) hang on the walls: the brown-outline one replaces the old drawn decal above the window, the crown one sits right of the window, the standing one above the character sheet, and the teddy one framed above the shelves; a Cinnamoroll gamepad (white shell, sky-blue grips/sticks/buttons, pink face buttons, glowing stick rings, her face in the middle) lies on the desk between the cream pup and the drink; the neon paw sign on the back wall is now six faint (35% opacity) purple paw-print stickers (public/kamar/apple-touch-icon.png) scattered over both walls in mixed sizes and tilts; the poster beside the window shows the meadow artwork (public/kamar/poster-meadow.jpg, frame resized to its 1.46:1 shape); the small white frame on the left wall above the desk now holds the owner's Cinnamoroll polaroid (public/kamar/cinna-polaroid.jpg) instead of the hand-drawn doodle; a die-cut Cipet sticker (public/kamar/cipet.png) sits on the left wall above the monitors and opens in the lightbox like the posters; the round rug shows public/kamar/rug-cinnamoroll.jpg with the big floor cloud moved off it; "Awoo Jetto" (was "Sapa Jetto") makes her wave and say a random line; an "Otsu Jetto" music toggle in the dock plays public/audio/jettobgm.mp3, and the same toggle and audio sit in the homepage top bar. On the homepage it only plays when the visitor presses it. In the room it starts by itself on every visit (or on the visitor's first click, tap or key press, when the browser blocks sound before that) and keeps playing across pages; turning it off holds until the visitor leaves the room; the LED lighting is fixed to one blue (the colour-cycle button was removed); the page title is "Kamar Main Jetto". Owner request, 2026-10-07.
- The diorama drawer lists Jetto's PC specs ("Spek PC") instead of the room contents; scroll or pinch zooms the camera, drifting the aim onto Jetto; "Balik ke website" is a lavender-outlined button in the dock; Jetto is rendered with a finer mesh and soft gradient shading; a small hand-drawn Cinnamoroll doodle hangs on the left wall (canvas-drawn, no official artwork). Owner request, 2026-10-07.
- More Cinnamoroll in the diorama: a line-art wall decal above the window (sitting, hugging a teddy) and the round rug redrawn as a light-blue Cinnamoroll rug (sleeping Cinnamoroll, clouds, stars, little bears, "Cinnamoroll" lettering on the near side). Both are drawn in code in the style of the owner's reference images, not copied from them. Owner request, 2026-10-07.
- Jetto moved closer to her chibi figure (owner chose the free in-code route over an AI image-to-3D model): a painted, figure-style face (big amber/blue anime eyes with lashes and highlights, hatched blush, fanged smirk; a shut-eye version for blinks and cheers), a white vet coat and stethoscope, and a bigger purple tail with pointed fur locks. Owner request, 2026-10-07.

Dial: ENERGY 2 / RHYTHM 3 / MOTION 3
