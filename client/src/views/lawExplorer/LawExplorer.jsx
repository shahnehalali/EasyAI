import { useMemo, useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { lawApi } from '@/apis/lawApi';
import { frameworkApi } from '@/apis/frameworkApi';
import { organizationApi } from '@/apis/organizationApi';
import { assessmentApi } from '@/apis/assessmentApi';
import { useAuth } from '@/hooks/useAuth';
import { useLangStore } from '@/store/langStore';
import { S, tLaw, fnLabel, fnDesc, catLabel } from '@/i18n/lawExplorer';
import { toCsv, downloadText } from '@/utils/download';
import { formatDate } from '@/utils/format';
import { SkeletonPage, ErrorState, Chip, Banner } from '@/components/ui/Ui';

const TIER_CHIP = { 1: 'chip-navy', 2: 'chip-gold', 3: 'chip-grey' };
const TIER_NAME = { 1: 'EU law', 2: 'German national', 3: 'Sector-specific' };

function suggestFromOrg(org, functions) {
  const sel = new Set();
  const ind = (org?.industry || '').toLowerCase();
  if (/financ|bank|payment|fintech/.test(ind)) sel.add('financial_services');
  if (/insur/.test(ind)) sel.add('insurance');
  if (/health|medic|pharma|care/.test(ind)) sel.add('medical_ai');
  if (/public|government|govt|authorit/.test(ind)) sel.add('public_sector');
  if (/media|platform|social|market/.test(ind)) sel.add('online_platform');
  if (org?.sizeBand === '50-249' || org?.sizeBand === '250+') sel.add('fifty_plus_staff');
  return [...sel].filter((k) => functions.some((f) => f.key === k));
}

export default function LawExplorer() {
  const qc = useQueryClient();
  const { can } = useAuth();
  const lang = useLangStore((s) => s.lang);
  const t = S[lang] || S.en;

  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['laws'], queryFn: lawApi.explorer });
  const { data: org } = useQuery({ queryKey: ['organization'], queryFn: organizationApi.current });
  const { data: assessments = [], refetch: refetchAssessments } = useQuery({ queryKey: ['assessments'], queryFn: assessmentApi.list });

  const [selectedFns, setSelectedFns] = useState([]);
  const [search, setSearch] = useState('');
  const [openKey, setOpenKey] = useState(null);
  const [bulkMsg, setBulkMsg] = useState('');
  const [jurisdiction, setJurisdiction] = useState('all');
  const [category, setCategory] = useState('all');
  const [onlyChecklist, setOnlyChecklist] = useState(false);
  const [wizardStep, setWizardStep] = useState(-1); // -1 = closed
  const [describe, setDescribe] = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState('');
  const initedRef = useRef(false);

  useEffect(() => {
    if (initedRef.current || !data || !org) return;
    initedRef.current = true;
    const saved = Array.isArray(org.selectedFunctions) ? org.selectedFunctions : null;
    setSelectedFns(saved && saved.length ? saved : suggestFromOrg(org, data.functions));
  }, [data, org]);

  const applicableKeys = useMemo(() => {
    if (!data || selectedFns.length === 0) return null;
    const set = new Set();
    data.functions.filter((f) => selectedFns.includes(f.key)).forEach((f) => f.frameworks.forEach((k) => set.add(k)));
    return set;
  }, [data, selectedFns]);

  const whyByFramework = useMemo(() => {
    const m = {};
    if (!data) return m;
    data.functions.filter((f) => selectedFns.includes(f.key)).forEach((f) => {
      f.frameworks.forEach((k) => { (m[k] = m[k] || []).push(fnLabel(f, lang)); });
    });
    return m;
  }, [data, selectedFns, lang]);

  const startedKeys = useMemo(
    () => new Set((assessments || []).map((a) => a.framework?.key).filter(Boolean)),
    [assessments],
  );

  if (isLoading) return <SkeletonPage rows={4} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const persist = (next) => { organizationApi.updateFunctions(next).then(() => qc.invalidateQueries({ queryKey: ['organization'] })).catch(() => {}); };
  const setAndPersist = (next) => { setSelectedFns(next); persist(next); };
  const toggleFn = (key) => setAndPersist(selectedFns.includes(key) ? selectedFns.filter((k) => k !== key) : [...selectedFns, key]);
  const clearFns = () => setAndPersist([]);

  const exportLaws = () => {
    const list = applicableKeys ? data.frameworks.filter((f) => applicableKeys.has(f.key)) : data.frameworks;
    const headers = ['Law', 'Tier', 'Reference', 'Regulator', 'Who must comply', 'Source'];
    const rows = list.map((f) => { const L = tLaw(f, lang); return [L.name, `Tier ${f.tier}`, f.reference || '', L.regulator || '', L.appliesTo || '', f.lawReferenceUrl || '']; });
    downloadText(applicableKeys ? 'applicable-laws.csv' : 'germany-ai-laws.csv', toCsv(headers, rows));
  };

  const startApplicable = async () => {
    if (!applicableKeys) return;
    setBulkMsg(t.analysing);
    const res = await assessmentApi.startFrameworks([...applicableKeys]);
    setBulkMsg(res.created > 0 ? `Started ${res.created} new checklist(s). You can find them under Assessments.` : 'You have already started checklists for your applicable laws.');
    qc.invalidateQueries({ queryKey: ['assessments'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    refetchAssessments();
  };

  const runAnalyze = async () => {
    if (!describe.trim()) return;
    setAnalysing(true); setAnalyzeMsg('');
    try {
      const res = await lawApi.analyze(describe.trim());
      const merged = [...new Set([...selectedFns, ...(res.functions || [])])];
      setAndPersist(merged);
      setAnalyzeMsg(`Matched ${res.functions?.length || 0} area(s) of your business.`);
    } catch { setAnalyzeMsg('Could not analyse that text.'); } finally { setAnalysing(false); }
  };

  const prettyCat = (c) => (c || '').replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  const allCategories = [...new Set(data.frameworks.map((f) => f.category).filter(Boolean))].sort();

  const matchesFilters = (f) => {
    const q = search.toLowerCase();
    const L = tLaw(f, lang);
    const searchOk = !q || [f.name, f.shortName, f.regulator, f.reference, L.name].some((v) => (v || '').toLowerCase().includes(q));
    const jurOk = jurisdiction === 'all' || f.jurisdiction === jurisdiction;
    const catOk = category === 'all' || f.category === category;
    const checklistOk = !onlyChecklist || f.hasChecklist;
    return searchOk && jurOk && catOk && checklistOk;
  };
  const filtersActive = search || jurisdiction !== 'all' || category !== 'all' || onlyChecklist;
  const byTier = (tier) => data.frameworks.filter((f) => f.tier === tier && matchesFilters(f));
  const matchedCount = data.frameworks.filter(matchesFilters).length;
  const isApplicable = (key) => applicableKeys && applicableKeys.has(key);
  const fwByKey = Object.fromEntries([...data.frameworks, ...(data.watchlist || [])].map((f) => [f.key, f]));
  const openFramework = fwByKey[openKey];
  const applicableList = applicableKeys ? [...applicableKeys] : [];
  const startedCount = applicableList.filter((k) => startedKeys.has(k)).length;

  const categories = data.categories && data.categories.length ? data.categories : [{ key: 'all', label: 'What your company does' }];
  const fnsInCategory = (catKey) => data.functions.filter((f) => (f.category || 'all') === catKey);

  const today = new Date();
  const timeline = (data.timeline || []).map((x) => ({ ...x, past: new Date(x.date) < today })).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div data-testid="law-explorer">
      <div className="page-head">
        <div>
          <div className="eyebrow">{t.eyebrow}</div>
          <h1>{t.title}</h1>
          <p className="sub">{t.sub}</p>
        </div>
      </div>

      {/* Does this apply to me */}
      <div className="card ruled" style={{ marginBottom: 20 }} data-testid="applicability">
        <div className="card-body">
          <div className="row-between" style={{ marginBottom: 4 }}>
            <h3>{t.doesApply}</h3>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-outline btn-sm" data-testid="wizard-open" onClick={() => setWizardStep(0)}>{t.guidedSetup}</button>
              {selectedFns.length > 0 && <button className="btn btn-ghost btn-sm" data-testid="clear-functions" onClick={clearFns}>{t.clearSelection}</button>}
            </div>
          </div>
          <p className="muted small" style={{ marginTop: 0, marginBottom: 14 }}>{t.doesApplyHint}</p>

          <div className="stack" style={{ gap: 14 }}>
            {categories.map((cat) => {
              const fns = fnsInCategory(cat.key);
              if (!fns.length) return null;
              return (
                <div key={cat.key}>
                  <div className="card-title-eyebrow" style={{ marginBottom: 7 }}>{catLabel(cat, lang)}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {fns.map((f) => {
                      const on = selectedFns.includes(f.key);
                      return (
                        <button key={f.key} data-testid={`fn-${f.key}`} title={fnDesc(f, lang)} onClick={() => toggleFn(f.key)}
                          className="btn btn-sm" style={{ background: on ? 'var(--accent)' : 'var(--surface)', color: on ? '#fff' : 'var(--ink)', border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}` }}>
                          {on ? '✓ ' : ''}{fnLabel(f, lang)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Natural-language describe */}
          <div style={{ marginTop: 16, borderTop: '1px solid var(--border-2)', paddingTop: 14 }}>
            <div className="card-title-eyebrow" style={{ marginBottom: 6 }}>{t.describePrompt}</div>
            <div className="row" style={{ gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <textarea className="textarea" data-testid="describe-input" style={{ flex: 1, minWidth: 260, minHeight: 64 }}
                placeholder={t.describePlaceholder} value={describe} onChange={(e) => setDescribe(e.target.value)} />
              <button className="btn btn-outline btn-sm" data-testid="find-laws" onClick={runAnalyze} disabled={analysing || !describe.trim()}>
                {analysing ? t.analysing : t.findMyLaws}
              </button>
            </div>
            {analyzeMsg && <div className="small muted" data-testid="analyze-msg" style={{ marginTop: 6 }}>{analyzeMsg}</div>}
          </div>

          {applicableKeys && (
            <div data-testid="applicability-result" style={{ marginTop: 16 }}>
              <Banner kind="info">
                {t.resultA} <strong>{applicableKeys.size}</strong> {t.resultB} <strong data-testid="coverage-count">{startedCount}</strong> {t.resultC} {t.notLegalAdvice}
              </Banner>
              {can('compliance.edit') && (
                <div className="row" style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-sm" data-testid="start-applicable" onClick={startApplicable}>{t.startApplicable}</button>
                  {bulkMsg && <span className="small" data-testid="bulk-msg" style={{ color: 'var(--green)' }}>{bulkMsg}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }} data-testid="law-filters">
        <div className="card-body" style={{ padding: '12px 16px' }}>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input className="input" style={{ maxWidth: 260, flex: 1, minWidth: 180 }} placeholder={t.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} data-testid="law-search" />
            <select className="select" style={{ width: 150 }} data-testid="filter-jurisdiction" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>
              <option value="all">{t.allJurisdictions}</option>
              <option value="EU">{t.euLaw}</option>
              <option value="DE">{t.germanLaw}</option>
            </select>
            <select className="select" style={{ width: 170 }} data-testid="filter-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">{t.allTopics}</option>
              {allCategories.map((c) => <option key={c} value={c}>{prettyCat(c)}</option>)}
            </select>
            <label className="row small" style={{ gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" data-testid="filter-haschecklist" checked={onlyChecklist} onChange={(e) => setOnlyChecklist(e.target.checked)} />
              {t.hasChecklist}
            </label>
            {filtersActive && <button className="btn btn-ghost btn-sm" data-testid="clear-filters" onClick={() => { setSearch(''); setJurisdiction('all'); setCategory('all'); setOnlyChecklist(false); }}>{t.clearFilters}</button>}
            <span className="spacer" />
            <span className="muted small" data-testid="law-count">{t.lawsCount(matchedCount, data.frameworks.length)}</span>
            <button className="btn btn-outline btn-sm" data-testid="export-laws" onClick={exportLaws}>{applicableKeys ? t.exportApplicable : t.exportAll}</button>
          </div>
        </div>
      </div>

      {[1, 2, 3].map((tier) => {
        const items = byTier(tier);
        if (items.length === 0) return null;
        return (
          <section key={tier} style={{ marginBottom: 26 }}>
            <div className="row" style={{ gap: 10, marginBottom: 12 }}>
              <Chip className={TIER_CHIP[tier]} dot={false}><span className="tier-tag">Tier {tier}</span></Chip>
              <h2 style={{ fontSize: 17 }}>{TIER_NAME[tier]}</h2>
              <span className="muted small">{tier === 1 ? t.appliesDirectly : tier === 2 ? t.generalGerman : t.sectorOnly}</span>
            </div>
            <div className="grid grid-3">
              {items.map((f) => {
                const L = tLaw(f, lang);
                const highlighted = isApplicable(f.key);
                const dimmed = applicableKeys && !highlighted;
                const started = startedKeys.has(f.key);
                return (
                  <button key={f.key} data-testid={`law-card-${f.key}`} onClick={() => setOpenKey(f.key)}
                    className="card" style={{ textAlign: 'left', cursor: 'pointer', padding: 0, position: 'relative', opacity: dimmed ? 0.55 : 1, borderColor: highlighted ? 'var(--accent)' : undefined, boxShadow: highlighted ? '0 0 0 3px var(--accent-soft)' : undefined }}>
                    <div className="card-body" style={{ padding: 15 }}>
                      <div className="row-between" style={{ marginBottom: 6 }}>
                        <strong style={{ color: 'var(--navy)' }}>{f.shortName || L.name}</strong>
                        {highlighted && <Chip className="chip-gold" dot={false}>{t.likelyApplies}</Chip>}
                      </div>
                      <div className="muted small" style={{ marginBottom: 8 }}>{f.reference}</div>
                      <p className="small" style={{ margin: 0, color: 'var(--ink-soft)' }}>
                        {(L.shortDescription || '').slice(0, 110)}{(L.shortDescription || '').length > 110 ? '...' : ''}
                      </p>
                      {highlighted && <div style={{ marginTop: 9 }}><Chip className={started ? 'chip-green' : 'chip-grey'}>{started ? t.checklistStarted : t.notStarted}</Chip></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {matchedCount === 0 && (
        <div className="card" data-testid="no-matches"><div className="empty">
          <div className="big">∅</div>
          <h3 style={{ marginBottom: 6 }}>{t.noMatches}</h3>
          <p className="muted">{t.noMatchesHint}</p>
        </div></div>
      )}

      {(data.watchlist || []).length > 0 && !filtersActive && (
        <section style={{ marginBottom: 26 }} data-testid="watchlist">
          <div className="row" style={{ gap: 10, marginBottom: 12 }}>
            <Chip className="chip-amber" dot={false}><span className="tier-tag">{t.watchTag}</span></Chip>
            <h2 style={{ fontSize: 17 }}>{t.watchTitle}</h2>
            <span className="muted small">{t.watchHint}</span>
          </div>
          <div className="grid grid-3">
            {data.watchlist.map((f) => { const L = tLaw(f, lang); return (
              <button key={f.key} data-testid={`watch-card-${f.key}`} onClick={() => setOpenKey(f.key)} className="card" style={{ textAlign: 'left', cursor: 'pointer', padding: 0, borderStyle: 'dashed' }}>
                <div className="card-body" style={{ padding: 15 }}>
                  <div className="row-between" style={{ marginBottom: 6 }}>
                    <strong style={{ color: 'var(--ink)' }}>{f.shortName || L.name}</strong>
                    <Chip className="chip-amber" dot={false}>{t.inDevelopment}</Chip>
                  </div>
                  <p className="small" style={{ margin: 0, color: 'var(--ink-soft)' }}>{(L.shortDescription || '').slice(0, 120)}</p>
                </div>
              </button>
            ); })}
          </div>
        </section>
      )}

      {timeline.length > 0 && !filtersActive && (
        <section style={{ marginBottom: 10 }} data-testid="timeline">
          <div className="row" style={{ gap: 10, marginBottom: 12 }}>
            <Chip className="chip-navy" dot={false}><span className="tier-tag">{t.timelineTag}</span></Chip>
            <h2 style={{ fontSize: 17 }}>{t.timelineTitle}</h2>
          </div>
          <div className="card"><div className="card-body">
            <div className="stack" style={{ gap: 0 }}>
              {timeline.map((x, i) => { const fw = fwByKey[x.frameworkKey]; return (
                <div key={i} data-testid="timeline-item" className="row" style={{ gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < timeline.length - 1 ? '1px solid var(--border-2)' : 'none', opacity: x.past ? 0.55 : 1 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 4, background: x.past ? 'var(--muted)' : 'var(--accent)', flexShrink: 0 }} />
                  <div style={{ width: 130, flexShrink: 0 }} className="small">
                    <strong>{formatDate(x.date)}</strong>
                    <div><Chip className={x.past ? 'chip-grey' : 'chip-green'}>{x.past ? t.done : t.upcoming}</Chip></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="small">{x.label}</div>
                    {fw && <button className="link-row" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--accent-ink)' }} onClick={() => setOpenKey(x.frameworkKey)}>{fw.shortName || tLaw(fw, lang).name}</button>}
                  </div>
                </div>
              ); })}
            </div>
          </div></div>
        </section>
      )}

      {wizardStep >= 0 && (
        <Wizard t={t} lang={lang} categories={categories} fnsInCategory={fnsInCategory} selectedFns={selectedFns}
          toggleFn={toggleFn} step={wizardStep} setStep={setWizardStep} applicableKeys={applicableKeys}
          frameworks={data.frameworks} fwByKey={fwByKey} canEdit={can('compliance.edit')} onStartAll={startApplicable}
          onClose={() => setWizardStep(-1)} onOpenLaw={(k) => { setWizardStep(-1); setOpenKey(k); }} />
      )}

      {openFramework && (
        <LawDrawer framework={tLaw(openFramework, lang)} rawKey={openFramework.key} t={t} why={whyByFramework[openFramework.key] || []}
          started={startedKeys.has(openFramework.key)} related={(data.relations || {})[openFramework.key] || []}
          fwByKey={fwByKey} lang={lang} onOpen={setOpenKey} onClose={() => setOpenKey(null)} />
      )}
    </div>
  );
}

function Wizard({ t, lang, categories, fnsInCategory, selectedFns, toggleFn, step, setStep, applicableKeys, frameworks, fwByKey, canEdit, onStartAll, onClose, onOpenLaw }) {
  const cats = categories.filter((c) => fnsInCategory(c.key).length);
  const isResult = step >= cats.length;
  const cat = cats[step];
  const applicable = applicableKeys ? frameworks.filter((f) => applicableKeys.has(f.key)) : [];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.45)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div data-testid="wizard" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ width: 'min(640px,100%)', maxHeight: '88vh', overflowY: 'auto', background: 'var(--surface)', borderRadius: 16, boxShadow: 'var(--shadow-pop)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }} className="row-between">
          <div>
            <div className="card-title-eyebrow">{isResult ? t.wizardTitle : t.wizardStep(step + 1, cats.length)}</div>
            <h2 style={{ marginTop: 2 }}>{isResult ? t.wizardResultTitle : catLabel(cat, lang)}</h2>
          </div>
          <button className="btn btn-ghost btn-sm" data-testid="wizard-close" onClick={onClose}>{t.close} ✕</button>
        </div>
        <div style={{ padding: 24 }}>
          {!isResult ? (
            <>
              {step === 0 && <p className="muted small" style={{ marginTop: 0 }}>{t.wizardIntro}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {fnsInCategory(cat.key).map((f) => {
                  const on = selectedFns.includes(f.key);
                  return (
                    <button key={f.key} data-testid={`wiz-fn-${f.key}`} onClick={() => toggleFn(f.key)} className="btn btn-sm"
                      style={{ background: on ? 'var(--accent)' : 'var(--surface)', color: on ? '#fff' : 'var(--ink)', border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}` }}>
                      {on ? '✓ ' : ''}{fnLabel(f, lang)}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div data-testid="wizard-result">
              <p style={{ marginTop: 0 }}>{t.wizardResultLead(applicable.length)}</p>
              <div className="stack" style={{ gap: 6, marginBottom: 14 }}>
                {applicable.map((f) => (
                  <button key={f.key} className="row-between" data-testid={`wiz-result-${f.key}`} onClick={() => onOpenLaw(f.key)}
                    style={{ textAlign: 'left', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
                    <span><strong>{f.shortName || tLaw(f, lang).name}</strong> <span className="muted small">{f.reference}</span></span>
                    <Chip className={TIER_CHIP[f.tier]} dot={false}>Tier {f.tier}</Chip>
                  </button>
                ))}
              </div>
              {canEdit && applicable.length > 0 && (
                <button className="btn btn-primary" data-testid="wizard-start-all" onClick={() => { onStartAll(); onClose(); }}>{t.startAll}</button>
              )}
            </div>
          )}
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)' }} className="row-between">
          <button className="btn btn-ghost btn-sm" data-testid="wizard-back" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))}>{t.back}</button>
          {!isResult
            ? <button className="btn btn-primary btn-sm" data-testid="wizard-next" onClick={() => setStep(step + 1)}>{step === cats.length - 1 ? t.finish : t.next}</button>
            : <button className="btn btn-outline btn-sm" data-testid="wizard-done" onClick={onClose}>{t.close}</button>}
        </div>
      </div>
    </div>
  );
}

function LawDrawer({ framework, rawKey, t, why = [], started = false, related = [], fwByKey = {}, lang, onOpen, onClose }) {
  const { data: full } = useQuery({ queryKey: ['framework', rawKey], queryFn: () => frameworkApi.getByKey(rawKey) });
  const hasChecklist = (full?.templates?.length || 0) > 0;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.38)', backdropFilter: 'blur(2px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div data-testid="law-drawer" role="dialog" aria-modal="true" aria-label={framework.name} onClick={(e) => e.stopPropagation()} style={{ width: 'min(520px, 100%)', background: 'var(--surface)', height: '100%', overflowY: 'auto', boxShadow: '-12px 0 40px rgba(16,24,40,0.18)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)', position: 'sticky', top: 0, background: 'var(--surface)' }}>
          <div className="row-between">
            <Chip className={TIER_CHIP[framework.tier]} dot={false}><span className="tier-tag">Tier {framework.tier} - {TIER_NAME[framework.tier]}</span></Chip>
            <button className="btn btn-ghost btn-sm" onClick={onClose} data-testid="drawer-close">{t.close} ✕</button>
          </div>
          <h2 style={{ marginTop: 10 }}>{framework.name}</h2>
          <div className="muted small">{framework.reference}</div>
        </div>
        <div style={{ padding: 24 }} className="stack">
          {why.length > 0 && (
            <div data-testid="drawer-why" style={{ border: '1px solid var(--border)', background: 'var(--accent-soft)', borderRadius: 10, padding: '11px 13px' }}>
              <div className="card-title-eyebrow" style={{ color: 'var(--accent-ink)' }}>{t.whyApplies}</div>
              <p className="small" style={{ margin: '2px 0 0', color: 'var(--ink)' }}>{t.youSelected}: {why.join(', ')}.</p>
              <div style={{ marginTop: 8 }}><Chip className={started ? 'chip-green' : 'chip-grey'}>{started ? t.checklistStarted : t.notStartedYet}</Chip></div>
            </div>
          )}
          <Section title={t.inPlainTerms}>{framework.shortDescription}</Section>
          <BulletSection title={t.whatToDo} items={framework.whatYouMustDo} testid="drawer-what-to-do" highlight />
          <Section title={t.whoComply}>{framework.appliesTo}</Section>
          <BulletSection title={t.keyDates} items={framework.keyDates} testid="drawer-key-dates" />
          {framework.penalties && (
            <div data-testid="drawer-penalties" style={{ border: '1px solid #f0cfcb', background: 'var(--red-bg)', borderRadius: 10, padding: '11px 13px' }}>
              <div className="card-title-eyebrow" style={{ color: 'var(--red)' }}>{t.penalties}</div>
              <p className="small" style={{ margin: 0, color: 'var(--ink)' }}>{framework.penalties}</p>
            </div>
          )}
          <Section title={t.whoEnforces}>{framework.regulator}</Section>
          <Section title={t.keySections}>{framework.keySections}</Section>
          {related.length > 0 && (
            <div data-testid="drawer-related">
              <div className="card-title-eyebrow">{t.relatedLaws}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {related.map((k) => fwByKey[k] && (
                  <button key={k} className="tag-pill" data-testid={`related-${k}`} style={{ cursor: 'pointer' }} onClick={() => onOpen && onOpen(k)}>
                    {fwByKey[k].shortName || tLaw(fwByKey[k], lang).name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="divider" />
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            {hasChecklist && <Link className="btn btn-primary btn-sm" to={`/frameworks/${rawKey}`} data-testid="drawer-start-checklist">{t.openChecklist}</Link>}
            {framework.lawReferenceUrl && <a className="btn btn-outline btn-sm" href={framework.lawReferenceUrl} target="_blank" rel="noreferrer">{t.readOfficial} ↗</a>}
          </div>
          <p className="muted" style={{ fontSize: 11, marginTop: 4 }}>
            {framework.lastReviewedAt ? t.reviewedOn(formatDate(framework.lastReviewedAt)) : ''}{t.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  if (!children) return null;
  return (<div><div className="card-title-eyebrow">{title}</div><p style={{ margin: 0 }}>{children}</p></div>);
}

function BulletSection({ title, items, testid, highlight }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div data-testid={testid} style={highlight ? { background: 'var(--accent-soft)', borderRadius: 10, padding: '12px 14px' } : undefined}>
      <div className="card-title-eyebrow" style={highlight ? { color: 'var(--accent-ink)' } : undefined}>{title}</div>
      <ul style={{ margin: '5px 0 0', paddingLeft: 18 }}>
        {items.map((it, i) => <li key={i} style={{ marginBottom: 5, fontSize: 13.5, lineHeight: 1.45 }}>{it}</li>)}
      </ul>
    </div>
  );
}
