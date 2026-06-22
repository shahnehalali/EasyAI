import { Component } from 'react';

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
      return (
        <div className="card" data-testid="error-boundary"><div className="empty">
          <div className="big">!</div>
          <h3 style={{ marginBottom: 6 }}>This page hit an unexpected error</h3>
          <p className="muted">Try again, or reload the page. If it keeps happening, let us know.</p>
          <div className="row" style={{ gap: 10, justifyContent: 'center', marginTop: 14 }}>
            <button className="btn btn-outline btn-sm" onClick={this.reset}>Try again</button>
            <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div></div>
      );
    }
    return this.props.children;
  }
}
