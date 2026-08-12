import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #FDE68A 50%, #FFFFFF 100%)' }}>
          <div className="flex flex-col items-center gap-4 p-6 max-w-md mx-auto">
            <div className="text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 text-center">Something went wrong</h2>
            <p className="text-gray-600 text-center">
              The app encountered an error. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300"
              style={{
                background: '#F59E0B',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}
            >
              Refresh Page
            </button>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

