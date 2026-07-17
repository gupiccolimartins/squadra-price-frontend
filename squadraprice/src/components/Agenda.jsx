import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import Header from './Header'
import AgendaNav from './AgendaNav'
import { apiFetch } from '../utils/api'

const PAGE_SIZE = 15
const ESTAGIO_PADRAO = '1'

function getLoggedUser() {
  try {
    return JSON.parse(localStorage.getItem('squadra_user') || '{}')
  } catch {
    return {}
  }
}

function formatCurrency(value) {
  const n = Number(value) || 0
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function situacaoInfo(item) {
  if (!item?.ultimaAcaoSituacaoId || item.ultimaAcaoSituacaoId !== 1) return null
  if (!item.ultimaAcaoData) return { cls: 'agenda-sit-pendente', title: 'Este contato possui ações pendentes' }
  const data = new Date(item.ultimaAcaoData)
  if (Number.isNaN(data.getTime())) return { cls: 'agenda-sit-pendente', title: 'Este contato possui ações pendentes' }
  if (data > new Date()) return { cls: 'agenda-sit-pendente', title: 'Este contato possui ações pendentes' }
  return { cls: 'agenda-sit-atrasada', title: 'Este contato possui ações atrasadas' }
}

const emptyForm = {
  nome: '',
  telefone: '',
  email: '',
  observacao: '',
  endereco: '',
  complemento: '',
  bairro: '',
  cep: '',
  cidadeId: '',
  ufId: '',
  estagioId: '1',
  orcamentoId: '',
  usuarioId: '',
}

function Agenda() {
  const navigate = useNavigate()
  const user = useMemo(() => getLoggedUser(), [])
  const isAdmin = user.permissaoId === 1

  const [contatos, setContatos] = useState([])
  const [estagios, setEstagios] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [estados, setEstados] = useState([])
  const [cidades, setCidades] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [filters, setFilters] = useState({
    orcamentoId: '',
    clienteNome: '',
    estagioId: ESTAGIO_PADRAO,
    ordenacao: 'Ultimos',
    usuarioId: '',
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [orcamentoLookup, setOrcamentoLookup] = useState('')

  const abortRef = useRef(null)

  const loadContatos = useCallback(async (currentPage, currentFilters) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: String(currentPage),
        size: String(PAGE_SIZE),
        ordenacao: currentFilters.ordenacao || 'Ultimos',
      })
      if (currentFilters.orcamentoId) params.set('orcamentoId', currentFilters.orcamentoId)
      if (currentFilters.clienteNome) params.set('clienteNome', currentFilters.clienteNome)
      if (currentFilters.usuarioId) params.set('usuarioId', currentFilters.usuarioId)
      if (currentFilters.estagioId) params.append('estagioId', currentFilters.estagioId)

      const response = await apiFetch(`/api/agenda/contatos?${params}`, {
        signal: abortRef.current.signal,
      })
      if (!response.ok) throw new Error(`Falha ao buscar contatos (${response.status})`)
      const data = await response.json()
      setContatos(Array.isArray(data.content) ? data.content : [])
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
      setErrorMessage('')
    } catch (error) {
      if (error.name === 'AbortError') return
      setContatos([])
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar contatos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    apiFetch('/api/agenda/estagios')
      .then((r) => (r.ok ? r.json() : []))
      .then(setEstagios)
      .catch(() => setEstagios([]))

    apiFetch('/api/orcamentos/usuarios')
      .then((r) => (r.ok ? r.json() : []))
      .then(setUsuarios)
      .catch(() => setUsuarios([]))

    apiFetch('/api/cidades-estados/estados?page=0&size=50')
      .then((r) => (r.ok ? r.json() : { content: [] }))
      .then((data) => setEstados(Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : []))
      .catch(() => setEstados([]))
  }, [])

  useEffect(() => {
    loadContatos(page, appliedFilters)
    return () => abortRef.current?.abort()
  }, [page, appliedFilters, loadContatos])

  useEffect(() => {
    if (!form.ufId) {
      setCidades([])
      return
    }
    apiFetch(`/api/cidades-estados/estados/${form.ufId}/cidades`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCidades)
      .catch(() => setCidades([]))
  }, [form.ufId])

  const handleFilterChange = (e) => {
    const { id, value } = e.target
    setFilters((prev) => ({ ...prev, [id]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setAppliedFilters(filters)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm({
      ...emptyForm,
      usuarioId: user.id ? String(user.id) : '',
      estagioId: '1',
    })
    setFormError('')
    setOrcamentoLookup('')
    setModalOpen(true)
  }

  const openEditModal = async (id, e) => {
    e?.stopPropagation()
    try {
      const response = await apiFetch(`/api/agenda/contatos/${id}`)
      if (!response.ok) throw new Error('Falha ao carregar contato')
      const data = await response.json()
      setEditingId(id)
      setForm({
        nome: data.nome || '',
        telefone: data.telefone || '',
        email: data.email || '',
        observacao: data.observacao || '',
        endereco: data.endereco || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cep: data.cep || '',
        cidadeId: data.cidadeId ? String(data.cidadeId) : '',
        ufId: data.ufId ? String(data.ufId) : '',
        estagioId: data.estagioId ? String(data.estagioId) : '1',
        orcamentoId: data.orcamentoId && data.orcamentoId > 0 ? String(data.orcamentoId) : '',
        usuarioId: data.usuarioId ? String(data.usuarioId) : '',
      })
      setFormError('')
      setOrcamentoLookup('')
      setModalOpen(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao editar contato')
    }
  }

  const buscarOrcamento = async () => {
    if (!orcamentoLookup) return
    try {
      const response = await apiFetch(`/api/agenda/contatos/buscar-orcamento/${orcamentoLookup}`)
      if (!response.ok) throw new Error('Orçamento não encontrado')
      const data = await response.json()
      setForm((prev) => ({
        ...prev,
        orcamentoId: data.orcamentoId ? String(data.orcamentoId) : '',
        nome: data.nome || prev.nome,
        telefone: data.telefone || prev.telefone,
        email: data.email || prev.email,
        endereco: data.endereco || prev.endereco,
        cidadeId: data.cidadeId ? String(data.cidadeId) : prev.cidadeId,
        ufId: data.ufId ? String(data.ufId) : prev.ufId,
      }))
      setFormError('')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Erro ao buscar orçamento')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.cidadeId) {
      setFormError('Selecione uma cidade')
      return
    }
    if (!form.estagioId) {
      setFormError('Selecione um estágio')
      return
    }
    if (isAdmin && !form.usuarioId) {
      setFormError('Selecione um vendedor')
      return
    }

    setIsSaving(true)
    setFormError('')
    try {
      const body = {
        nome: form.nome,
        telefone: form.telefone,
        email: form.email,
        observacao: form.observacao,
        endereco: form.endereco,
        complemento: form.complemento,
        bairro: form.bairro,
        cep: form.cep,
        cidadeId: Number(form.cidadeId),
        estagioId: Number(form.estagioId),
        orcamentoId: form.orcamentoId ? Number(form.orcamentoId) : 0,
        usuarioId: form.usuarioId ? Number(form.usuarioId) : null,
      }
      const url = editingId ? `/api/agenda/contatos/${editingId}` : '/api/agenda/contatos'
      const response = await apiFetch(url, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Falha ao salvar (${response.status})`)
      }
      setModalOpen(false)
      if (!editingId) {
        setPage(0)
        setAppliedFilters((prev) => ({ ...prev, estagioId: ESTAGIO_PADRAO }))
        setFilters((prev) => ({ ...prev, estagioId: ESTAGIO_PADRAO }))
      }
      await loadContatos(
        editingId ? page : 0,
        editingId ? appliedFilters : { ...appliedFilters, estagioId: ESTAGIO_PADRAO },
      )
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Erro ao salvar contato')
    } finally {
      setIsSaving(false)
    }
  }

  const alterarEstagio = async (contatoId, estagioId, e) => {
    e?.stopPropagation()
    try {
      const response = await apiFetch(`/api/agenda/contatos/${contatoId}/estagio`, {
        method: 'PUT',
        body: JSON.stringify({ estagioId: Number(estagioId) }),
      })
      if (!response.ok) throw new Error('Falha ao alterar estágio')
      await loadContatos(page, appliedFilters)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao alterar estágio')
    }
  }

  const excluirContato = async (id, e) => {
    e?.stopPropagation()
    if (!window.confirm('Você deseja excluir o Contato?')) return
    try {
      const response = await apiFetch(`/api/agenda/contatos/${id}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) throw new Error('Falha ao excluir contato')
      await loadContatos(page, appliedFilters)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao excluir contato')
    }
  }

  const startItem = totalElements === 0 ? 0 : page * PAGE_SIZE + 1
  const endItem = Math.min((page + 1) * PAGE_SIZE, totalElements)

  return (
    <div className="app budgets-page">
      <Header />
      <main className="agenda-layout">
        <AgendaNav />
        <div className="agenda-content">
          <header className="budgets-header agenda-header-row">
            <div>
              <h1>Funil de Vendas</h1>
              <span className="budgets-subtitle">Agenda de Representantes</span>
            </div>
            <button type="button" className="agenda-primary-btn" onClick={openCreateModal}>
              Incluir Contato
            </button>
          </header>

          <form className="budgets-filters agenda-filters" onSubmit={handleSearch}>
            <div className="budgets-filter-group">
              <label htmlFor="orcamentoId">Orçamento</label>
              <input id="orcamentoId" className="budgets-filter-input" value={filters.orcamentoId} onChange={handleFilterChange} placeholder="Orçamento" />
            </div>
            <div className="budgets-filter-group">
              <label htmlFor="clienteNome">Nome Cliente</label>
              <input id="clienteNome" className="budgets-filter-input" value={filters.clienteNome} onChange={handleFilterChange} placeholder="Nome Cliente" />
            </div>
            <div className="budgets-filter-group">
              <label htmlFor="estagioId">Estágio</label>
              <select
                id="estagioId"
                className="budgets-filter-select"
                value={filters.estagioId}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {estagios.map((e) => (
                  <option key={e.id} value={String(e.id)}>{e.nome}</option>
                ))}
              </select>
            </div>
            <div className="budgets-filter-group">
              <label htmlFor="ordenacao">Ordenação</label>
              <select id="ordenacao" className="budgets-filter-select" value={filters.ordenacao} onChange={handleFilterChange}>
                <option value="Ultimos">Últimos Incluídos</option>
                <option value="Ordem">Ordem Alfabética</option>
                <option value="MaiorFaturamento">Maior faturamento ponderado</option>
                <option value="Vendedor">Vendedor</option>
              </select>
            </div>
            {isAdmin && (
              <div className="budgets-filter-group">
                <label htmlFor="usuarioId">Responsável</label>
                <select id="usuarioId" className="budgets-filter-select" value={filters.usuarioId} onChange={handleFilterChange}>
                  <option value="">Responsável</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={String(u.id)}>{u.nome}</option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="budgets-search-button" aria-label="Filtrar">🔍</button>
          </form>

          {errorMessage && <p className="budgets-error">{errorMessage}</p>}
          {isLoading && <p className="budgets-loading">Carregando...</p>}

          {!isLoading && (
            <>
              <div className="budgets-pagination">
                <span className="budgets-pagination-info">
                  Página {totalPages === 0 ? 0 : page + 1} de {totalPages} | Mostrando: {contatos.length} de {totalElements} Registros
                </span>
                <div className="budgets-pagination-controls">
                  <button type="button" className="budgets-pagination-button" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Anterior</button>
                  <button type="button" className="budgets-pagination-button" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</button>
                </div>
              </div>

              <div className="budgets-card">
                <table className="budgets-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Contato</th>
                      <th>Vendedor</th>
                      <th>Faturamento Ponderado</th>
                      <th>Orçamento</th>
                      <th>Estágio</th>
                      <th>Situação</th>
                      <th>#</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contatos.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center' }}>Nenhum contato cadastrado.</td>
                      </tr>
                    )}
                    {contatos.map((item) => {
                      const sit = situacaoInfo(item)
                      return (
                        <tr key={item.id} className="budgets-row-clickable" onClick={() => navigate(`/Agenda/${item.id}`)}>
                          <td>{item.nome}</td>
                          <td>
                            {item.telefone}
                            {item.email ? <><br />{item.email}</> : null}
                          </td>
                          <td>{item.vendedorNome}</td>
                          <td>{formatCurrency(item.faturamentoPonderado)}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            {item.orcamentoId > 0 ? (
                              <Link to={`/Orcamentos/${item.orcamentoId}`} target="_blank" rel="noreferrer">{item.orcamentoId}</Link>
                            ) : (
                              '0'
                            )}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="agenda-estagio-cell">
                              <span className="agenda-estagio-nome">{item.estagioNome}</span>
                              <label className="agenda-estagio-edit" title="Alterar estágio">
                                <span className="agenda-estagio-pencil" aria-hidden="true">✎</span>
                                <span className="agenda-estagio-caret" aria-hidden="true">▾</span>
                                <select
                                  className="agenda-estagio-select"
                                  value={String(item.estagioId || '')}
                                  onChange={(e) => alterarEstagio(item.id, e.target.value, e)}
                                  aria-label={`Alterar estágio de ${item.nome || 'contato'}`}
                                >
                                  {estagios.map((estagio) => (
                                    <option key={estagio.id} value={String(estagio.id)}>{estagio.nome}</option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          </td>
                          <td>
                            {sit && <span className={`agenda-situacao ${sit.cls}`} title={sit.title} />}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="agenda-icon-btn" title="Editar contato" onClick={(e) => openEditModal(item.id, e)}>✎</button>
                            <button type="button" className="agenda-icon-btn" title="Excluir" onClick={(e) => excluirContato(item.id, e)}>🗑</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="budgets-subtitle" style={{ marginTop: 8 }}>Exibindo {startItem}-{endItem}</p>
            </>
          )}
        </div>
      </main>

      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>{editingId ? 'Editar Contato' : 'Incluir Contato'}</h2>
              <button type="button" className="users-modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleSave}>
              <div className="modal-form-group modal-form-group-full agenda-lookup-row">
                <label>Buscar Orçamento</label>
                <div className="modal-search">
                  <input className="modal-input" value={orcamentoLookup} onChange={(e) => setOrcamentoLookup(e.target.value)} placeholder="ID do orçamento" />
                  <button type="button" className="modal-search-button" onClick={buscarOrcamento}>Buscar</button>
                </div>
              </div>
              <div className="modal-form-group">
                <label>Nome</label>
                <input className="modal-input" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>Telefone</label>
                <input className="modal-input" value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>Email</label>
                <input className="modal-input" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>Estágio</label>
                <select className="modal-select" value={form.estagioId} onChange={(e) => setForm((p) => ({ ...p, estagioId: e.target.value }))} required>
                  {estagios.map((e) => (
                    <option key={e.id} value={String(e.id)}>{e.nome}</option>
                  ))}
                </select>
              </div>
              {isAdmin && (
                <div className="modal-form-group">
                  <label>Vendedor</label>
                  <select className="modal-select" value={form.usuarioId} onChange={(e) => setForm((p) => ({ ...p, usuarioId: e.target.value }))} required>
                    <option value="">Selecione</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={String(u.id)}>{u.nome}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="modal-form-group modal-form-group-full">
                <label>Observações</label>
                <textarea className="modal-input" rows={3} value={form.observacao} onChange={(e) => setForm((p) => ({ ...p, observacao: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>Endereço</label>
                <input className="modal-input" value={form.endereco} onChange={(e) => setForm((p) => ({ ...p, endereco: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>Complemento</label>
                <input className="modal-input" value={form.complemento} onChange={(e) => setForm((p) => ({ ...p, complemento: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>Bairro</label>
                <input className="modal-input" value={form.bairro} onChange={(e) => setForm((p) => ({ ...p, bairro: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>CEP</label>
                <input className="modal-input" value={form.cep} onChange={(e) => setForm((p) => ({ ...p, cep: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>Estado</label>
                <select className="modal-select" value={form.ufId} onChange={(e) => setForm((p) => ({ ...p, ufId: e.target.value, cidadeId: '' }))}>
                  <option value="">Selecione</option>
                  {estados.map((uf) => (
                    <option key={uf.id} value={String(uf.id)}>{uf.sigla || uf.estado}</option>
                  ))}
                </select>
              </div>
              <div className="modal-form-group">
                <label>Cidade</label>
                <select className="modal-select" value={form.cidadeId} onChange={(e) => setForm((p) => ({ ...p, cidadeId: e.target.value }))} required>
                  <option value="">Selecione</option>
                  {cidades.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.cidade || c.nome}</option>
                  ))}
                </select>
              </div>
              {formError && <p className="budgets-error modal-form-group-full">{formError}</p>}
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="agenda-primary-btn" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Agenda
