import { useEffect, useState } from 'react'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const EMPTY_FORM = { codigo: '', descricao: '', precoPorKg: '' }

function CoresAluminio() {
  const [cores, setCores] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCores = async (query = '', page = 0, size = pageSize) => {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const params = new URLSearchParams({ page, size })
      if (query.trim()) params.append('query', query.trim())
      const response = await fetch(`${API_BASE_URL}/api/cor-aluminio/paged?${params}`)
      if (!response.ok) throw new Error(`Falha ao carregar cores (${response.status})`)
      const data = await response.json()
      setCores(Array.isArray(data.content) ? data.content : [])
      setTotalPages(data.page?.totalPages || 0)
      setTotalElements(data.page?.totalElements || 0)
      setCurrentPage(page)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar cores')
      setCores([])
      setTotalPages(0)
      setTotalElements(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCores('', 0, pageSize)
  }, [])

  const handleSearch = () => {
    fetchCores(searchTerm, 0, pageSize)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchCores(searchTerm, newPage, pageSize)
    }
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    fetchCores(searchTerm, 0, newSize)
  }

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
      fetchCores(searchTerm, currentPage, pageSize)
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
      fetchCores(searchTerm, currentPage, pageSize)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao remover cor')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="app products-page">
      <Header />
      <main className="products-container">
        <header className="products-header">
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
        </header>

        <section className="products-filters">
          <div className="products-filter-group">
            <label htmlFor="cores-search">Busca:</label>
            <input
              id="cores-search"
              className="products-filter-input"
              type="text"
              placeholder="Codigo ou descricao"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            className="icon-button products-search-button"
            type="button"
            aria-label="Buscar"
            onClick={handleSearch}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                fill="currentColor"
              />
            </svg>
          </button>
        </section>

        <section className="products-card">
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
              {isLoading && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '16px' }}>
                    Carregando cores...
                  </td>
                </tr>
              )}
              {!isLoading && errorMessage && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: '16px' }}>
                    {errorMessage}
                  </td>
                </tr>
              )}
              {!isLoading && !errorMessage && cores.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: '16px' }}>
                    Nenhuma cor encontrada
                  </td>
                </tr>
              )}
              {!isLoading && !errorMessage && cores.map((cor) => (
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
              ))}
            </tbody>
          </table>

          <div className="pagination-container">
            <div className="pagination-info">
              <span>Itens por pagina:</span>
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
                  ? `${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, totalElements)} de ${totalElements}`
                  : '0 registros'}
              </span>
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-button"
                type="button"
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                aria-label="Primeira pagina"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z" fill="currentColor" />
                </svg>
              </button>
              <button
                className="pagination-button"
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                aria-label="Pagina anterior"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" fill="currentColor" />
                </svg>
              </button>
              <span className="pagination-page">
                Pagina {totalPages > 0 ? currentPage + 1 : 0} de {totalPages}
              </span>
              <button
                className="pagination-button"
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                aria-label="Proxima pagina"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor" />
                </svg>
              </button>
              <button
                className="pagination-button"
                type="button"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                aria-label="Ultima pagina"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
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
