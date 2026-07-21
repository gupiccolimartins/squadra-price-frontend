import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import { API_BASE_URL } from '../utils/api'

function Login() {
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, senha }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setErro(data?.message || 'Credenciais invalidas')
        setLoading(false)
        return
      }

      const data = await response.json()
      localStorage.setItem('squadra_token', data.token)
      localStorage.setItem('squadra_user', JSON.stringify(data.usuario))
      navigate('/')
    } catch {
      setErro('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img
            className="login-brand-logo"
            src="/img/Logo%20Squadra%20Entrada.png"
            alt="Squadra Sistema Price"
          />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login">Login</label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {erro && <div className="login-error">{erro}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
