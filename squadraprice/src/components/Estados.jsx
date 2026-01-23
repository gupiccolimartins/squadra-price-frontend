import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function Estados() {
  const [states, setStates] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadStates = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${API_BASE_URL}/api/cidades-estados/estados?page=${currentPage}&size=${pageSize}`
        )
        if (!response.ok) {
          throw new Error(`Falha ao buscar estados (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setStates(Array.isArray(data.content) ? data.content : [])
          setTotalPages(data.page?.totalPages || 0)
          setTotalElements(data.page?.totalElements || 0)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setStates([])
          setTotalPages(0)
          setTotalElements(0)
          setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar estados')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStates()

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

  const filteredStates = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    if (!normalized) {
      return states
    }
    return states.filter((state) => state.estado.toLowerCase().includes(normalized))
  }, [searchTerm, states])

  return (
    <div className="locations-page">
      <Header />

      <main className="locations-container">
        <header className="locations-header">
          <h1>
            Estados <span className="locations-divider">|</span>{' '}
            <Link className="locations-title-link" to="/Cidades">
              Cidades
            </Link>
          </h1>
        </header>

        <section className="locations-search" aria-label="Buscar estados">
          <label htmlFor="states-search-input">Busca:</label>
          <input
            id="states-search-input"
            className="locations-search-input"
            type="text"
            placeholder="Nome do Estado"
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
                <th>Estado</th>
                <th>Sigla</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="locations-empty">
                    Carregando estados...
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
              {!isLoading && !errorMessage && filteredStates.length === 0 && (
                <tr>
                  <td colSpan={4} className="locations-empty">
                    Nenhum estado encontrado.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !errorMessage &&
                filteredStates.map((state) => (
                  <tr key={state.id}>
                    <td>{state.id}</td>
                    <td>{state.estado}</td>
                    <td>{state.sigla}</td>
                    <td className="locations-actions">
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
      </main>
    </div>
  )
}

export default Estados
