import { useEffect, useState } from 'react'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function Insumos() {
  const [supplies, setSupplies] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [codeFilter, setCodeFilter] = useState('')
  const [descriptionFilter, setDescriptionFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const fetchSupplies = async (filters = {}, page = 0) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filters.code) {
        params.set('code', filters.code)
      }
      if (filters.description) {
        params.set('description', filters.description)
      }
      if (filters.categoryId) {
        params.set('categoryId', filters.categoryId)
      }
      if (filters.supplierId) {
        params.set('supplierId', filters.supplierId)
      }
      if (filters.status) {
        params.set('status', filters.status)
      }

      const query = params.toString()
      const url = query
        ? `${API_BASE_URL}/api/insumos/search?${query}`
        : `${API_BASE_URL}/api/insumos?page=${page}&size=${pageSize}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Falha ao buscar insumos (${response.status})`)
      }
      const data = await response.json()
      
      // Handle paginated response
      if (data.content) {
        setSupplies(Array.isArray(data.content) ? data.content : [])
        setTotalPages(data.page?.totalPages || 0)
        setTotalElements(data.page?.totalElements || 0)
        setCurrentPage(page)
      } else {
        // Handle non-paginated response (search endpoint)
        setSupplies(Array.isArray(data) ? data : [])
        setTotalPages(1)
        setTotalElements(Array.isArray(data) ? data.length : 0)
        setCurrentPage(0)
      }
      setErrorMessage('')
    } catch (error) {
      setSupplies([])
      setTotalPages(0)
      setTotalElements(0)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar insumos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadSupplies = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${API_BASE_URL}/api/insumos?page=${currentPage}&size=${pageSize}`
        )
        if (!response.ok) {
          throw new Error(`Falha ao buscar insumos (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setSupplies(Array.isArray(data.content) ? data.content : [])
          setTotalPages(data.page?.totalPages || 0)
          setTotalElements(data.page?.totalElements || 0)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setSupplies([])
          setTotalPages(0)
          setTotalElements(0)
          setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar insumos')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSupplies()

    return () => {
      isMounted = false
    }
  }, [currentPage, pageSize])

  useEffect(() => {
    let isMounted = true

    const loadFilters = async () => {
      try {
        const [categoriesResponse, suppliersResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/insumos/categories`),
          fetch(`${API_BASE_URL}/api/insumos/fornecedores`),
        ])

        if (!categoriesResponse.ok) {
          throw new Error(`Falha ao buscar categorias (${categoriesResponse.status})`)
        }
        if (!suppliersResponse.ok) {
          throw new Error(`Falha ao buscar fornecedores (${suppliersResponse.status})`)
        }

        const [categoriesData, suppliersData] = await Promise.all([
          categoriesResponse.json(),
          suppliersResponse.json(),
        ])

        if (isMounted) {
          setCategories(Array.isArray(categoriesData) ? categoriesData : [])
          setSuppliers(Array.isArray(suppliersData) ? suppliersData : [])
        }
      } catch (error) {
        if (isMounted) {
          setCategories([])
          setSuppliers([])
        }
      }
    }

    loadFilters()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSearch = () => {
    setCurrentPage(0) // Reset to first page on new search
    const statusValue = statusFilter ? statusFilter.toUpperCase() : ''
    fetchSupplies({
      code: codeFilter.trim(),
      description: descriptionFilter.trim(),
      categoryId: categoryFilter,
      supplierId: supplierFilter,
      status: statusValue,
    }, 0)
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setCurrentPage(0) // Reset to first page when changing page size
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="app supplies-page">
      <Header />
      <main className="supplies-container">
        <header className="supplies-header">
          <div>
            <h1>Insumos</h1>
            <span className="supplies-subtitle">Criar Insumo</span>
          </div>
        </header>

        <section className="supplies-filters">
          <div className="supplies-filter-group">
            <label htmlFor="supplies-code">Codigo do Insumo</label>
            <input
              id="supplies-code"
              className="supplies-filter-input"
              type="text"
              placeholder="Codigo do Insumo"
              value={codeFilter}
              onChange={(event) => setCodeFilter(event.target.value)}
            />
          </div>
          <div className="supplies-filter-group">
            <label htmlFor="supplies-description">Descricao</label>
            <input
              id="supplies-description"
              className="supplies-filter-input"
              type="text"
              placeholder="Descricao"
              value={descriptionFilter}
              onChange={(event) => setDescriptionFilter(event.target.value)}
            />
          </div>
          <div className="supplies-filter-group">
            <label htmlFor="supplies-category">Categorias</label>
            <select
              id="supplies-category"
              className="supplies-filter-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="supplies-filter-group">
            <label htmlFor="supplies-supplier">Fornecedores</label>
            <select
              id="supplies-supplier"
              className="supplies-filter-select"
              value={supplierFilter}
              onChange={(event) => setSupplierFilter(event.target.value)}
            >
              <option value="">Selecione</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="supplies-filter-group">
            <label htmlFor="supplies-status">Status</label>
            <select
              id="supplies-status"
              className="supplies-filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Selecione</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          <button
            className="icon-button supplies-search-button"
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

        <section className="supplies-card">
          <table className="supplies-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Codigo</th>
                <th>Preco</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th>Data Criacao</th>
                <th>Data Alteracao</th>
                <th>Status</th>
                <th>Descricao</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={10}>Carregando insumos...</td>
                </tr>
              )}
              {!isLoading && errorMessage && (
                <tr>
                  <td colSpan={10}>{errorMessage}</td>
                </tr>
              )}
              {!isLoading && !errorMessage && supplies.length === 0 && (
                <tr>
                  <td colSpan={10}>Nenhum insumo encontrado.</td>
                </tr>
              )}
              {supplies.map((supply) => (
                <tr key={supply.id}>
                  <td>{supply.id}</td>
                  <td>{supply.code}</td>
                  <td>{supply.price}</td>
                  <td>{supply.category}</td>
                  <td>{supply.supplier}</td>
                  <td>{supply.createdAt}</td>
                  <td>{supply.updatedAt}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        supply.status === 'Ativo' ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      {supply.status}
                    </span>
                  </td>
                  <td className="supplies-description">{supply.description}</td>
                  <td className="supplies-actions">
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

export default Insumos
