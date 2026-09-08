import { Building2, Database, Lock, Share2, Mail } from 'lucide-react';
import { useLangStore } from '@/store/langStore';
import { Banner } from '@/components/ui/Ui';

// One continuous document-style panel (label column + value column, a
// hairline between rows) instead of a grid of separate boxes with empty
// space between them, in the same brand teal used everywhere else.
function FactRow({ icon: Icon, label, children, wide }) {
  return (
    <div className={`mkt-fact-row${wide ? ' wide' : ''}`}>
      <div className="mkt-fact-row-label"><Icon size={15} />{label}</div>
      <div className="mkt-fact-row-value">{children}</div>
    </div>
  );
}

// Draft. Controller identity and the sub-processor list are the real,
// current facts (sourced from rit.services' own imprint and its Art. 28
// GDPR data processing agreements), not placeholders. The rest of this page
// (legal basis per processing activity, full data subject rights procedure,
// retention detail) is still a stub and needs a lawyer's sign off before it
// is treated as a finished GDPR Art. 13 notice.
export default function PrivacyDraft() {
  const lang = useLangStore((s) => s.lang);
  const de = lang === 'de';

  const facts = [
    {
      icon: Building2,
      label: de ? 'Verantwortlicher' : 'Controller',
      wide: true,
      body: de
        ? 'RIT Services GmbH, Am alten Gueterbahnhof 57, 50825 Koeln, vertreten durch Matthias Wessner. Kontakt fuer Datenschutzfragen: info@rit.services.'
        : 'RIT Services GmbH, Am alten Gueterbahnhof 57, 50825 Koeln, Germany, represented by Matthias Wessner. Contact for data protection questions: info@rit.services.',
    },
    {
      icon: Database,
      label: de ? 'Was wir verarbeiten' : 'What we process',
      body: de
        ? 'Kontodaten (Name, E-Mail, Rolle), Organisationsdaten und Ihre Compliance-Inhalte. Rechtsgrundlage: Erfuellung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO).'
        : 'Account data (name, email, role), organisation data, and the compliance content you enter. Legal basis: performance of the service contract (Art. 6(1)(b) GDPR).',
    },
    {
      icon: Lock,
      label: de ? 'Verschluesselung & Ihre Rechte' : 'Encryption & your rights',
      body: de
        ? 'Sensible Inhalte sind mit einem organisationsspezifischen Schluessel verschluesselt. Einsehen, exportieren oder loeschen jederzeit in den Einstellungen (Art. 15, 17, 20 DSGVO).'
        : 'Sensitive content is encrypted with a key unique to your organisation. View, export, or delete it any time from Settings (Art. 15, 17, and 20 GDPR).',
    },
    {
      icon: Share2,
      label: de ? 'Unterauftragsverarbeiter' : 'Sub-processors',
      body: de
        ? 'Hetzner, IONOS und STRATO fuer das Hosting (DE/FI, kein Zugriff auf Inhalte), sowie Resend (USA) fuer transaktionale E-Mails, im Rahmen des EU-US Data Privacy Framework.'
        : 'Hetzner, IONOS and STRATO for hosting (DE/FI, no access to content), and Resend (USA) for transactional email, under the EU-US Data Privacy Framework.',
    },
    {
      icon: Mail,
      label: de ? 'Fragen & Beschwerden' : 'Questions & complaints',
      body: de
        ? 'Bei Fragen oder zur Ausuebung Ihrer Betroffenenrechte wenden Sie sich an info@rit.services. Sie haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehoerde zu beschweren.'
        : 'For questions or to exercise your data subject rights, contact info@rit.services. You also have the right to lodge a complaint with a data protection supervisory authority.',
    },
  ];

  return (
    <div data-testid="marketing-privacy">
      <section className="mkt-section" style={{ paddingTop: 64, paddingBottom: 20 }}>
        <div className="content" style={{ maxWidth: 920 }}>
          <div className="eyebrow">{de ? 'Datenschutz' : 'Privacy'}</div>
          <h1 className="mkt-h1" style={{ fontSize: 36, textAlign: 'left' }}>
            {de ? 'Datenschutzerklaerung' : 'Privacy notice'}
          </h1>
          <div style={{ marginTop: 18, maxWidth: 640 }}>
            <Banner kind="warn">
              {de
                ? 'Entwurf. Dieser Text ist noch nicht rechtlich geprueft und ersetzt keine anwaltliche Beratung.'
                : 'Draft. This text has not been reviewed by a lawyer and is not a finished legal document.'}
            </Banner>
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ paddingTop: 8 }}>
        <div className="content" style={{ maxWidth: 920 }}>
          <div className="card">
            <div className="card-body mkt-facts">
              {facts.map((f) => (
                <FactRow key={f.label} icon={f.icon} label={f.label} wide={f.wide}>{f.body}</FactRow>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
