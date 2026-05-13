import { useEffect, useMemo, useState } from 'react'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const STATUS_OPTIONS = [
  { value: 1, label: 'Ativo' },
  { value: 2, label: 'Inativo' },
]

const EMPTY_FORM = { name: '', statusId: 1 }

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  const loadFornecedores = async (page, size) => {
    let isMounted = true
    try {
      setIsLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/api/fornecedores?page=${page}&size=${size}`
      )
      if (!response.ok) {
        throw new Error(`Falha ao buscar fornecedores (${response.status})`)
      }
      const data = await response.json()
      if (isMounted) {
        setFornecedores(Array.isArray(data.content) ? data.content : [])
        setTotalPages(data.totalPages ?? data.page?.totalPages ?? 0)
        setTotalElements(data.totalElements ?? data.page?.totalElements ?? 0)
        setErrorMessage('')
      }
    } catch (error) {
      if (isMounted) {
        setFornecedores([])
        setTotalPages(0)
        setTotalElements(0)
        setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar fornecedores')
      }
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
    return () => { isMounted = false }
  }

  useEffect(() => {
    loadFornecedores(currentPage, pageSize)
  }, [currentPage, pageSize])

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setCurrentPage(0)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  const filteredFornecedores = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    if (!normalized) return fornecedores
    return fornecedores.filter((f) => f.name.toLowerCase().includes(normalized))
  }, [searchTerm, fornecedores])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsEditMode(false)
    setEditingId(null)
    resetForm()
  }

  const handleFormChange = (field) => (event) => {
    const value = field === 'statusId' ? Number(event.target.value) : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateClick = () => {
    resetForm()
    setIsEditMode(false)
    setEditingId(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (fornecedor) => {
    setForm({
      name: fornecedor.name ?? '',
      statusId: fornecedor.statusId ?? 1,
    })
    setFormError('')
    setEditingId(fornecedor.id)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setFormError('Nome é obrigatório')
      return
    }
    setIsSaving(true)
    setFormError('')
    try {
      const url = isEditMode
        ? `${API_BASE_URL}/api/fornecedores/${editingId}`
        : `${API_BASE_URL}/api/fornecedores`
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), statusId: form.statusId }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || (isEditMode ? `Falha ao editar fornecedor (${response.status})` : `Falha ao criar fornecedor (${response.status})`))
      }
      const saved = await response.json()
      if (isEditMode) {
        setFornecedores((prev) => prev.map((f) => (f.id === saved.id ? saved : f)))
      } else {
        await loadFornecedores(currentPage, pageSize)
      }
      closeModal()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Erro ao salvar fornecedor')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="locations-page">
      <Header />

      <main className="locations-container">
        <header className="locations-header">
          <h1>
            Fornecedores |{' '}
            <button
              className="users-create-link"
              type="button"
              onClick={handleCreateClick}
            >
              Criar Fornecedor
            </button>
          </h1>
        </header>

        <section className="locations-search" aria-label="Buscar fornecedores">
          <label htmlFor="fornecedores-search-input">Busca:</label>
          <input
            id="fornecedores-search-input"
            className="locations-search-input"
            type="text"
            placeholder="Nome do Fornecedor"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button className="icon-button locations-search-button" type="button" aria-label="Buscar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                fill="currentColor"
              />
            </svg>
          </button>
        </section>

        <section className="locations-card">
          <table className="locations-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Nome</th>
                <th>Status</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="locations-empty">
                    Carregando fornecedores...
                  </td>
                </tr>
              )}
              {!isLoading && errorMessage && (
                <tr>
                  <td colSpan={4} className="locations-empty">
                    {errorMessage}
                  </td>
                </tr>
              )}
              {!isLoading && !errorMessage && filteredFornecedores.length === 0 && (
                <tr>
                  <td colSpan={4} className="locations-empty">
                    Nenhum fornecedor encontrado.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !errorMessage &&
                filteredFornecedores.map((fornecedor) => (
                  <tr key={fornecedor.id}>
                    <td>{fornecedor.id}</td>
                    <td>{fornecedor.name}</td>
                    <td>{fornecedor.statusId === 1 ? 'Ativo' : fornecedor.statusId === 2 ? 'Inativo' : '—'}</td>
                    <td className="locations-actions">
                      <button
                        className="icon-button edit-button"
                        type="button"
                        aria-label="Editar"
                        onClick={() => handleEditClick(fornecedor)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.47-8.47.92.92-8.47 8.47zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.75 1.75 3.75 3.75 1.75-1.75z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
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
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content users-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="users-modal-header">
              <h2>{isEditMode ? 'Editar Fornecedor' : 'Criar Fornecedor'}</h2>
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
              <label className="users-modal-field" style={{ gridColumn: '1 / -1' }}>
                Nome
                <input
                  className="modal-input"
                  type="text"
                  placeholder="Nome do Fornecedor"
                  value={form.name}
                  onChange={handleFormChange('name')}
                  autoFocus
                />
              </label>
              <label className="users-modal-field" style={{ gridColumn: '1 / -1' }}>
                Status
                <select
                  className="modal-input"
                  value={form.statusId}
                  onChange={handleFormChange('statusId')}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              {formError && <p className="users-modal-error" style={{ gridColumn: '1 / -1' }}>{formError}</p>}
              <div className="users-modal-actions">
                <button className="primary-button" type="submit" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Fornecedores
