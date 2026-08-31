// Build-time only. Renders one public marketing route to a static HTML
// string, for scripts/prerender.mjs to inject into the built dist/<route>/
// index.html, so a crawler that never runs JavaScript still sees real
// content in the bytes it fetches (see the geo-content-optimization skill:
// "is the content in the served HTML" is the first thing to check, and this
// SPA previously failed it: the raw response was ~49 words).
//
// None of these pages call an API (confirmed: no useQuery/API import in the
// marketing tree), so this needs no QueryClientProvider and no real backend,
// just a Router context for the <Link>/useLocation calls inside them.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import MarketingLayout from '@/layouts/MarketingLayout';
import Landing from '@/views/marketing/Landing';
import About from '@/views/marketing/About';
import Security from '@/views/marketing/Security';
import PrivacyDraft from '@/views/marketing/PrivacyDraft';
import ImprintDraft from '@/views/marketing/ImprintDraft';

const PAGES = {
  '/': Landing,
  '/welcome': Landing,
  '/about': About,
  '/security': Security,
  '/privacy': PrivacyDraft,
  '/impressum': ImprintDraft,
};

export function renderRoute(routePath) {
  const Page = PAGES[routePath];
  if (!Page) throw new Error(`ssrEntry: no page mapped for "${routePath}"`);
  return renderToString(
    <StaticRouter location={routePath}>
      <MarketingLayout>
        <Page />
      </MarketingLayout>
    </StaticRouter>,
  );
}
