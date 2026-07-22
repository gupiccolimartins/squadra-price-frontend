import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Erro de renderização:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <h1 style={{ marginBottom: 12 }}>Não foi possível exibir esta tela</h1>
          <p style={{ color: '#64748b', marginBottom: 24 }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button className="chip-button" type="button" onClick={this.handleReload}>
            Recarregar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
