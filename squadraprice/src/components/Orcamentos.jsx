import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const PAGE_SIZE = 25

function Orcamentos() {
  const [budgets, setBudgets] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [usuarios, setUsuarios] = useState([])
  const [statusList, setStatusList] = useState([])

  const [filters, setFilters] = useState({
    orcamentoId: '',
    clienteNome: '',
    usuarioId: '',
    statusOrcamentoId: '',
    dataInicio: '',
    dataFim: '',
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)

  const navigate = useNavigate()
  const abortControllerRef = useRef(null)

  const handleRowClick = (budget) => {
    if (!budget?.id) return
    navigate(`/Orcamentos/${budget.id}`, { state: { budget } })
  }

  const buildQueryString = useCallback((currentPage, currentFilters) => {
    const params = new URLSearchParams({ page: currentPage, size: PAGE_SIZE })
    if (currentFilters.orcamentoId) params.set('orcamentoId', currentFilters.orcamentoId)
    if (currentFilters.clienteNome) params.set('clienteNome', currentFilters.clienteNome)
    if (currentFilters.usuarioId) params.set('usuarioId', currentFilters.usuarioId)
    if (currentFilters.statusOrcamentoId) params.set('statusOrcamentoId', currentFilters.statusOrcamentoId)
    if (currentFilters.dataInicio) params.set('dataInicio', currentFilters.dataInicio)
    if (currentFilters.dataFim) params.set('dataFim', currentFilters.dataFim)
    return params.toString()
  }, [])

  const loadBudgets = useCallback(async (currentPage, currentFilters) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setIsLoading(true)
      const qs = buildQueryString(currentPage, currentFilters)
      const response = await fetch(`${API_BASE_URL}/api/orcamentos/paged?${qs}`, {
        signal: abortControllerRef.current.signal,
      })
      if (!response.ok) {
        throw new Error(`Falha ao buscar orçamentos (${response.status})`)
      }
      const data = await response.json()
      setBudgets(Array.isArray(data.content) ? data.content : [])
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
      setErrorMessage('')
    } catch (error) {
      if (error.name === 'AbortError') return
      setBudgets([])
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar orçamentos')
    } finally {
      setIsLoading(false)
    }
  }, [buildQueryString])

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/orcamentos/usuarios`)
      .then((r) => r.ok ? r.json() : [])
      .then(setUsuarios)
      .catch(() => setUsuarios([]))

    fetch(`${API_BASE_URL}/api/orcamentos/status`)
      .then((r) => r.ok ? r.json() : [])
      .then(setStatusList)
      .catch(() => setStatusList([]))
  }, [])

  useEffect(() => {
    loadBudgets(page, appliedFilters)
    return () => abortControllerRef.current?.abort()
  }, [page, appliedFilters, loadBudgets])

  const handleFilterChange = (e) => {
    const { id, value } = e.target
    setFilters((prev) => ({ ...prev, [id]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setAppliedFilters(filters)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    setPage(newPage)
  }

  const startItem = totalElements === 0 ? 0 : page * PAGE_SIZE + 1
  const endItem = Math.min((page + 1) * PAGE_SIZE, totalElements)

  return (
    <div className="app budgets-page">
      <Header />

      <main className="budgets-container">
        <header className="budgets-header">
          <h1>Orçamentos | Criar Orçamento</h1>
          <span className="budgets-subtitle">Listagem de orçamentos cadastrados</span>
        </header>

        <form className="budgets-filters" aria-label="Filtros de orçamentos" onSubmit={handleSearch}>
          <div className="budgets-filter-group">
            <label htmlFor="orcamentoId">Orçamento</label>
            <input
              id="orcamentoId"
              className="budgets-filter-input"
              type="number"
              placeholder="Nº Orça"
              value={filters.orcamentoId}
              onChange={handleFilterChange}
              min="1"
            />
          </div>
          <div className="budgets-filter-group">
            <label htmlFor="clienteNome">Cliente</label>
            <input
              id="clienteNome"
              className="budgets-filter-input"
              type="text"
              placeholder="Nome do Cliente"
              value={filters.clienteNome}
              onChange={handleFilterChange}
            />
          </div>
          <div className="budgets-filter-group">
            <label htmlFor="usuarioId">Usuário</label>
            <select
              id="usuarioId"
              className="budgets-filter-select"
              value={filters.usuarioId}
              onChange={handleFilterChange}
            >
              <option value="">Selecione</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          </div>
          <div className="budgets-filter-group">
            <label htmlFor="statusOrcamentoId">Status</label>
            <select
              id="statusOrcamentoId"
              className="budgets-filter-select"
              value={filters.statusOrcamentoId}
              onChange={handleFilterChange}
            >
              <option value="">Selecione</option>
              {statusList.map((s) => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
          <div className="budgets-filter-group">
            <label htmlFor="dataInicio">Data Início</label>
            <input
              id="dataInicio"
              className="budgets-filter-input"
              type="date"
              value={filters.dataInicio}
              onChange={handleFilterChange}
            />
          </div>
          <div className="budgets-filter-group">
            <label htmlFor="dataFim">Data Fim</label>
            <input
              id="dataFim"
              className="budgets-filter-input"
              type="date"
              value={filters.dataFim}
              onChange={handleFilterChange}
            />
          </div>
          <button className="icon-button budgets-search-button" type="submit" aria-label="Buscar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                fill="currentColor"
              />
            </svg>
          </button>
        </form>

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
              {!isLoading && !errorMessage && budgets.length === 0 && (
                <tr>
                  <td colSpan={4}>Nenhum orçamento encontrado.</td>
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

          {!isLoading && totalPages > 0 && (
            <div className="budgets-pagination">
              <span className="budgets-pagination-info">
                {startItem}–{endItem} de {totalElements}
              </span>
              <div className="budgets-pagination-controls">
                <button
                  className="budgets-pagination-button"
                  onClick={() => handlePageChange(0)}
                  disabled={page === 0}
                  aria-label="Primeira página"
                >
                  «
                </button>
                <button
                  className="budgets-pagination-button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  aria-label="Página anterior"
                >
                  ‹
                </button>
                <span className="budgets-pagination-page">
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  className="budgets-pagination-button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  aria-label="Próxima página"
                >
                  ›
                </button>
                <button
                  className="budgets-pagination-button"
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  aria-label="Última página"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Orcamentos
