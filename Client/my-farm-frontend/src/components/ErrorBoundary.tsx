import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI or use provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-medium">Có lỗi xảy ra</h3>
          </div>
          <p className="text-red-600 text-sm mb-3">
            Thành phần này gặp lỗi và không thể hiển thị. Vui lòng refresh trang.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Refresh trang
          </button>
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-3">
              <summary className="text-xs text-red-500 cursor-pointer">Chi tiết lỗi (dev mode)</summary>
              <pre className="text-xs text-red-500 mt-2 whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;