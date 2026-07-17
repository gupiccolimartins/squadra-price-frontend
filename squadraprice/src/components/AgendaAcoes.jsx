import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import Header from './Header'
import AgendaNav from './AgendaNav'
import { apiFetch } from '../utils/api'

const PAGE_SIZE = 20

function getLoggedUser() {
  try { return JSON.parse(localStorage.getItem('squadra_user') || '{}') } catch { return {} }
}

function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString('pt-BR')
}

function AgendaAcoes() {
  const navigate = useNavigate()
  const user = useMemo(() => getLoggedUser(), [])
  const isAdmin = user.permissaoId === 1

  const [items, setItems] = useState([])
  const [estagios, setEstagios] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [filters, setFilters] = useState({ ordenacao: 'Ultimos', estagioId: '', usuarioId: '' })
  const [applied, setApplied] = useState(filters)
  const [comentarioModal, setComentarioModal] = useState(null)
  const [comentario, setComentario] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE), ordenacao: applied.ordenacao })
      if (applied.estagioId) params.set('estagioId', applied.estagioId)
      if (applied.usuarioId) params.set('usuarioId', applied.usuarioId)
      if (applied.ordenacao === 'Atrasados') params.set('atrasados', 'true')
      const response = await apiFetch(`/api/agenda/acoes?${params}`)
      if (!response.ok) throw new Error('Falha ao listar ações')
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
    apiFetch('/api/orcamentos/usuarios').then((r) => r.ok ? r.json() : []).then(setUsuarios).catch(() => setUsuarios([]))
  }, [])

  const concluir = async () => {
    const response = await apiFetch(`/api/agenda/acoes/${comentarioModal}/concluir`, {
      method: 'POST', body: JSON.stringify({ comentario }),
    })
    if (response.ok) {
      setComentarioModal(null)
      setComentario('')
      load()
    }
  }

  const excluir = async (id) => {
    if (!window.confirm('Excluir esta ação?')) return
    const response = await apiFetch(`/api/agenda/acoes/${id}`, { method: 'DELETE' })
    if (response.ok || response.status === 204) load()
  }

  return (
    <div className="app budgets-page">
      <Header />
      <main className="agenda-layout">
        <AgendaNav />
        <div className="agenda-content">
          <header className="budgets-header"><h1>Ações</h1></header>
          <form className="budgets-filters agenda-filters" onSubmit={(e) => { e.preventDefault(); setPage(0); setApplied(filters) }}>
            <div className="budgets-filter-group">
              <label>Ordenação</label>
              <select className="budgets-filter-select" value={filters.ordenacao} onChange={(e) => setFilters((p) => ({ ...p, ordenacao: e.target.value }))}>
                <option value="Ultimos">Últimos Incluídos</option>
                <option value="Ordem">Ordem Alfabética</option>
                <option value="MaiorFaturamento">Maior faturamento ponderado</option>
                <option value="Vendedor">Vendedor</option>
                <option value="Atrasados">Atrasados</option>
              </select>
            </div>
            <div className="budgets-filter-group">
              <label>Estágio</label>
              <select className="budgets-filter-select" value={filters.estagioId} onChange={(e) => setFilters((p) => ({ ...p, estagioId: e.target.value }))}>
                <option value="">Estágios</option>
                {estagios.map((e) => <option key={e.id} value={String(e.id)}>{e.nome}</option>)}
              </select>
            </div>
            {isAdmin && (
              <div className="budgets-filter-group">
                <label>Responsável</label>
                <select className="budgets-filter-select" value={filters.usuarioId} onChange={(e) => setFilters((p) => ({ ...p, usuarioId: e.target.value }))}>
                  <option value="">Responsável</option>
                  {usuarios.map((u) => <option key={u.id} value={String(u.id)}>{u.nome}</option>)}
                </select>
              </div>
            )}
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
                      <th>Cliente</th><th>Ação</th><th>Descrição</th><th>Data</th><th>Responsável</th><th>Sit.</th><th>#</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="budgets-row-clickable" onClick={() => navigate(`/Agenda/${item.agendaContatoId}`)}>
                        <td>{item.contatoNome}</td>
                        <td>{item.tipoAcaoNome}</td>
                        <td>{item.descricao}</td>
                        <td>{formatDateTime(item.data)}</td>
                        <td>{item.responsavelNome}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          {item.situacaoId === 2 ? (
                            <span className="agenda-situacao agenda-sit-concluida" title={item.comentario || 'Realizada'} />
                          ) : new Date(item.data) < new Date() ? (
                            <span className="agenda-situacao agenda-sit-atrasada" title="Atrasada" />
                          ) : (
                            <span className="agenda-situacao agenda-sit-pendente" title="Pendente" />
                          )}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          {item.situacaoId !== 2 && (
                            <button type="button" className="agenda-icon-btn" onClick={() => { setComentarioModal(item.id); setComentario('') }}>✓</button>
                          )}
                          <button type="button" className="agenda-icon-btn" onClick={() => excluir(item.id)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center' }}>Nenhuma ação cadastrada.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {comentarioModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Concluir Ação</h2>
              <button type="button" className="users-modal-close" onClick={() => setComentarioModal(null)}>×</button>
            </div>
            <div className="modal-form">
              <div className="modal-form-group modal-form-group-full">
                <label>Comentário</label>
                <textarea className="modal-input" rows={4} value={comentario} onChange={(e) => setComentario(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setComentarioModal(null)}>Cancelar</button>
                <button type="button" className="agenda-primary-btn" onClick={concluir}>Concluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgendaAcoes
