import { useEffect, useState } from 'react'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function Usuarios() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [createError, setCreateError] = useState('')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Administrador',
    login: '',
    password: '',
  })

  useEffect(() => {
    let isMounted = true

    const loadUsers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${API_BASE_URL}/api/users?page=${currentPage}&size=${pageSize}`
        )
        if (!response.ok) {
          throw new Error(`Falha ao buscar usuarios (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setUsers(Array.isArray(data.content) ? data.content : [])
          setTotalPages(data.page?.totalPages || 0)
          setTotalElements(data.page?.totalElements || 0)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setUsers([])
          setTotalPages(0)
          setTotalElements(0)
          setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar usuarios')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      isMounted = false
    }
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

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      phone: '',
      email: '',
      role: 'Administrador',
      login: '',
      password: '',
    })
    setCreateError('')
  }

  const closeModal = () => {
    setIsCreateOpen(false)
    setIsEditMode(false)
    setEditingUserId(null)
    resetCreateForm()
  }

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) {
      return digits
    }
    if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const handleCreateChange = (field) => (event) => {
    if (field === 'phone') {
      const formatted = formatPhone(event.target.value)
      setCreateForm((prev) => ({
        ...prev,
        phone: formatted,
      }))
      return
    }
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
        ? `${API_BASE_URL}/api/users/${editingUserId}`
        : `${API_BASE_URL}/api/users`
      const response = await fetch(endpoint, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      })
      if (!response.ok) {
        throw new Error(
          isEditMode
            ? `Falha ao editar usuario (${response.status})`
            : `Falha ao criar usuario (${response.status})`
        )
      }
      const savedUser = await response.json()
      if (isEditMode) {
        setUsers((prev) => prev.map((user) => (user.id === savedUser.id ? savedUser : user)))
      } else {
        // Reload page to get updated data with pagination
        setCurrentPage(0)
      }
      closeModal()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Erro ao salvar usuario')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditClick = (user) => {
    setCreateForm({
      name: user.name ?? '',
      phone: user.phone ?? '',
      email: user.email ?? '',
      role: user.role ?? 'Administrador',
      login: user.login ?? '',
      password: '',
    })
    setCreateError('')
    setEditingUserId(user.id)
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
              Usuarios |{' '}
                <button
                  className="users-create-link"
                  type="button"
                  onClick={() => {
                    resetCreateForm()
                    setIsEditMode(false)
                    setEditingUserId(null)
                    setIsCreateOpen(true)
                  }}
                >
                Criar Usuário
              </button>
            </h1>
          </div>
        </header>

        <section className="users-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Nome</th>
                <th>Login</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Nivel</th>
                <th>Ultimo Login</th>
                <th>Criado em</th>
                <th>Status</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={11}>Carregando usuarios...</td>
                </tr>
              )}
              {!isLoading && errorMessage && (
                <tr>
                  <td colSpan={11}>{errorMessage}</td>
                </tr>
              )}
              {!isLoading && !errorMessage && users.length === 0 && (
                <tr>
                  <td colSpan={11}>Nenhum usuario encontrado.</td>
                </tr>
              )}
              {!isLoading &&
                !errorMessage &&
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.login}</td>
                    <td>{user.phone}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.lastLogin}</td>
                    <td>{user.createdAt}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.status === 'Ativo' ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="icon-button edit-button"
                        type="button"
                        aria-label="Editar"
                        onClick={() => handleEditClick(user)}
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

          {/* Pagination Controls */}
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
                aria-label="Primeira página"
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
                aria-label="Página anterior"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" fill="currentColor" />
                </svg>
              </button>
              <span className="pagination-page">
                Página {totalPages > 0 ? currentPage + 1 : 0} de {totalPages}
              </span>
              <button
                className="pagination-button"
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
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
                disabled={currentPage >= totalPages - 1}
                aria-label="Última página"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {isCreateOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content users-modal-content" onClick={(event) => event.stopPropagation()}>
              <div className="users-modal-header">
                <h2>Dados do Usuário</h2>
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
                  Nome do Usuário
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="Nome do Usuário"
                    value={createForm.name}
                    onChange={handleCreateChange('name')}
                  />
                </label>
                <label className="users-modal-field">
                  Telefone
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="Telefone"
                    value={createForm.phone}
                    onChange={handleCreateChange('phone')}
                    maxLength={15}
                  />
                </label>
                <label className="users-modal-field">
                  Email
                  <input
                    className="modal-input"
                    type="email"
                    placeholder="Email"
                    value={createForm.email}
                    onChange={handleCreateChange('email')}
                  />
                </label>
                <label className="users-modal-field">
                  Nivel
                  <select className="modal-select" value={createForm.role} onChange={handleCreateChange('role')}>
                    <option value="Administrador">Administrador</option>
                    <option value="Representante">Representante</option>
                  </select>
                </label>
                <label className="users-modal-field users-modal-left">
                  Login
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="Login"
                    value={createForm.login}
                    onChange={handleCreateChange('login')}
                  />
                </label>
                <label className="users-modal-field">
                  Senha
                  <input
                    className="modal-input"
                    type="password"
                    placeholder="Senha"
                    value={createForm.password}
                    onChange={handleCreateChange('password')}
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

export default Usuarios
