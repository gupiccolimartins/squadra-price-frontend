import { useEffect, useState } from 'react'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const PRICING_TYPES = [
  { value: 'METER', label: 'Por metro', unitLabel: 'R$/m' },
  { value: 'WEIGHT', label: 'Por peso', unitLabel: 'R$/kg' },
  { value: 'UNIT', label: 'Por unidade', unitLabel: 'R$/un' },
]

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateSaving, setIsCreateSaving] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState('')
  const [createForm, setCreateForm] = useState({
    categoryId: '',
    supplierId: '',
    code: '',
    description: '',
    pricingType: 'METER',
    price: '',
    linearWeightKgM: '',
    statusId: '1',
  })

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditSaving, setIsEditSaving] = useState(false)
  const [editErrorMessage, setEditErrorMessage] = useState('')
  const [editingSupplyId, setEditingSupplyId] = useState(null)
  const [editForm, setEditForm] = useState({
    categoryId: '',
    supplierId: '',
    code: '',
    description: '',
    pricingType: 'METER',
    price: '',
    linearWeightKgM: '',
    statusId: '1',
  })

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
      } catch (_error) {
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

  const resetCreateForm = () => {
    setCreateForm({
      categoryId: categories[0]?.id ? String(categories[0].id) : '',
      supplierId: suppliers[0]?.id ? String(suppliers[0].id) : '',
      code: '',
      description: '',
      pricingType: 'METER',
      price: '',
      linearWeightKgM: '',
      statusId: '1',
    })
    setCreateErrorMessage('')
  }

  const handleOpenCreateModal = () => {
    resetCreateForm()
    setIsCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
    resetCreateForm()
  }

  const handleCreateChange = (field) => (event) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
    setCreateErrorMessage('')
  }

  const handleCreateSubmit = async (event) => {
    event.preventDefault()
    const parsedPrice = Number(String(createForm.price).replace(',', '.'))
    const parsedLinearWeightKgM = Number(String(createForm.linearWeightKgM).replace(',', '.'))
    const selectedCategory = categories.find(
      (category) => String(category.id) === String(createForm.categoryId)
    )
    const isAluminumCategory = Boolean(
      selectedCategory?.name &&
        String(selectedCategory.name).toLowerCase().includes('alumin')
    )
    const isPricingByWeight = createForm.pricingType === 'WEIGHT'

    if (!createForm.categoryId) {
      setCreateErrorMessage('Selecione a categoria.')
      return
    }
    if (!createForm.supplierId) {
      setCreateErrorMessage('Selecione o fornecedor.')
      return
    }
    if (!createForm.code.trim()) {
      setCreateErrorMessage('Informe o codigo do insumo.')
      return
    }
    if (!Number.isFinite(parsedPrice)) {
      setCreateErrorMessage('Informe um preco valido.')
      return
    }
    if (
      isAluminumCategory &&
      (!Number.isFinite(parsedLinearWeightKgM) || parsedLinearWeightKgM <= 0)
    ) {
      setCreateErrorMessage('Insumos de aluminio exigem peso linear (kg/m).')
      return
    }
    if (isPricingByWeight && (!Number.isFinite(parsedLinearWeightKgM) || parsedLinearWeightKgM <= 0)) {
      setCreateErrorMessage('Informe o peso linear (kg/m).')
      return
    }

    setIsCreateSaving(true)
    setCreateErrorMessage('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/insumos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: Number(createForm.categoryId),
          supplierId: Number(createForm.supplierId),
          code: createForm.code.trim(),
          description: createForm.description.trim(),
          pricingType: createForm.pricingType,
          price: parsedPrice,
          linearWeightKgM: Number.isFinite(parsedLinearWeightKgM) ? parsedLinearWeightKgM : null,
          defaultLossPercentage: null,
          statusId: Number(createForm.statusId),
        }),
      })
      if (!response.ok) {
        throw new Error(`Falha ao criar insumo (${response.status})`)
      }

      handleCloseCreateModal()
      setCurrentPage(0)
      const statusValue = statusFilter ? statusFilter.toUpperCase() : ''
      fetchSupplies(
        {
          code: codeFilter.trim(),
          description: descriptionFilter.trim(),
          categoryId: categoryFilter,
          supplierId: supplierFilter,
          status: statusValue,
        },
        0
      )
    } catch (error) {
      setCreateErrorMessage(error instanceof Error ? error.message : 'Erro ao criar insumo')
    } finally {
      setIsCreateSaving(false)
    }
  }

  const PRICING_TYPE_MAP = {
    METRO: 'METER',
    METER: 'METER',
    PESO: 'WEIGHT',
    WEIGHT: 'WEIGHT',
    UNIDADE: 'UNIT',
    UNIT: 'UNIT',
  }

  const handleOpenEditModal = (supply) => {
    const matchedCategory = categories.find(
      (c) => String(c.name).toLowerCase() === String(supply.category).toLowerCase()
    )
    const matchedSupplier = suppliers.find(
      (s) => String(s.name).toLowerCase() === String(supply.supplier).toLowerCase()
    )
    const mappedPricingType = PRICING_TYPE_MAP[supply.pricingType] ?? 'METER'
    setEditingSupplyId(supply.id)
    setEditForm({
      categoryId: matchedCategory ? String(matchedCategory.id) : '',
      supplierId: matchedSupplier ? String(matchedSupplier.id) : '',
      code: supply.code ?? '',
      description: supply.description ?? '',
      pricingType: mappedPricingType,
      price: supply.price != null ? String(supply.price) : '',
      linearWeightKgM: supply.linearWeightKgM != null ? String(supply.linearWeightKgM) : '',
      statusId: supply.status === 'Ativo' ? '1' : '2',
    })
    setEditErrorMessage('')
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingSupplyId(null)
    setEditErrorMessage('')
  }

  const handleEditChange = (field) => (event) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
    setEditErrorMessage('')
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    const parsedPrice = Number(String(editForm.price).replace(',', '.'))
    const parsedLinearWeightKgM = Number(String(editForm.linearWeightKgM).replace(',', '.'))
    const selectedCategory = categories.find(
      (category) => String(category.id) === String(editForm.categoryId)
    )
    const isAluminumCategory = Boolean(
      selectedCategory?.name &&
        String(selectedCategory.name).toLowerCase().includes('alumin')
    )
    const isPricingByWeight = editForm.pricingType === 'WEIGHT'

    if (!editForm.categoryId) {
      setEditErrorMessage('Selecione a categoria.')
      return
    }
    if (!editForm.supplierId) {
      setEditErrorMessage('Selecione o fornecedor.')
      return
    }
    if (!editForm.code.trim()) {
      setEditErrorMessage('Informe o codigo do insumo.')
      return
    }
    if (!Number.isFinite(parsedPrice)) {
      setEditErrorMessage('Informe um preco valido.')
      return
    }
    if (
      isAluminumCategory &&
      (!Number.isFinite(parsedLinearWeightKgM) || parsedLinearWeightKgM <= 0)
    ) {
      setEditErrorMessage('Insumos de aluminio exigem peso linear (kg/m).')
      return
    }
    if (isPricingByWeight && (!Number.isFinite(parsedLinearWeightKgM) || parsedLinearWeightKgM <= 0)) {
      setEditErrorMessage('Informe o peso linear (kg/m).')
      return
    }

    setIsEditSaving(true)
    setEditErrorMessage('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/insumos/${editingSupplyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: Number(editForm.categoryId),
          supplierId: Number(editForm.supplierId),
          code: editForm.code.trim(),
          description: editForm.description.trim(),
          pricingType: editForm.pricingType,
          price: parsedPrice,
          linearWeightKgM: Number.isFinite(parsedLinearWeightKgM) ? parsedLinearWeightKgM : null,
          defaultLossPercentage: null,
          statusId: Number(editForm.statusId),
        }),
      })
      if (!response.ok) {
        throw new Error(`Falha ao editar insumo (${response.status})`)
      }

      handleCloseEditModal()
      const statusValue = statusFilter ? statusFilter.toUpperCase() : ''
      fetchSupplies(
        {
          code: codeFilter.trim(),
          description: descriptionFilter.trim(),
          categoryId: categoryFilter,
          supplierId: supplierFilter,
          status: statusValue,
        },
        currentPage
      )
    } catch (error) {
      setEditErrorMessage(error instanceof Error ? error.message : 'Erro ao editar insumo')
    } finally {
      setIsEditSaving(false)
    }
  }

  const selectedCreatePricingType = PRICING_TYPES.find(
    (pricingType) => pricingType.value === createForm.pricingType
  )
  const createPriceLabel = selectedCreatePricingType?.unitLabel || 'R$/m'
  const isCreatePricingByWeight = createForm.pricingType === 'WEIGHT'

  const selectedEditPricingType = PRICING_TYPES.find(
    (pricingType) => pricingType.value === editForm.pricingType
  )
  const editPriceLabel = selectedEditPricingType?.unitLabel || 'R$/m'
  const isEditPricingByWeight = editForm.pricingType === 'WEIGHT'

  return (
    <div className="app supplies-page">
      <Header />
      <main className="supplies-container">
        <header className="supplies-header">
          <div>
            <h1>
              Insumos |{' '}
              <button className="users-create-link" type="button" onClick={handleOpenCreateModal}>
                Criar Insumo
              </button>
            </h1>
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
                    <button
                      className="icon-button edit-button"
                      type="button"
                      aria-label="Editar"
                      onClick={() => handleOpenEditModal(supply)}
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
      </main>
      {isCreateModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={handleCloseCreateModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h2>Criar Insumo</h2>
              </div>
              <button className="primary-button" type="button" onClick={handleCloseCreateModal}>
                Voltar
              </button>
            </header>

            <form className="modal-form" onSubmit={handleCreateSubmit}>
              <div className="modal-form-group">
                <label htmlFor="create-insumo-category">Categoria</label>
                <select
                  id="create-insumo-category"
                  className="modal-select"
                  value={createForm.categoryId}
                  onChange={handleCreateChange('categoryId')}
                  required
                >
                  <option value="">Selecione</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-insumo-supplier">Fornecedor</label>
                <select
                  id="create-insumo-supplier"
                  className="modal-select"
                  value={createForm.supplierId}
                  onChange={handleCreateChange('supplierId')}
                  required
                >
                  <option value="">Selecione</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-insumo-code">Codigo do Insumo</label>
                <input
                  id="create-insumo-code"
                  className="modal-input"
                  type="text"
                  value={createForm.code}
                  onChange={handleCreateChange('code')}
                  placeholder="Codigo do Insumo"
                  required
                />
              </div>

              <div className="modal-form-group modal-form-group-full">
                <label htmlFor="create-insumo-description">Descricao</label>
                <input
                  id="create-insumo-description"
                  className="modal-input"
                  type="text"
                  value={createForm.description}
                  onChange={handleCreateChange('description')}
                  placeholder="Descricao"
                />
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-insumo-pricing-type">Tipo de precificacao</label>
                <select
                  id="create-insumo-pricing-type"
                  className="modal-select"
                  value={createForm.pricingType}
                  onChange={handleCreateChange('pricingType')}
                  required
                >
                  {PRICING_TYPES.map((pricingType) => (
                    <option key={pricingType.value} value={pricingType.value}>
                      {pricingType.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-insumo-price">Preco ({createPriceLabel})</label>
                <input
                  id="create-insumo-price"
                  className="modal-input"
                  type="text"
                  value={createForm.price}
                  onChange={handleCreateChange('price')}
                  placeholder="Preco"
                  required
                />
              </div>

              {isCreatePricingByWeight && (
                <>
                  <div className="modal-form-group">
                    <label htmlFor="create-insumo-linear-weight">Peso linear (kg/m)</label>
                    <input
                      id="create-insumo-linear-weight"
                      className="modal-input"
                      type="text"
                      value={createForm.linearWeightKgM}
                      onChange={handleCreateChange('linearWeightKgM')}
                      placeholder="Ex.: 0,85"
                      required
                    />
                  </div>

                </>
              )}

              <div className="modal-form-group">
                <label htmlFor="create-insumo-status">Status</label>
                <select
                  id="create-insumo-status"
                  className="modal-select"
                  value={createForm.statusId}
                  onChange={handleCreateChange('statusId')}
                >
                  <option value="1">Ativo</option>
                  <option value="2">Inativo</option>
                </select>
              </div>

              {createErrorMessage && <p className="products-create-error">{createErrorMessage}</p>}

              <div className="products-create-actions">
                <button className="primary-button" type="submit" disabled={isCreateSaving}>
                  {isCreateSaving ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h2>Editar Insumo</h2>
              </div>
              <button className="primary-button" type="button" onClick={handleCloseEditModal}>
                Voltar
              </button>
            </header>

            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="modal-form-group">
                <label htmlFor="edit-insumo-category">Categoria</label>
                <select
                  id="edit-insumo-category"
                  className="modal-select"
                  value={editForm.categoryId}
                  onChange={handleEditChange('categoryId')}
                  required
                >
                  <option value="">Selecione</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="edit-insumo-supplier">Fornecedor</label>
                <select
                  id="edit-insumo-supplier"
                  className="modal-select"
                  value={editForm.supplierId}
                  onChange={handleEditChange('supplierId')}
                  required
                >
                  <option value="">Selecione</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="edit-insumo-code">Codigo do Insumo</label>
                <input
                  id="edit-insumo-code"
                  className="modal-input"
                  type="text"
                  value={editForm.code}
                  onChange={handleEditChange('code')}
                  placeholder="Codigo do Insumo"
                  required
                />
              </div>

              <div className="modal-form-group modal-form-group-full">
                <label htmlFor="edit-insumo-description">Descricao</label>
                <input
                  id="edit-insumo-description"
                  className="modal-input"
                  type="text"
                  value={editForm.description}
                  onChange={handleEditChange('description')}
                  placeholder="Descricao"
                />
              </div>

              <div className="modal-form-group">
                <label htmlFor="edit-insumo-pricing-type">Tipo de precificacao</label>
                <select
                  id="edit-insumo-pricing-type"
                  className="modal-select"
                  value={editForm.pricingType}
                  onChange={handleEditChange('pricingType')}
                  required
                >
                  {PRICING_TYPES.map((pricingType) => (
                    <option key={pricingType.value} value={pricingType.value}>
                      {pricingType.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="edit-insumo-price">Preco ({editPriceLabel})</label>
                <input
                  id="edit-insumo-price"
                  className="modal-input"
                  type="text"
                  value={editForm.price}
                  onChange={handleEditChange('price')}
                  placeholder="Preco"
                  required
                />
              </div>

              {isEditPricingByWeight && (
                <>
                  <div className="modal-form-group">
                    <label htmlFor="edit-insumo-linear-weight">Peso linear (kg/m)</label>
                    <input
                      id="edit-insumo-linear-weight"
                      className="modal-input"
                      type="text"
                      value={editForm.linearWeightKgM}
                      onChange={handleEditChange('linearWeightKgM')}
                      placeholder="Ex.: 0,85"
                      required
                    />
                  </div>

                </>
              )}

              <div className="modal-form-group">
                <label htmlFor="edit-insumo-status">Status</label>
                <select
                  id="edit-insumo-status"
                  className="modal-select"
                  value={editForm.statusId}
                  onChange={handleEditChange('statusId')}
                >
                  <option value="1">Ativo</option>
                  <option value="2">Inativo</option>
                </select>
              </div>

              {editErrorMessage && <p className="products-create-error">{editErrorMessage}</p>}

              <div className="products-create-actions">
                <button className="primary-button" type="submit" disabled={isEditSaving}>
                  {isEditSaving ? 'Salvando...' : 'Editar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Insumos
