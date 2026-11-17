# Sunny Mist franchise site

A static English-language site for hotel, fitness club and shopping centre operators.

## Publish on GitHub Pages

Extract the archive into the repository root, keeping `index.html`, `styles.css`, `site.js`, and `.nojekyll` together. Commit and push to the repository's default branch. In **Settings → Pages → Build and deployment**, select **Deploy from a branch**, choose that branch and **/ (root)**, then save. All local URLs are relative for compatibility with project sites served under a repository subpath.

## Add the approved graphics

Put the original graphics in `assets/` and enter their filenames in the `artwork` object in `site.js`. The slots are `logo`, `hero`, `resort`, `fitness`, and `prive`. Empty slots display the typographic layout.

## Receive franchise inquiries

Set `franchiseEmail` in `site.js` to the approved public franchise inbox. The form then prepares a message in the visitor's email app. Leave it empty during review to offer a local download. For direct submission and CRM capture, replace the draft handler with an approved hosted form endpoint. GitHub Pages hosts the static frontend.
