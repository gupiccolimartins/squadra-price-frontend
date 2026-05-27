import { useEffect, useState } from 'react'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const EMPTY_FORM = { codigo: '', descricao: '', precoPorKg: '' }

function CoresAluminio() {
  const [cores, setCores] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchText, setSearchText] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadCores = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const response = await fetch(`${API_BASE_URL}/api/cor-aluminio`)
      if (!response.ok) throw new Error(`Falha ao carregar cores (${response.status})`)
      const data = await response.json()
      setCores(Array.isArray(data) ? data : [])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar cores')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCores()
  }, [])

  const filteredCores = cores.filter((c) => {
    const q = searchText.trim().toLowerCase()
    if (!q) return true
    return c.descricao.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q)
  })

  const openCreateModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (cor) => {
    setEditingId(cor.id)
    setForm({ codigo: cor.codigo, descricao: cor.descricao, precoPorKg: String(cor.precoPorKg) })
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.codigo.trim()) { setFormError('Informe o codigo'); return }
    if (!form.descricao.trim()) { setFormError('Informe a descricao'); return }
    const preco = Number.parseFloat(form.precoPorKg)
    if (!form.precoPorKg || Number.isNaN(preco) || preco <= 0) {
      setFormError('Informe um preco por kg valido')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')
      const body = { codigo: form.codigo.trim(), descricao: form.descricao.trim(), precoPorKg: preco }
      const url = editingId
        ? `${API_BASE_URL}/api/cor-aluminio/${editingId}`
        : `${API_BASE_URL}/api/cor-aluminio`
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const msg = await response.text()
        throw new Error(msg || 'Erro ao salvar')
      }
      closeModal()
      await loadCores()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Erro ao salvar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setDeleting(true)
      const response = await fetch(`${API_BASE_URL}/api/cor-aluminio/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const msg = await response.text()
        throw new Error(msg || 'Erro ao remover')
      }
      setDeleteConfirmId(null)
      await loadCores()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao remover cor')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="app users-page">
      <Header />
      <main className="users-container">
        <header className="users-header">
          <div>
            <h1>
              Cores de Aluminio |{' '}
              <button
                className="users-create-link"
                type="button"
                onClick={openCreateModal}
              >
                Nova Cor
              </button>
            </h1>
          </div>
          <input
            type="text"
            className="modal-input"
            style={{ maxWidth: 280, fontWeight: 400, fontSize: 14 }}
            placeholder="Buscar por codigo ou descricao..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </header>

        <section className="users-card">
          {isLoading ? (
            <p>Carregando cores...</p>
          ) : errorMessage ? (
            <p>{errorMessage}</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Descricao</th>
                  <th>Preco/kg (RS)</th>
                  <th>#</th>
                </tr>
              </thead>
              <tbody>
                {filteredCores.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: '16px' }}>
                      Nenhuma cor encontrada
                    </td>
                  </tr>
                ) : (
                  filteredCores.map((cor) => (
                    <tr key={cor.id}>
                      <td>{cor.codigo}</td>
                      <td>{cor.descricao}</td>
                      <td>{cor.precoPorKg.toFixed(2)}</td>
                      <td>
                        {deleteConfirmId === cor.id ? (
                          <span className="inline-confirm">
                            Remover?{' '}
                            <button
                              type="button"
                              className="icon-button icon-button-danger"
                              onClick={() => handleDelete(cor.id)}
                              disabled={deleting}
                              aria-label="Confirmar remocao"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() => setDeleteConfirmId(null)}
                              disabled={deleting}
                              aria-label="Cancelar remocao"
                            >
                              Nao
                            </button>
                          </span>
                        ) : (
                          <>
                            <button
                              className="icon-button edit-button"
                              type="button"
                              aria-label="Editar"
                              onClick={() => openEditModal(cor)}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.47-8.47.92.92-8.47 8.47zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.75 1.75 3.75 3.75 1.75-1.75z"
                                  fill="currentColor"
                                />
                              </svg>
                            </button>
                            <button
                              className="icon-button icon-button-danger"
                              type="button"
                              aria-label="Remover"
                              onClick={() => setDeleteConfirmId(cor.id)}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"
                                  fill="currentColor"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>

        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content users-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="users-modal-header">
                <h2>{editingId ? 'Editar Cor' : 'Nova Cor de Aluminio'}</h2>
                <button
                  className="users-modal-close"
                  type="button"
                  onClick={closeModal}
                  aria-label="Fechar modal"
                >
                  X
                </button>
              </div>
              <form className="users-modal-form" onSubmit={handleSubmit}>
                <label className="users-modal-field">
                  Codigo *
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="Ex: PBCB"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    maxLength={20}
                  />
                </label>
                <label className="users-modal-field">
                  Preco/kg (RS) *
                  <input
                    className="modal-input"
                    type="number"
                    placeholder="Ex: 41.02"
                    value={form.precoPorKg}
                    onChange={(e) => setForm({ ...form, precoPorKg: e.target.value })}
                    step="0.01"
                    min="0.01"
                  />
                </label>
                <label className="users-modal-field users-modal-left" style={{ gridColumn: '1 / -1' }}>
                  Descricao *
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="Ex: PINT. BRANCO RAL 9003 BRILHANTE"
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    maxLength={200}
                  />
                </label>
                {formError && <p className="users-modal-error">{formError}</p>}
                <div className="users-modal-actions">
                  <button className="primary-button" type="submit" disabled={submitting}>
                    {submitting ? 'Salvando...' : editingId ? 'Editar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CoresAluminio
