# User Journey (walkthrough)

This folder contains a generated, static walkthrough page that documents the click path through the site using screenshots.

## Rule of thumb (so we don’t forget)

**Before deploy / push:**
1. Generate the walkthrough against a *local* build.
2. Take a **full-page screenshot** of the walkthrough.
3. Share/review the screenshot together.
4. Only then push/deploy.

GitHub Pages caching can lag behind, so reviewing a local screenshot avoids false negatives.

## Generate locally

Start a local server from repo root:

```bash
python3 -m http.server 8123 --bind 127.0.0.1
```

Generate walkthrough using the local base URL:

```bash
BASE_URL=http://127.0.0.1:8123/ node test-nix/user-journey/generate.mjs
```

## Full-page screenshot (local)

```bash
npx playwright screenshot --full-page \
  http://127.0.0.1:8123/test-nix/user-journey/ \
  test-nix/user-journey/full-page-local.png
```

## Deployed URL

- https://schemon.github.io/hello-nix/test-nix/user-journey/

/nix
