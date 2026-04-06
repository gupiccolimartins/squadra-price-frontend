import { useEffect, useState } from 'react'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const DEFAULT_PAGE_SIZE = 10

function Vidros() {
  const [glasses, setGlasses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [nameInput, setNameInput] = useState('')
  const [statusInput, setStatusInput] = useState('Ativo')
  const [filters, setFilters] = useState({
    name: '',
    status: 'Ativo',
  })

  useEffect(() => {
    let isMounted = true

    const loadGlasses = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams({
          page: String(currentPage),
          size: String(pageSize),
        })
        if (filters.name) {
          params.set('name', filters.name)
        }
        if (filters.status) {
          params.set('status', filters.status)
        }

        const response = await fetch(`${API_BASE_URL}/api/vidros?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`Falha ao buscar vidros (${response.status})`)
        }

        const data = await response.json()
        const pageData = data.page ?? {}
        if (isMounted) {
          setGlasses(Array.isArray(data.content) ? data.content : [])
          setTotalElements(data.totalElements ?? pageData.totalElements ?? 0)
          setTotalPages(pageData.totalPages ?? 0)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setGlasses([])
          setTotalElements(0)
          setTotalPages(0)
          setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar vidros')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadGlasses()

    return () => {
      isMounted = false
    }
  }, [filters, currentPage, pageSize])

  const handleSearch = () => {
    setCurrentPage(0)
    setFilters({
      name: nameInput.trim(),
      status: statusInput,
    })
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setCurrentPage(0)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="app glass-page">
      <Header />
      <main className="glass-container">
        <header className="glass-header">
          <div>
            <h1>Vidros</h1>
            <span className="glass-subtitle">Criar Vidro</span>
          </div>
        </header>

        <section className="glass-filters">
          <span className="glass-search-label">Busca:</span>
          <input
            className="glass-filter-input"
            type="text"
            placeholder="Nome do Vidro"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
          />
          <select
            className="glass-filter-select"
            value={statusInput}
            onChange={(event) => setStatusInput(event.target.value)}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
          <button
            className="icon-button glass-search-button"
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

        <div className="glass-summary">
          {isLoading
            ? 'Carregando vidros...'
            : totalElements > 0
              ? `Mostrando: ${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, totalElements)} de ${totalElements}`
              : '0 registros'}
        </div>

        <section className="glass-card">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Nome</th>
                <th>Preco</th>
                <th>Status</th>
                <th>Ordenacao</th>
                <th>Fornecedor</th>
                <th>Data de Criacao</th>
                <th>Data de Modificacao</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9}>Carregando vidros...</td>
                </tr>
              )}
              {!isLoading && errorMessage && (
                <tr>
                  <td colSpan={9}>{errorMessage}</td>
                </tr>
              )}
              {!isLoading && !errorMessage && glasses.length === 0 && (
                <tr>
                  <td colSpan={9}>Nenhum vidro encontrado.</td>
                </tr>
              )}
              {!isLoading &&
                !errorMessage &&
                glasses.map((glass) => (
                  <tr key={glass.id}>
                    <td>{glass.id}</td>
                    <td>{glass.name}</td>
                    <td>{glass.price}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          glass.status === 'Ativo' ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {glass.status}
                      </span>
                    </td>
                    <td>{glass.order}</td>
                    <td>{glass.supplier}</td>
                    <td>{glass.createdAt}</td>
                    <td>{glass.updatedAt}</td>
                    <td className="glass-actions">
                      <button className="icon-button edit-button" type="button" aria-label="Editar">
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
              <span>Itens por página:</span>
              <select
                className="pagination-select"
                value={pageSize}
                onChange={(event) => handlePageSizeChange(Number(event.target.value))}
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
      </main>
    </div>
  )
}

export default Vidros
