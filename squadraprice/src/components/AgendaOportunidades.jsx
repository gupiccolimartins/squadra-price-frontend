import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import Header from './Header'
import AgendaNav from './AgendaNav'
import { apiFetch } from '../utils/api'

function formatCurrency(value) {
  return (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function AgendaOportunidades() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [estagios, setEstagios] = useState([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [filters, setFilters] = useState({ ordenacao: 'Ultimos', estagioId: '' })
  const [applied, setApplied] = useState(filters)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
        ordenacao: applied.ordenacao,
      })
      if (applied.estagioId) params.set('estagioId', applied.estagioId)
      const response = await apiFetch(`/api/agenda/oportunidades?${params}`)
      if (!response.ok) throw new Error('Falha ao listar oportunidades')
      const data = await response.json()
      setItems(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
      setErrorMessage('')
    } catch (e) {
      setErrorMessage(e.message)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, applied])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    apiFetch('/api/agenda/estagios').then((r) => r.ok ? r.json() : []).then(setEstagios).catch(() => setEstagios([]))
  }, [])

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  const excluir = async (id) => {
    if (!window.confirm('Excluir esta oportunidade?')) return
    const response = await apiFetch(`/api/agenda/oportunidades/${id}`, { method: 'DELETE' })
    if (response.ok || response.status === 204) load()
  }

  return (
    <div className="app budgets-page">
      <Header />
      <main className="agenda-layout">
        <AgendaNav />
        <div className="agenda-content">
          <header className="budgets-header"><h1>Oportunidades</h1></header>
          <form className="budgets-filters agenda-filters" onSubmit={(e) => { e.preventDefault(); setPage(0); setApplied(filters) }}>
            <div className="budgets-filter-group">
              <label>Ordenação</label>
              <select className="budgets-filter-select" value={filters.ordenacao} onChange={(e) => setFilters((p) => ({ ...p, ordenacao: e.target.value }))}>
                <option value="Ultimos">Últimos Incluídos</option>
                <option value="Ordem">Ordem Alfabética</option>
                <option value="MaiorFaturamento">Maior faturamento ponderado</option>
                <option value="Vendedor">Vendedor</option>
              </select>
            </div>
            <div className="budgets-filter-group">
              <label>Estágio</label>
              <select className="budgets-filter-select" value={filters.estagioId} onChange={(e) => setFilters((p) => ({ ...p, estagioId: e.target.value }))}>
                <option value="">Estágios</option>
                {estagios.map((e) => <option key={e.id} value={String(e.id)}>{e.nome}</option>)}
              </select>
            </div>
            <button type="submit" className="budgets-search-button">🔍</button>
          </form>

          {errorMessage && <p className="budgets-error">{errorMessage}</p>}
          {isLoading ? <p className="budgets-loading">Carregando...</p> : (
            <div className="budgets-card">
              <table className="budgets-table">
                <thead>
                  <tr>
                    <th>Oportunidade</th><th>Cliente</th><th>Contato</th><th>Estimativa de receita anual</th><th>#</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="budgets-row-clickable" onClick={() => navigate(`/Agenda/${item.agendaContatoId}`)}>
                      <td>{item.oportunidade}</td>
                      <td>{item.contatoNome}</td>
                      <td>{item.contatoTelefone}{item.contatoEmail ? <><br />{item.contatoEmail}</> : null}</td>
                      <td>{formatCurrency(item.receitaAnual)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="agenda-icon-btn" onClick={() => excluir(item.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center' }}>Nenhuma oportunidade cadastrada.</td></tr>}
                </tbody>
              </table>

              <div className="pagination-container">
                <div className="pagination-info">
                  <span>Itens por página:</span>
                  <select
                    className="pagination-select"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="pagination-total">
                    {totalElements > 0
                      ? `${page * pageSize + 1}-${Math.min((page + 1) * pageSize, totalElements)} de ${totalElements}`
                      : '0 registros'}
                  </span>
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-button"
                    type="button"
                    onClick={() => handlePageChange(0)}
                    disabled={page === 0}
                    aria-label="Primeira página"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z" fill="currentColor" />
                    </svg>
                  </button>
                  <button
                    className="pagination-button"
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    aria-label="Página anterior"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" fill="currentColor" />
                    </svg>
                  </button>
                  <span className="pagination-page">
                    Página {totalPages > 0 ? page + 1 : 0} de {totalPages}
                  </span>
                  <button
                    className="pagination-button"
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    aria-label="Próxima página"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor" />
                    </svg>
                  </button>
                  <button
                    className="pagination-button"
                    type="button"
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    aria-label="Última página"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AgendaOportunidades
