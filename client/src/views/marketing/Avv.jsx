import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLangStore } from '@/store/langStore';
import { highlightTerms } from '@/utils/highlightTerms';

const LAST_REVIEWED = { en: '7 September 2026', de: '7. September 2026' };
// Public, unauthenticated, versioned template: the same file every visitor
// gets, whether or not they have an account. The signed, organisation-
// specific copy lives behind auth at /api/organizations/current/avv/pdf,
// linked from Settings instead.
const AVV_PDF_URL = '/api/dpa/versions/1.0.pdf';

export default function Avv() {
  const lang = useLangStore((s) => s.lang);
  const de = lang === 'de';

  return (
    <div data-testid="marketing-avv">
      <section className="mkt-section" style={{ paddingTop: 64, paddingBottom: 20 }}>
        <div className="content" style={{ maxWidth: 760 }}>
          <div className="eyebrow">{de ? 'Rechtliches' : 'Legal'}</div>
          <h1 className="mkt-h1" style={{ fontSize: 36, textAlign: 'left' }}>
            {de ? 'Auftragsverarbeitungsvertrag (AVV)' : 'Data Processing Agreement (AVV)'}
          </h1>
          <p className="mkt-lead" style={{ textAlign: 'left', margin: '16px 0 0' }}>
            {de
              ? highlightTerms('Dieser Vertrag nach Art. 28 DSGVO regelt, wie RIT Services personenbezogene Daten im Auftrag Ihres Unternehmens verarbeitet, wenn Sie Compliance Check nutzen. Er wird automatisch bei der Registrierung geschlossen, Sie muessen nichts gesondert unterschreiben. Nach der Anmeldung finden Sie Ihre eigene, unterzeichnete Fassung jederzeit zum Download in den Einstellungen.')
              : highlightTerms('This Art. 28 GDPR contract sets out how RIT Services processes personal data on your company\'s behalf when you use Compliance Check. It is concluded automatically during registration, there is nothing separate to sign. Once you have an account, your own signed copy is always downloadable from Settings.')}
          </p>
          <p className="muted small" style={{ marginTop: 12 }} data-testid="avv-last-reviewed">
            {de ? 'Stand' : 'Last reviewed'}: {LAST_REVIEWED[lang]}
          </p>
        </div>
      </section>

      <section className="mkt-section" style={{ paddingTop: 8 }}>
        <div className="content" style={{ maxWidth: 760 }}>
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginTop: 0 }}>{de ? 'Was dieser Vertrag regelt' : 'What this contract covers'}</h3>
              <ul className="mkt-row-points" style={{ marginTop: 12 }}>
                <li><span>{de ? 'Gegenstand, Dauer, Art und Zweck der Verarbeitung Ihrer Compliance-Daten' : 'The subject, duration, nature and purpose of processing your compliance data'}</span></li>
                <li><span>{de ? 'Weisungsbindung: RIT verarbeitet Daten nur nach Ihren dokumentierten Weisungen' : 'Instruction-bound processing: RIT only processes data on your documented instructions'}</span></li>
                <li><span>{highlightTerms(de ? 'Technische und organisatorische Massnahmen nach Art. 32 DSGVO' : 'Technical and organisational measures under Art. 32 GDPR')}</span></li>
                <li><span>{de ? 'Unterstuetzung bei Betroffenenrechten und bei Datenschutzverletzungen' : 'Support with data subject rights and personal data breaches'}</span></li>
                <li><span>{de ? 'Loeschung und Rueckgabe Ihrer Daten nach Vertragsende' : 'Deletion and return of your data once processing ends'}</span></li>
                <li><span>{de ? 'Die vollstaendige, namentliche Liste der Unterauftragsverarbeiter, mit Anschrift und Aufgabe je Anlage 3' : 'The complete, named list of sub-processors, with address and task, in Annex 3'}</span></li>
              </ul>
            </div>
          </div>

          <div className="row" style={{ gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href={AVV_PDF_URL} data-testid="avv-download">
              {de ? 'Vollstaendigen AVV herunterladen (PDF)' : 'Download the full AVV (PDF)'}
            </a>
            <Link to="/security" className="btn btn-outline">
              {de ? 'Sicherheits- und DSGVO-Seite' : 'Security and GDPR page'}
            </Link>
          </div>

          <p className="muted small" style={{ marginTop: 24, maxWidth: 620 }}>
            {de
              ? 'Dies ist die aktuelle Vorlage, Version 1.0. Ihre eigene unterzeichnete Fassung, mit Ihren Firmendaten und dem Zeitpunkt der Annahme, finden Sie nach der Anmeldung in den Einstellungen.'
              : 'This is the current template, version 1.0. Your own signed copy, with your company details and acceptance timestamp, is available from Settings once you are signed in.'}
          </p>
        </div>
      </section>

      <section className="mkt-cta-band">
        <div className="content" style={{ textAlign: 'center' }}>
          <h2>{de ? 'Fragen zum AVV?' : 'Questions about the AVV?'}</h2>
          <p className="mkt-lead-sm" style={{ margin: '10px auto 22px' }}>
            {de ? 'Schreiben Sie uns an info@rit.services.' : 'Write to us at info@rit.services.'}
          </p>
          <div className="row" style={{ gap: 12, justifyContent: 'center' }}>
            <Link to="/security" className="btn btn-outline">{de ? 'Sicherheit' : 'Security'}</Link>
            <Link to="/register" className="btn btn-primary">
              {de ? 'Kostenlos starten' : 'Start for free'} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
