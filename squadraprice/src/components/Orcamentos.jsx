import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function Orcamentos() {
  const [budgets, setBudgets] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const handleRowClick = (budget) => {
    if (!budget?.id) {
      return
    }
    navigate(`/Orcamentos/${budget.id}`, { state: { budget } })
  }

  useEffect(() => {
    let isMounted = true

    const loadBudgets = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/orcamentos`)
        if (!response.ok) {
          throw new Error(`Falha ao buscar orçamentos (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setBudgets(Array.isArray(data) ? data : [])
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setBudgets([])
          setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar orçamentos')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadBudgets()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="app budgets-page">
      <Header />

      <main className="budgets-container">
        <header className="budgets-header">
          <h1>Orçamentos | Criar Orçamento</h1>
          <span className="budgets-subtitle">Listagem de orçamentos cadastrados</span>
        </header>

        <section className="budgets-filters" aria-label="Filtros de orçamentos">
          <div className="budgets-filter-group">
            <label htmlFor="budgets-id">Orçamento</label>
            <input
              id="budgets-id"
              className="budgets-filter-input"
              type="text"
              placeholder="Nº Orça"
            />
          </div>
          <div className="budgets-filter-group">
            <label htmlFor="budgets-client">Cliente</label>
            <input
              id="budgets-client"
              className="budgets-filter-input"
              type="text"
              placeholder="Nome do Cliente"
            />
          </div>
          <div className="budgets-filter-group">
            <label htmlFor="budgets-user">Usuário</label>
            <select id="budgets-user" className="budgets-filter-select" defaultValue="">
              <option value="">Selecione</option>
              <option value="israel">Israel Ferreira Resende</option>
              <option value="luisa">Luísa Kamashiro</option>
              <option value="nivaldo">Nivaldo Nei</option>
              <option value="eric">Eric Butsugam</option>
            </select>
          </div>
          <div className="budgets-filter-group">
            <label htmlFor="budgets-status">Status</label>
            <select id="budgets-status" className="budgets-filter-select" defaultValue="">
              <option value="">Selecione</option>
              <option value="aberto">Aberto</option>
              <option value="ganhou">Ganhou</option>
              <option value="perdeu">Perdeu</option>
            </select>
          </div>
          <div className="budgets-filter-group">
            <label htmlFor="budgets-start">Data Início</label>
            <input id="budgets-start" className="budgets-filter-input" type="date" />
          </div>
          <div className="budgets-filter-group">
            <label htmlFor="budgets-end">Data Fim</label>
            <input id="budgets-end" className="budgets-filter-input" type="date" />
          </div>
          <button className="icon-button budgets-search-button" type="button" aria-label="Buscar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                fill="currentColor"
              />
            </svg>
          </button>
        </section>

        <section className="budgets-card">
          <table className="budgets-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Obra</th>
                <th>Usuário</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4}>Carregando orçamentos...</td>
                </tr>
              )}
              {!isLoading && errorMessage && (
                <tr>
                  <td colSpan={4}>{errorMessage}</td>
                </tr>
              )}
              {!isLoading &&
                !errorMessage &&
                budgets.map((budget) => (
                  <tr
                    key={budget.id}
                    className="budgets-row"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRowClick(budget)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleRowClick(budget)
                      }
                    }}
                  >
                    <td>{budget.id}</td>
                    <td>
                      <div className="budgets-obra">
                        <span className="budgets-link">
                          Cliente: {budget.cliente} | Versão: {budget.versao}
                        </span>
                        <span className="budgets-obra-line">{budget.obra}</span>
                        <span className="budgets-obra-line">{budget.local}</span>
                      </div>
                    </td>
                    <td>{budget.usuario}</td>
                    <td className="budgets-status">{budget.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}

export default Orcamentos
