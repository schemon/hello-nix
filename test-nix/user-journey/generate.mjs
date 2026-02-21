import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const outDir = path.resolve('test-nix/user-journey');
const assetsDir = path.join(outDir, 'assets');
const base = (process.env.BASE_URL || 'https://schemon.github.io/hello-nix/').replace(/\/+$/, '/');

const viewport = { width: 1280, height: 720 };

const steps = [
  {
    id: 'home',
    title: 'Home',
    desc: 'Open the site. This is the starting point.',
    url: base,
    highlight: null,
  },
  {
    id: 'security',
    title: 'Go to Security',
    desc: 'Click **Security** in the menu.',
    url: base,
    highlight: 'nav a[href="security.html"]',
  },
  {
    id: 'auth',
    title: 'Go to Auth',
    desc: 'Click **Auth** in the menu.',
    url: base + 'security.html',
    highlight: 'nav a[href="auth.html"]',
  },
  {
    id: 'frontend',
    title: 'Go to Frontend',
    desc: 'Click **Frontend** in the menu.',
    url: base + 'auth.html',
    highlight: 'nav a[href="frontend.html"]',
  },
  {
    id: 'backend',
    title: 'Go to Backend',
    desc: 'Click **Backend** in the menu.',
    url: base + 'frontend.html',
    highlight: 'nav a[href="backend.html"]',
  },
  {
    id: 'architecture',
    title: 'Go to Architecture',
    desc: 'Click **Architecture** in the menu.',
    url: base + 'backend.html',
    highlight: 'nav a[href="architecture.html"]',
  },
];

function escHtml(s){
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function mdLite(s){
  // tiny: **bold** only
  return escHtml(s).replaceAll(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport });

const results = [];

for (const step of steps) {
  await page.goto(step.url, { waitUntil: 'networkidle' });

  let circle = null;
  if (step.highlight) {
    const loc = page.locator(step.highlight).first();
    await loc.waitFor({ state: 'visible', timeout: 10_000 });
    const box = await loc.boundingBox();
    if (box) {
      // pad to make the circle larger than link
      const pad = 10;
      const x = box.x - pad;
      const y = box.y - pad;
      const w = box.width + pad * 2;
      const h = box.height + pad * 2;
      // convert to circle-ish: use max dim
      const r = Math.max(w, h) / 2;
      circle = { cx: x + w / 2, cy: y + h / 2, r };
    }
  }

  const file = `${step.id}.png`;
  await page.screenshot({ path: path.join(assetsDir, file), fullPage: false });

  results.push({ ...step, file, circle });
}

await browser.close();

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>User journey • hello-nix</title>
  <style>
    :root{ --bg:#000; --fg:#eaeaea; --muted:#9aa0a6; --border:#222; --accent:#ff3b30; }
    *{ box-sizing:border-box; }
    body{ margin:0; background:var(--bg); color:var(--fg); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
    .container{ max-width: 1100px; margin: 0 auto; padding: 26px 16px 60px; }
    header{ border-bottom:1px solid var(--border); padding-bottom:14px; margin-bottom:20px; }
    h1{ margin:0 0 6px; font-size:24px; }
    .sub{ color:var(--muted); font-size:14px; }

    .slide{ padding: 18px 0 26px; border-bottom:1px solid var(--border); }
    .title{ font-size:18px; margin:0 0 8px; }
    .desc{ color: var(--fg); opacity:.9; margin:0 0 12px; line-height:1.5; }

    .shotWrap{ position:relative; display:inline-block; border:1px solid var(--border); background:#050505; }
    .shot{ display:block; width: 100%; height:auto; max-width: 100%; }
    .circle{
      position:absolute;
      border: 3px solid var(--accent);
      border-radius: 999px;
      box-shadow: 0 0 0 4px rgba(255,59,48,.18);
      pointer-events:none;
    }
    .note{ color:var(--muted); font-size:12px; margin-top:8px; }
    .pill{ display:inline-block; font-size:12px; color:var(--muted); border:1px solid var(--border); padding:4px 8px; border-radius:999px; margin-top:10px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>User journey (static)</h1>
      <div class="sub">One interaction per slide. Generated screenshots with click targets circled. Path: <code>/test-nix/user-journey/</code></div>
      <div class="pill">Updated: ${new Date().toISOString()}</div>
    </header>

    ${results.map((s, i) => {
      const circleStyle = s.circle
        ? `left:${(s.circle.cx - s.circle.r).toFixed(1)}px;top:${(s.circle.cy - s.circle.r).toFixed(1)}px;width:${(s.circle.r*2).toFixed(1)}px;height:${(s.circle.r*2).toFixed(1)}px;`
        : '';
      return `
      <section class="slide">
        <div class="title">${i+1}. ${escHtml(s.title)}</div>
        <p class="desc">${mdLite(s.desc)}</p>
        <div class="shotWrap">
          <img class="shot" src="assets/${escHtml(s.file)}" alt="${escHtml(s.title)} screenshot" width="${viewport.width}" height="${viewport.height}" />
          ${s.circle ? `<div class="circle" style="${circleStyle}"></div>` : ''}
        </div>
        <div class="note">URL: <a style="color:#8ab4f8" href="${escHtml(s.url)}" target="_blank" rel="noreferrer">${escHtml(s.url)}</a></div>
      </section>`;
    }).join('\n')}

    <footer style="padding-top:18px; color:var(--muted); font-size:13px;">
      End. /nix
    </footer>
  </div>
</body>
</html>`;

await fs.writeFile(path.join(outDir, 'index.html'), html);
console.log('Wrote', path.join(outDir, 'index.html'));
