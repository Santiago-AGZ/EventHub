import { Component } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <main className="flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center">
          <p className="mb-4 text-6xl font-bold text-muted-foreground/20">!</p>
          <h1 className="mb-3 text-2xl font-extrabold">Algo salio mal</h1>
          <p className="mb-8 max-w-[65ch] text-muted-foreground">
            Ocurrio un error inesperado. Esto no deberia pasar, pero puedes intentar de nuevo.
          </p>
          <Button onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}>
            Volver al Inicio
          </Button>
        </main>
      )
    }

    return this.props.children
  }
}
