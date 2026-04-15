import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="text-left max-w-2xl w-full bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please refresh the page and try again.</p>
            <div className="mb-4">
              <p className="font-semibold text-gray-800">Error:</p>
              <pre className="text-sm text-red-600 whitespace-pre-wrap break-words">{this.state.error?.message || 'Unknown error'}</pre>
            </div>
            <details className="mb-4 text-sm text-gray-600">
              <summary className="cursor-pointer">Show stack trace</summary>
              <pre className="whitespace-pre-wrap break-words">{this.state.errorInfo?.componentStack}</pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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