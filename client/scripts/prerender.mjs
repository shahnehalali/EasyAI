// Runs after `vite build` (wired as an npm postbuild script). Prerenders the
// six public marketing routes to static HTML files under dist/, so a crawler
// that never executes JavaScript (most AI answer-engine crawlers: GPTBot,
// ClaudeBot, PerplexityBot, etc., per the geo-content-optimization skill)
// sees real content in the response bytes, not an empty <div id="root">.
//
// Written as flat files (dist/welcome.html), not dist/welcome/index.html:
// nginx treats a real subdirectory as a directory request and issues a 301
// to add the trailing slash before try_files ever runs, which most non-JS
// crawlers either skip or follow to a URL that no longer matches the page's
// own <link rel="canonical">. client/nginx.conf's `try_files $uri $uri.html
// ...` serves the flat file directly instead, no redirect, no extra hop.
//
// Real browsers are unaffected: main.jsx still does a normal client-side
// `ReactDOM.createRoot(...).render(...)`, which replaces the prerendered
// markup with the live, fully interactive app on the same tick React commits
// (no hydration mismatch handling needed since this is a full replace, not
// hydrateRoot). The only user-visible change is a faster first paint.
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://compliance.rit.services';

const PAGES = [
  {
    route: '/',
    outFile: 'index.html',
    title: 'Compliance Check | GDPR and German National Law AI Compliance',
    description: 'GDPR and German national law AI compliance software: 12 EU-wide laws, 16 German national laws and 9 sector rules (37 total), including the EU AI Act, GDPR, BDSG and KI-MIG, as one plain-language checklist. Classify AI systems by risk, document evidence, get reminded before reviews are due.',
    canonical: `${SITE}/`,
    includeFaq: true,
  },
  {
    route: '/welcome',
    outFile: 'welcome.html',
    title: 'Compliance Check | GDPR and German National Law AI Compliance',
    description: 'GDPR and German national law AI compliance software: 12 EU-wide laws, 16 German national laws and 9 sector rules (37 total), including the EU AI Act, GDPR, BDSG and KI-MIG, as one plain-language checklist. Classify AI systems by risk, document evidence, get reminded before reviews are due.',
    // Identical content to "/": canonicalise here rather than duplicate it.
    canonical: `${SITE}/`,
    includeFaq: true,
  },
  {
    route: '/about',
    outFile: 'about.html',
    title: 'About Compliance Check | Built by RIT Services',
    description: 'Compliance Check is built by RIT Services, a software team based in Germany. Why it exists, and how it protects your data.',
    canonical: `${SITE}/about`,
  },
  {
    route: '/security',
    outFile: 'security.html',
    title: 'GDPR Compliance for AI Software | Compliance Check Security',
    description: 'How Compliance Check protects your data under GDPR: AES-256-GCM field encryption per organisation, EU-only hosting, daily encrypted backups, and self-service data rights under Art. 15, 17 and 20 GDPR.',
    canonical: `${SITE}/security`,
  },
  {
    route: '/privacy',
    outFile: 'privacy.html',
    title: 'Privacy Notice (Draft) | Compliance Check',
    description: 'Draft privacy notice for Compliance Check, pending final legal review.',
    canonical: `${SITE}/privacy`,
    // Not legally reviewed yet (visible banner on the page says so): keep it
    // out of search and out of anything an AI engine might cite as final.
    noindex: true,
  },
  {
    route: '/impressum',
    outFile: 'impressum.html',
    title: 'Impressum (Draft) | Compliance Check',
    description: 'Draft Impressum for Compliance Check, pending final legal review.',
    canonical: `${SITE}/impressum`,
    noindex: true,
  },
];

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildJsonLd({ includeFaq, publicFaq }) {
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'RIT Services',
      url: 'https://rit.services',
      logo: `${SITE}/rit-logo.svg`,
      sameAs: ['https://rit.services'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'Compliance Check',
      url: `${SITE}/`,
      publisher: { '@id': `${SITE}/#organization` },
      inLanguage: ['en', 'de'],
    },
  ];
  if (includeFaq && publicFaq?.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${SITE}/welcome/#faq`,
      // English only: schema.org has no clean multi-language pairing, and
      // the visible page still serves both languages via the toggle.
      mainEntity: publicFaq.map((item) => ({
        '@type': 'Question',
        name: item.q.en,
        acceptedAnswer: { '@type': 'Answer', text: item.a.en },
      })),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function headBlockFor(page, jsonLd) {
  const lines = [
    `<meta name="description" content="${escapeAttr(page.description)}">`,
    `<link rel="canonical" href="${page.canonical}">`,
    page.noindex ? '<meta name="robots" content="noindex, follow">' : null,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Compliance Check">`,
    `<meta property="og:title" content="${escapeAttr(page.title)}">`,
    `<meta property="og:description" content="${escapeAttr(page.description)}">`,
    `<meta property="og:url" content="${page.canonical}">`,
    `<meta property="og:image" content="${SITE}/trial.png">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${escapeAttr(page.title)}">`,
    `<meta name="twitter:description" content="${escapeAttr(page.description)}">`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].filter(Boolean);
  return lines.join('\n    ');
}

async function main() {
  const templatePath = path.join(DIST, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`prerender: ${templatePath} not found. Run "vite build" first.`);
  }
  const template = fs.readFileSync(templatePath, 'utf-8');
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('prerender: expected an empty <div id="root"></div> in the built index.html; the build output shape changed, update this script.');
  }

  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  let renderRoute;
  let PUBLIC_FAQ;
  try {
    const entry = await vite.ssrLoadModule('/src/ssrEntry.jsx');
    renderRoute = entry.renderRoute;
    ({ PUBLIC_FAQ } = await vite.ssrLoadModule('/src/data/marketingContent.js'));
  } finally {
    await vite.close();
  }

  for (const page of PAGES) {
    const bodyHtml = renderRoute(page.route);
    const jsonLd = buildJsonLd({ includeFaq: page.includeFaq, publicFaq: PUBLIC_FAQ });
    const head = headBlockFor(page, jsonLd);

    let html = template
      .replace(/<title>.*?<\/title>/s, `<title>${escapeAttr(page.title)}</title>`)
      .replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`)
      .replace('</head>', `    ${head}\n  </head>`);

    const outPath = path.join(DIST, page.outFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf-8');
    const words = bodyHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    console.log(`prerendered ${page.route.padEnd(12)} -> ${page.outFile}  (${words} words)`);
  }
}

main().catch((err) => {
  console.error('prerender failed:', err.stack || err);
  process.exitCode = 1;
});
