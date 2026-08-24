// The catalog is data, not code: a new framework or classification rule is a
// JSON edit. That means a typo in a rule's question code, or a missing German
// translation, would not fail until `npm run seed` runs inside the container at
// deploy time — and the server CMD chains with &&, so a bad seed means the pod
// never starts. These checks catch it here instead.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', '..', 'content');
const read = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'));

describe('catalog integrity', () => {
  it('every content file is valid JSON', () => {
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      expect(() => read(f), f).not.toThrow();
    }
  });

  it('frameworks have the fields the seeder maps', () => {
    for (const f of read('frameworks.seed.json')) {
      expect(f.key, JSON.stringify(f)).toBeTruthy();
      expect(f.name, f.key).toBeTruthy();
      expect(typeof f.tier, f.key).toBe('number');
    }
  });

  it('framework keys are unique', () => {
    const keys = read('frameworks.seed.json').map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('lawDetails only describe frameworks that exist', () => {
    const keys = new Set(read('frameworks.seed.json').map((f) => f.key));
    for (const k of Object.keys(read('lawDetails.seed.json'))) expect(keys.has(k), k).toBe(true);
  });

  it('timeline entries are valid dates on known frameworks', () => {
    const keys = new Set(read('frameworks.seed.json').map((f) => f.key));
    for (const e of read('timeline.json')) {
      expect(e.date, e.label).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(e.date)), e.label).toBe(false);
      expect(keys.has(e.frameworkKey), e.frameworkKey).toBe(true);
      expect(e.label, e.date).toBeTruthy();
    }
  });

  describe('classification questionnaire', () => {
    const cl = read('classification.seed.json');
    const codes = new Set(cl.questions.map((q) => q.code));

    it('question codes are unique', () => {
      expect(codes.size).toBe(cl.questions.length);
    });

    it('every rule condition points at a question that exists', () => {
      const walk = (node) => {
        if (!node || typeof node !== 'object') return;
        if (node.q) expect(codes.has(node.q), `rule references unknown question "${node.q}"`).toBe(true);
        for (const key of ['all', 'any']) if (Array.isArray(node[key])) node[key].forEach(walk);
      };
      cl.rules.forEach((r) => walk(r.conditions));
    });

    it('every rule yields a valid risk category', () => {
      const valid = ['prohibited', 'high', 'limited', 'minimal'];
      for (const r of cl.rules) expect(valid, r.explanation).toContain(r.resultRiskCategory);
    });

    it('every question has a German translation', () => {
      const de = read('classification.de.json').questions;
      for (const q of cl.questions) {
        expect(de[q.code], `missing German translation for "${q.code}"`).toBeTruthy();
        expect(de[q.code].prompt, q.code).toBeTruthy();
      }
    });
  });

  it('German law content only covers frameworks that exist', () => {
    const keys = new Set(read('frameworks.seed.json').map((f) => f.key));
    for (const k of Object.keys(read('lawContent.de.json'))) expect(keys.has(k), k).toBe(true);
  });

  it('the AI Act reflects the Digital Omnibus deferral', () => {
    // Guards against a regression to the pre-amendment dates: high-risk
    // obligations moved off 2 August 2026 (Regulation (EU) 2026/1744).
    const dates = read('lawDetails.seed.json').eu_ai_act.keyDates.join(' ');
    expect(dates).toContain('2 December 2027');
    expect(dates).toContain('2 August 2028');
    expect(dates).not.toMatch(/High-risk rules[^.]*apply from 2 August 2026/);

    const codes = new Set(read('classification.seed.json').questions.map((q) => q.code));
    expect(codes.has('generate_csam')).toBe(true);
    expect(codes.has('generate_ncii')).toBe(true);
  });
});
