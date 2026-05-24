import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-24 text-center" role="alert">
          <AlertTriangle className="w-10 h-10 text-destructive mb-4" aria-hidden="true" />
          <h2 className="text-lg font-semibold mb-2">Bir Hata Oluştu</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Beklenmeyen bir hata meydana geldi. Sayfayı yenilemeyi deneyin.
          </p>
          <pre className="text-xs text-muted-foreground bg-muted rounded-md p-3 max-w-lg overflow-auto">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
