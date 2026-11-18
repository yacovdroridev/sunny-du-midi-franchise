# Maison Sunny du Midi — multilingual franchise landing pages

Matching English (default), French (`fr/`) and Russian (`ru/`) LTR pages for hospitality operators, fitness clubs, shopping centres and franchise prospects. Plain HTML/CSS/JavaScript, no build step, no runtime framework.

## Intent

INTENT: the existing site was Hebrew-only; the user requested matching English, French and Russian pages, with English as the default and no Hebrew page. The three static pages share CSS, JavaScript and all eight original images. A language selector links every locale without relying on JavaScript; metadata, accessibility text, validation messages and email drafts are localized. Brand claims and contact destinations are preserved without claiming local representation.

## Run and verify

```sh
python -m http.server 8000
# Separate terminal, or let the check start its own temporary server:
uv run --with playwright python -m playwright install chromium
uv run --with playwright python tests/verify.py
# Test the public deployment:
uv run --with playwright python tests/verify.py https://yacovdroridev.github.io/sunny-du-midi-franchise/
```

The focused browser check covers EN/FR/RU LTR metadata, all language-switcher routes, localized validation and email content, all eight images, internal anchors, five viewport widths (320, 390, 768, 1024, 1440), mobile navigation, venue selection, required fields, correctly encoded email draft, downloaded draft, stale draft invalidation and JavaScript errors. Screenshots are saved under `$TMPDIR/sunny-verification` (or the repository if TMPDIR is absent). Playwright is a verification-only dependency provided by `uv`; no package installation is required by the deployed website.

## Contact behavior and privacy

`Info@sunnydumidi.com` and `+1 917 277-8806` are the contact details published in the original site's footer. No previous configured contact destination existed in the repository. The form prepares a mailto link and offers a text download; it does **not** send an inquiry, store data or connect to a CRM. Visitors review and send in their own mail client. The email address is not verified as a dedicated franchise inbox. No live email or phone call is sent during tests. Google Fonts supplies Noto Sans and Cormorant Garamond; system fallbacks are provided.

## Deployment

GitHub Pages deploys `main` at repository root; `.nojekyll` is retained. Push to `main`, verify the Pages build commit/status through the GitHub API, then compare public file hashes against the exact committed revision and run the public browser check. All local asset URLs are relative and compatible with the project subpath.

## Content and assets

See `SOURCES.md` for source URLs, provenance and limitations. No financial results, return forecasts, official local partnership, territory rights, fixed installation dimensions or launch availability are claimed. Images are labelled concept renderings. Commercial terms and product capabilities remain subject to the brand's agreements and validation.
