import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import '../App.css'
import Header from './Header'
import AgendaNav from './AgendaNav'
import { apiFetch } from '../utils/api'

function getLoggedUser() {
  try { return JSON.parse(localStorage.getItem('squadra_user') || '{}') } catch { return {} }
}

function formatCurrency(value) {
  return (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('pt-BR')
}

function AgendaContato() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useMemo(() => getLoggedUser(), [])
  const isAdmin = user.permissaoId === 1

  const [contato, setContato] = useState(null)
  const [tiposAcao, setTiposAcao] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [estagios, setEstagios] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [tab, setTab] = useState('acoes')

  const [acaoModal, setAcaoModal] = useState(false)
  const [acaoForm, setAcaoForm] = useState({
    tipoAcaoId: '', dataPrevista: '', descricao: '', usuarioId: '',
    oportunidadeId: '', novaOportunidadeDescricao: '', novaOportunidadeProbFechamento: '', novaOportunidadeReceitaAnual: '',
  })
  const [comentarioModal, setComentarioModal] = useState(null)
  const [comentario, setComentario] = useState('')
  const [oppModal, setOppModal] = useState(false)
  const [oppForm, setOppForm] = useState({ oportunidade: '', probFechamento: '', receitaAnual: '' })
  const [editingOppId, setEditingOppId] = useState(null)

  const load = useCallback(async () => {
    try {
      const response = await apiFetch(`/api/agenda/contatos/${id}`)
      if (!response.ok) throw new Error('Contato não encontrado')
      setContato(await response.json())
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar contato')
      setContato(null)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    apiFetch('/api/agenda/tipos-acao').then((r) => r.ok ? r.json() : []).then(setTiposAcao).catch(() => setTiposAcao([]))
    apiFetch('/api/agenda/estagios').then((r) => r.ok ? r.json() : []).then(setEstagios).catch(() => setEstagios([]))
    apiFetch('/api/orcamentos/usuarios').then((r) => r.ok ? r.json() : []).then(setUsuarios).catch(() => setUsuarios([]))
  }, [])

  const alterarEstagio = async (estagioId) => {
    const response = await apiFetch(`/api/agenda/contatos/${id}/estagio`, {
      method: 'PUT', body: JSON.stringify({ estagioId: Number(estagioId) }),
    })
    if (response.ok) load()
  }

  const salvarAcao = async (e) => {
    e.preventDefault()
    const body = {
      tipoAcaoId: Number(acaoForm.tipoAcaoId),
      dataPrevista: acaoForm.dataPrevista ? (acaoForm.dataPrevista.length === 16 ? `${acaoForm.dataPrevista}:00` : acaoForm.dataPrevista) : null,
      descricao: acaoForm.descricao,
      usuarioId: acaoForm.usuarioId ? Number(acaoForm.usuarioId) : null,
      oportunidadeId: acaoForm.oportunidadeId ? Number(acaoForm.oportunidadeId) : null,
      novaOportunidadeDescricao: acaoForm.novaOportunidadeDescricao || null,
      novaOportunidadeProbFechamento: acaoForm.novaOportunidadeProbFechamento
        ? Number(String(acaoForm.novaOportunidadeProbFechamento).replace(',', '.')) : null,
      novaOportunidadeReceitaAnual: acaoForm.novaOportunidadeReceitaAnual
        ? Number(String(acaoForm.novaOportunidadeReceitaAnual).replace(/\./g, '').replace(',', '.')) : null,
    }
    const response = await apiFetch(`/api/agenda/contatos/${id}/acoes`, { method: 'POST', body: JSON.stringify(body) })
    if (!response.ok) {
      setErrorMessage('Falha ao criar ação')
      return
    }
    setAcaoModal(false)
    load()
  }

  const concluirAcao = async () => {
    if (!comentarioModal) return
    const response = await apiFetch(`/api/agenda/acoes/${comentarioModal}/concluir`, {
      method: 'POST', body: JSON.stringify({ comentario }),
    })
    if (response.ok) {
      setComentarioModal(null)
      setComentario('')
      load()
    }
  }

  const desfazerAcao = async (acaoId) => {
    const response = await apiFetch(`/api/agenda/acoes/${acaoId}/desfazer`, { method: 'POST' })
    if (response.ok) load()
  }

  const excluirAcao = async (acaoId) => {
    if (!window.confirm('Excluir esta ação?')) return
    const response = await apiFetch(`/api/agenda/acoes/${acaoId}`, { method: 'DELETE' })
    if (response.ok || response.status === 204) load()
  }

  const salvarOpp = async (e) => {
    e.preventDefault()
    const body = {
      oportunidade: oppForm.oportunidade,
      probFechamento: oppForm.probFechamento ? Number(oppForm.probFechamento) : 0,
      receitaAnual: oppForm.receitaAnual
        ? Number(String(oppForm.receitaAnual).replace(/\./g, '').replace(',', '.')) : 0,
    }
    const url = editingOppId
      ? `/api/agenda/oportunidades/${editingOppId}`
      : `/api/agenda/contatos/${id}/oportunidades`
    const response = await apiFetch(url, {
      method: editingOppId ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      setErrorMessage('Falha ao salvar oportunidade')
      return
    }
    setOppModal(false)
    setEditingOppId(null)
    load()
  }

  const excluirOpp = async (oppId) => {
    if (!window.confirm('Excluir esta oportunidade?')) return
    const response = await apiFetch(`/api/agenda/oportunidades/${oppId}`, { method: 'DELETE' })
    if (response.ok || response.status === 204) load()
  }

  if (!contato && !errorMessage) {
    return <div className="app budgets-page"><Header /><p className="budgets-loading">Carregando...</p></div>
  }

  return (
    <div className="app budgets-page">
      <Header />
      <main className="agenda-layout">
        <AgendaNav />
        <div className="agenda-content">
          <header className="budgets-header agenda-header-row">
            <div>
              <h1>{contato?.nome || 'Contato'}</h1>
              <span className="budgets-subtitle">
                {contato?.telefone} {contato?.email ? `| ${contato.email}` : ''} {contato?.cidadeNome ? `| ${contato.cidadeNome}` : ''}
              </span>
            </div>
            <button type="button" className="budgets-pagination-button" onClick={() => navigate('/Agenda')}>Voltar</button>
          </header>

          {errorMessage && <p className="budgets-error">{errorMessage}</p>}

          {contato && (
            <>
              <div className="agenda-detail-meta">
                <div>
                  <strong>Estágio:</strong>{' '}
                  <select value={String(contato.estagioId || '')} onChange={(e) => alterarEstagio(e.target.value)}>
                    {estagios.map((e) => <option key={e.id} value={String(e.id)}>{e.nome}</option>)}
                  </select>
                </div>
                <div><strong>Vendedor:</strong> {contato.vendedorNome}</div>
                <div>
                  <strong>Orçamento:</strong>{' '}
                  {contato.orcamentoId > 0
                    ? <Link to={`/Orcamentos/${contato.orcamentoId}`}>{contato.orcamentoId}</Link>
                    : '—'}
                </div>
                <div><strong>Faturamento:</strong> {formatCurrency(contato.faturamentoPonderado)}</div>
              </div>

              <div className="agenda-tabs">
                <button type="button" className={tab === 'acoes' ? 'active' : ''} onClick={() => setTab('acoes')}>Ações</button>
                <button type="button" className={tab === 'oportunidades' ? 'active' : ''} onClick={() => setTab('oportunidades')}>Oportunidades</button>
              </div>

              {tab === 'acoes' && (
                <>
                  <button type="button" className="agenda-primary-btn" style={{ marginBottom: 12 }} onClick={() => {
                    setAcaoForm({
                      tipoAcaoId: '', dataPrevista: '', descricao: '',
                      usuarioId: user.id ? String(user.id) : '',
                      oportunidadeId: '', novaOportunidadeDescricao: '',
                      novaOportunidadeProbFechamento: '', novaOportunidadeReceitaAnual: '',
                    })
                    setAcaoModal(true)
                  }}>+ Agendar Ação</button>
                  <div className="budgets-card">
                    <table className="budgets-table">
                      <thead>
                        <tr>
                          <th>Ação</th><th>Descrição</th><th>Data</th><th>Responsável</th><th>Sit.</th><th>#</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(contato.acoes || []).map((a) => (
                          <tr key={a.id}>
                            <td>{a.tipoAcaoNome}</td>
                            <td>{a.descricao}</td>
                            <td>{formatDateTime(a.data)}</td>
                            <td>{a.responsavelNome}</td>
                            <td>
                              {a.situacaoId === 2 ? (
                                <span className="agenda-situacao agenda-sit-concluida" title={a.comentario || 'Realizada'} />
                              ) : new Date(a.data) < new Date() ? (
                                <span className="agenda-situacao agenda-sit-atrasada" title="Atrasada" />
                              ) : (
                                <span className="agenda-situacao agenda-sit-pendente" title="Pendente" />
                              )}
                            </td>
                            <td>
                              {a.situacaoId !== 2 ? (
                                <button type="button" className="agenda-icon-btn" title="Concluir" onClick={() => { setComentarioModal(a.id); setComentario('') }}>✓</button>
                              ) : (
                                <button type="button" className="agenda-icon-btn" title="Desfazer" onClick={() => desfazerAcao(a.id)}>↺</button>
                              )}
                              <button type="button" className="agenda-icon-btn" title="Excluir" onClick={() => excluirAcao(a.id)}>🗑</button>
                            </td>
                          </tr>
                        ))}
                        {(contato.acoes || []).length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: 'center' }}>Nenhuma ação</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {tab === 'oportunidades' && (
                <>
                  <button type="button" className="agenda-primary-btn" style={{ marginBottom: 12 }} onClick={() => {
                    setEditingOppId(null)
                    setOppForm({ oportunidade: '', probFechamento: '', receitaAnual: '' })
                    setOppModal(true)
                  }}>+ Adicionar Oportunidade</button>
                  <div className="budgets-card">
                    <table className="budgets-table">
                      <thead>
                        <tr>
                          <th>Oportunidade</th><th>Prob. %</th><th>Receita Anual</th><th>#</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(contato.oportunidades || []).map((o) => (
                          <tr key={o.id}>
                            <td>{o.oportunidade}</td>
                            <td>{o.probFechamento}</td>
                            <td>{formatCurrency(o.receitaAnual)}</td>
                            <td>
                              <button type="button" className="agenda-icon-btn" onClick={() => {
                                setEditingOppId(o.id)
                                setOppForm({
                                  oportunidade: o.oportunidade || '',
                                  probFechamento: o.probFechamento != null ? String(o.probFechamento) : '',
                                  receitaAnual: o.receitaAnual != null ? String(o.receitaAnual) : '',
                                })
                                setOppModal(true)
                              }}>✎</button>
                              <button type="button" className="agenda-icon-btn" onClick={() => excluirOpp(o.id)}>🗑</button>
                            </td>
                          </tr>
                        ))}
                        {(contato.oportunidades || []).length === 0 && (
                          <tr><td colSpan={4} style={{ textAlign: 'center' }}>Nenhuma oportunidade</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {acaoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Agendar Ação</h2>
              <button type="button" className="users-modal-close" onClick={() => setAcaoModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={salvarAcao}>
              <div className="modal-form-group">
                <label>Tipo</label>
                <select className="modal-select" required value={acaoForm.tipoAcaoId} onChange={(e) => setAcaoForm((p) => ({ ...p, tipoAcaoId: e.target.value }))}>
                  <option value="">Selecione</option>
                  {tiposAcao.map((t) => <option key={t.id} value={String(t.id)}>{t.nome}</option>)}
                </select>
              </div>
              {isAdmin && (
                <div className="modal-form-group">
                  <label>Responsável</label>
                  <select className="modal-select" value={acaoForm.usuarioId} onChange={(e) => setAcaoForm((p) => ({ ...p, usuarioId: e.target.value }))}>
                    {usuarios.map((u) => <option key={u.id} value={String(u.id)}>{u.nome}</option>)}
                  </select>
                </div>
              )}
              <div className="modal-form-group">
                <label>Data/Hora</label>
                <input type="datetime-local" className="modal-input" required value={acaoForm.dataPrevista} onChange={(e) => setAcaoForm((p) => ({ ...p, dataPrevista: e.target.value }))} />
              </div>
              <div className="modal-form-group modal-form-group-full">
                <label>Descrição</label>
                <textarea className="modal-input" rows={3} value={acaoForm.descricao} onChange={(e) => setAcaoForm((p) => ({ ...p, descricao: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>Oportunidade existente</label>
                <select className="modal-select" value={acaoForm.oportunidadeId} onChange={(e) => setAcaoForm((p) => ({ ...p, oportunidadeId: e.target.value }))}>
                  <option value="">Nenhuma</option>
                  {(contato?.oportunidades || []).map((o) => (
                    <option key={o.id} value={String(o.id)}>{o.oportunidade}</option>
                  ))}
                </select>
              </div>
              <div className="modal-form-group modal-form-group-full">
                <label>Ou nova oportunidade</label>
                <input className="modal-input" placeholder="Descrição" value={acaoForm.novaOportunidadeDescricao} onChange={(e) => setAcaoForm((p) => ({ ...p, novaOportunidadeDescricao: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setAcaoModal(false)}>Cancelar</button>
                <button type="submit" className="agenda-primary-btn">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <button type="button" className="agenda-primary-btn" onClick={concluirAcao}>Concluir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {oppModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingOppId ? 'Editar Oportunidade' : 'Nova Oportunidade'}</h2>
              <button type="button" className="users-modal-close" onClick={() => setOppModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={salvarOpp}>
              <div className="modal-form-group modal-form-group-full">
                <label>Descrição</label>
                <input className="modal-input" required value={oppForm.oportunidade} onChange={(e) => setOppForm((p) => ({ ...p, oportunidade: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>Probabilidade (%)</label>
                <input className="modal-input" value={oppForm.probFechamento} onChange={(e) => setOppForm((p) => ({ ...p, probFechamento: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>Receita Anual</label>
                <input className="modal-input" value={oppForm.receitaAnual} onChange={(e) => setOppForm((p) => ({ ...p, receitaAnual: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setOppModal(false)}>Cancelar</button>
                <button type="submit" className="agenda-primary-btn">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgendaContato
