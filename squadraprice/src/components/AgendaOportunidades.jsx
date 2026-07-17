import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import Header from './Header'
import AgendaNav from './AgendaNav'
import { apiFetch } from '../utils/api'

const PAGE_SIZE = 20

function formatCurrency(value) {
  return (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function AgendaOportunidades() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [estagios, setEstagios] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [filters, setFilters] = useState({ ordenacao: 'Ultimos', estagioId: '' })
  const [applied, setApplied] = useState(filters)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE), ordenacao: applied.ordenacao })
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
  }, [page, applied])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    apiFetch('/api/agenda/estagios').then((r) => r.ok ? r.json() : []).then(setEstagios).catch(() => setEstagios([]))
  }, [])

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
            <>
              <div className="budgets-pagination">
                <span className="budgets-pagination-info">Página {totalPages === 0 ? 0 : page + 1} de {totalPages} | Mostrando: {items.length} de {totalElements} Registros</span>
                <div className="budgets-pagination-controls">
                  <button type="button" className="budgets-pagination-button" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Anterior</button>
                  <button type="button" className="budgets-pagination-button" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</button>
                </div>
              </div>
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
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default AgendaOportunidades
