import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h1 className="text-2xl font-bold text-red-800 mb-4">
                Something went wrong
              </h1>
              <p className="text-red-600 mb-6">
                A React error occurred that prevented the page from loading properly.
              </p>
              
              {this.state.error && (
                <div className="bg-white border border-red-200 rounded p-4 mb-6">
                  <h3 className="font-semibold text-red-700 mb-2">Error Details:</h3>
                  <pre className="text-sm text-red-600 text-left overflow-x-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Reload Page
                </button>
                <div>
                  <a
                    href="/"
                    className="text-red-600 hover:text-red-800 underline"
                  >
                    Go to Home Page
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary