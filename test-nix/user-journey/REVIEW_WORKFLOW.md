# User Journey review + deploy workflow

Treat the user-journey walkthrough as a **separate mini-app**.

Goal: avoid broken deploys and avoid being fooled by GitHub Pages caching.

## Canonical workflow

### 0) Make changes
- Edit the site (or the generator) as needed.

### 1) Generate locally (approval artifact)
- Run local server
- Generate the walkthrough with **local absolute URLs** (expected)
- Take a **full-page screenshot** of the walkthrough
- Share that screenshot with Simon

**This is the approval checkpoint.**

### 2) Simon approves the local preview
- Simon says “OK/Deploy” on the local screenshot.

### 3) Generate for production
- Regenerate the walkthrough with **production BASE_URL** (absolute `https://…` URLs)
- Take a full-page screenshot again (optional but recommended)

### 4) Deploy
- Commit + push the updated `test-nix/user-journey/*`

### 5) Post-deploy verification
- Open the deployed URL and sanity check:
  - number of steps
  - screenshots load
  - rings align
  - URLs are production

### 6) If something is wrong
- Roll back by reverting to the previous commit and pushing again.

## Commands (examples)

Local preview:
```bash
python3 -m http.server 8123 --bind 127.0.0.1
BASE_URL=http://127.0.0.1:8123/ node test-nix/user-journey/generate.mjs
npx playwright screenshot --full-page \
  http://127.0.0.1:8123/test-nix/user-journey/ \
  test-nix/user-journey/preview-local.png
```

Production generation:
```bash
BASE_URL=https://schemon.github.io/hello-nix/ node test-nix/user-journey/generate.mjs
```

/nix
