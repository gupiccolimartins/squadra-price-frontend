import { useEffect, useState } from 'react'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function Constantes() {
  const [constants, setConstants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingConstanteId, setEditingConstanteId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createForm, setCreateForm] = useState({
    name: '',
    value: '',
    note: '',
  })

  useEffect(() => {
    let isMounted = true

    const loadConstantes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/constantes`)
        if (!response.ok) {
          throw new Error(`Falha ao buscar constantes (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setConstants(Array.isArray(data) ? data : [])
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setConstants([])
          setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar constantes')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadConstantes()

    return () => {
      isMounted = false
    }
  }, [])

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      value: '',
      note: '',
    })
    setCreateError('')
  }

  const closeModal = () => {
    setIsCreateOpen(false)
    setIsEditMode(false)
    setEditingConstanteId(null)
    resetCreateForm()
  }

  const handleCreateChange = (field) => (event) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleCreateSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setCreateError('')
    try {
      const endpoint = isEditMode
        ? `${API_BASE_URL}/api/constantes/${editingConstanteId}`
        : `${API_BASE_URL}/api/constantes`
      const response = await fetch(endpoint, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createForm.name,
          value: createForm.value === '' ? null : Number(createForm.value),
          note: createForm.note,
        }),
      })
      if (!response.ok) {
        throw new Error(
          isEditMode
            ? `Falha ao editar constante (${response.status})`
            : `Falha ao criar constante (${response.status})`
        )
      }
      const savedConstante = await response.json()
      if (isEditMode) {
        setConstants((prev) =>
          prev.map((constant) => (constant.id === savedConstante.id ? savedConstante : constant))
        )
      } else {
        setConstants((prev) => [...prev, savedConstante])
      }
      closeModal()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Erro ao salvar constante')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditClick = (constant) => {
    setCreateForm({
      name: constant.name ?? '',
      value: constant.value ?? '',
      note: constant.note ?? '',
    })
    setCreateError('')
    setEditingConstanteId(constant.id)
    setIsEditMode(true)
    setIsCreateOpen(true)
  }

  return (
    <div className="app users-page">
      <Header />
      <main className="users-container">
        <header className="users-header">
          <div>
            <h1>
              Constantes |{' '}
              <button
                className="users-create-link"
                type="button"
                onClick={() => {
                  resetCreateForm()
                  setIsEditMode(false)
                  setEditingConstanteId(null)
                  setIsCreateOpen(true)
                }}
              >
                Criar Constante
              </button>
            </h1>
          </div>
        </header>

        <section className="users-card">
          {isLoading ? (
            <p>Carregando constantes...</p>
          ) : errorMessage ? (
            <p>{errorMessage}</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Nome</th>
                  <th>Valor</th>
                  <th>Obs</th>
                  <th>#</th>
                </tr>
              </thead>
              <tbody>
                {constants.map((constant) => (
                  <tr key={constant.id}>
                    <td>{constant.id}</td>
                    <td>{constant.name}</td>
                    <td>{constant.value}</td>
                    <td>{constant.note}</td>
                    <td>
                      <button
                        className="icon-button edit-button"
                        type="button"
                        aria-label="Editar"
                        onClick={() => handleEditClick(constant)}
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
          )}
        </section>

        {isCreateOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content users-modal-content" onClick={(event) => event.stopPropagation()}>
              <div className="users-modal-header">
                <h2>Dados da Constante</h2>
                <button
                  className="users-modal-close"
                  type="button"
                  onClick={closeModal}
                  aria-label="Fechar modal"
                >
                  X
                </button>
              </div>
              <form className="users-modal-form" onSubmit={handleCreateSubmit}>
                <label className="users-modal-field">
                  Constante
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="Nome da Constante"
                    value={createForm.name}
                    onChange={handleCreateChange('name')}
                  />
                </label>
                <label className="users-modal-field">
                  Valor
                  <input
                    className="modal-input"
                    type="number"
                    placeholder="Valor"
                    value={createForm.value}
                    onChange={handleCreateChange('value')}
                    step="0.01"
                  />
                </label>
                <label className="users-modal-field users-modal-left" style={{ gridColumn: '1 / -1' }}>
                  Obs.
                  <textarea
                    className="modal-input"
                    placeholder="Observações"
                    value={createForm.note}
                    onChange={handleCreateChange('note')}
                    rows={4}
                  />
                </label>
                {createError && <p className="users-modal-error">{createError}</p>}
                <div className="users-modal-actions">
                  <button className="primary-button" type="submit" disabled={isSaving}>
                    {isSaving ? 'Salvando...' : isEditMode ? 'Editar' : 'Criar'}
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

export default Constantes
