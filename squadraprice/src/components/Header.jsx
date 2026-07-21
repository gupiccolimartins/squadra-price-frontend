import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, clearAuthSession } from '../utils/api'

function Header() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [latestBudgets, setLatestBudgets] = useState([])
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSenhaModal, setShowSenhaModal] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [senhaErro, setSenhaErro] = useState('')
  const [senhaSucesso, setSenhaSucesso] = useState('')
  const menuRef = useRef(null)

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('squadra_user') || '{}')
    } catch {
      return {}
    }
  })()

  useEffect(() => {
    let isMounted = true

    const loadLatestBudgets = async () => {
      try {
        const response = await apiFetch('/api/orcamentos')
        if (!response.ok) {
          return
        }
        const data = await response.json()
        if (!isMounted || !Array.isArray(data)) {
          return
        }
        setLatestBudgets(data.slice(0, 15))
      } catch {
        if (isMounted) {
          setLatestBudgets([])
        }
      }
    }

    loadLatestBudgets()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = () => {
    const normalized = searchValue.trim()
    if (!normalized) {
      return
    }
    navigate(`/Orcamentos/${normalized}`)
  }

  const handleLogout = () => {
    clearAuthSession()
    navigate('/Login')
  }

  const handleTrocarSenha = async (e) => {
    e.preventDefault()
    setSenhaErro('')
    setSenhaSucesso('')

    if (novaSenha.length < 6 || novaSenha.length > 20) {
      setSenhaErro('Nova senha deve ter entre 6 e 20 caracteres')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setSenhaErro('Nova senha e confirmacao nao conferem')
      return
    }

    try {
      const response = await apiFetch('/api/auth/senha', {
        method: 'PUT',
        body: JSON.stringify({ senhaAtual, novaSenha }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setSenhaErro(data?.message || 'Erro ao trocar senha')
        return
      }
      setSenhaSucesso('Senha alterada com sucesso. Faca login novamente.')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setTimeout(() => {
        clearAuthSession()
        navigate('/Login')
      }, 1500)
    } catch {
      setSenhaErro('Erro ao conectar com o servidor')
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-content">
          <div className="brand">
            <img
              className="brand-logo"
              src="/img/logo_branco.png"
              alt="Squadra esquadrias de pvc"
            />
          </div>

          <div className="search">
            <input
              type="text"
              placeholder="Orcamento"
              aria-label="Pesquisar"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSearchSubmit()
                }
              }}
            />
            <button type="button" className="icon-button" aria-label="Buscar" onClick={handleSearchSubmit}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M11 4a7 7 0 0 1 5.48 11.37l3.58 3.58-1.41 1.41-3.58-3.58A7 7 0 1 1 11 4zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          <select
            className="topbar-select"
            aria-label="Ultimos Orcamentos"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                navigate(`/Orcamentos/${event.target.value}`)
              }
            }}
          >
            <option value="">Ultimos Orcamentos</option>
            {latestBudgets.map((budget) => (
              <option key={budget.id} value={budget.id}>
                #{budget.id} - v{budget.versao || '1'} - {budget.cliente || 'Cliente'}
              </option>
            ))}
          </select>

          <div className="topbar-actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Inicio"
              onClick={() => navigate('/')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 5.1 4 12h2.5v7h4.5v-4h2v4h4.5v-7H20L12 5.1z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button type="button" className="icon-button" aria-label="Menu">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 6h7v7H4V6zm9 0h7v7h-7V6zM4 15h7v7H4v-7zm9 0h7v7h-7v-7z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <div className="user-menu-wrapper" ref={menuRef}>
              <button
                type="button"
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="Menu do usuario"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
                  <path
                    d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                    fill="currentColor"
                  />
                </svg>
                <span className="user-menu-name">{user.nome || 'Usuario'}</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <button type="button" onClick={() => { setShowSenhaModal(true); setShowUserMenu(false) }}>
                    Trocar Senha
                  </button>
                  <button type="button" onClick={handleLogout}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showSenhaModal && (
        <div className="modal-overlay" onClick={() => setShowSenhaModal(false)}>
          <div className="modal-content modal-senha" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Trocar Senha</h3>
              <button type="button" className="modal-close" onClick={() => setShowSenhaModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleTrocarSenha}>
              <div className="form-group">
                <label>Senha Atual</label>
                <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Nova Senha</label>
                <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Confirmar Nova Senha</label>
                <input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
              </div>
              {senhaErro && <div className="login-error">{senhaErro}</div>}
              {senhaSucesso && <div className="senha-sucesso">{senhaSucesso}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowSenhaModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
