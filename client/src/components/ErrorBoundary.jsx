import { Component } from 'react';
import { useLangStore } from '@/store/langStore';
import { translate } from '@/i18n/ui';

// Catches render errors in the page tree and shows a friendly fallback
// instead of a blank screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('UI error boundary caught:', error, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      const lang = useLangStore.getState().lang;
      return (
        <div className="card" data-testid="error-boundary"><div className="empty">
          <div className="big">!</div>
          <h3 style={{ marginBottom: 6 }}>{translate(lang, 'eb.title')}</h3>
          <p className="muted">{translate(lang, 'eb.body')}</p>
          <div className="row" style={{ gap: 10, justifyContent: 'center', marginTop: 14 }}>
            <button className="btn btn-outline btn-sm" onClick={this.reset}>{translate(lang, 'eb.tryAgain')}</button>
            <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>{translate(lang, 'eb.reload')}</button>
          </div>
        </div></div>
      );
    }
    return this.props.children;
  }
}
