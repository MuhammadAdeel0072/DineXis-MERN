import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="card-premium p-8 max-w-md space-y-6 border-red-500/30">
            <h2 className="text-3xl font-serif font-black text-gold">Something went wrong</h2>
            <p className="text-gray-400 font-medium">
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gold text-charcoal px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
