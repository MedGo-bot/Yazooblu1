import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-neutral-900 border border-amber-500/40 rounded-2xl shadow-xl text-neutral-200 font-sans max-w-2xl mx-auto">
          <div className="flex items-center gap-3 text-amber-400 mb-3">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <h3 className="text-base font-bold text-white">
              {this.props.fallbackTitle || 'Component State Reset Needed'}
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            A temporary component state conflict occurred. Click below to refresh this section without losing your overall session.
          </p>
          {this.state.error && (
            <div className="p-3 mb-4 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[11px] text-amber-300 overflow-x-auto">
              {this.state.error.message}
            </div>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs rounded-xl transition flex items-center gap-2 cursor-pointer border border-neutral-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Section State
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
