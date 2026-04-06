import { useCallback, useEffect, useState } from 'react'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function Produtos() {
  const [products, setProducts] = useState([])
  const [lines, setLines] = useState([])
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLine, setSelectedLine] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [linesErrorMessage, setLinesErrorMessage] = useState('')
  const [categoriesErrorMessage, setCategoriesErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isInsumosModalOpen, setIsInsumosModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productInsumos, setProductInsumos] = useState([])
  const [insumosLoading, setInsumosLoading] = useState(false)
  const [insumosErrorMessage, setInsumosErrorMessage] = useState('')
  const [insumoSearch, setInsumoSearch] = useState('')
  const [insumoOptions, setInsumoOptions] = useState([])
  const [selectedInsumo, setSelectedInsumo] = useState('')
  const [insumoQuantidade, setInsumoQuantidade] = useState('')
  const [insumoFormula, setInsumoFormula] = useState('')
  const [produtoAlterado, setProdutoAlterado] = useState(false)
  const [editingProductInsumoId, setEditingProductInsumoId] = useState(null)
  const [isInsumoSaving, setIsInsumoSaving] = useState(false)
  const [colors, setColors] = useState([])
  const [accessoryCategories, setAccessoryCategories] = useState([])
  const [parentProducts, setParentProducts] = useState([])
  const [createOptionsError, setCreateOptionsError] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateSaving, setIsCreateSaving] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState('')
  const [isParentProductsLoading, setIsParentProductsLoading] = useState(false)
  const [createForm, setCreateForm] = useState({
    categoryId: '1',
    colorId: '1',
    lineId: '1',
    accessoryCategoryId: '0',
    name: '',
    welds: '',
    minHeight: '',
    maxHeight: '',
    minWidth: '',
    maxWidth: '',
    statusId: '1',
    parentColorId: '1',
    parentLineId: '1',
    parentProductId: '0',
    file: null,
  })

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${API_BASE_URL}/api/products?page=${currentPage}&size=${pageSize}`
        )
        if (!response.ok) {
          throw new Error(`Falha ao buscar produtos (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setProducts(Array.isArray(data.content) ? data.content : [])
          setTotalPages(data.page?.totalPages || 0)
          setTotalElements(data.page?.totalElements || 0)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setProducts([])
          setTotalPages(0)
          setTotalElements(0)
          setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar produtos')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [currentPage, pageSize])

  const fetchProducts = async (filters = {}, page = 0) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filters.name) {
        params.append('name', filters.name)
      }
      if (filters.lineId) {
        params.append('lineId', filters.lineId)
      }
      if (filters.categoryId) {
        params.append('categoryId', filters.categoryId)
      }
      if (filters.statusId) {
        params.append('statusId', filters.statusId)
      }

      const query = params.toString()
      const url = query
        ? `${API_BASE_URL}/api/products/search?${query}`
        : `${API_BASE_URL}/api/products?page=${page}&size=${pageSize}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Falha ao buscar produtos (${response.status})`)
      }
      const data = await response.json()
      
      // Handle paginated response
      if (data.content) {
        setProducts(Array.isArray(data.content) ? data.content : [])
        setTotalPages(data.page?.totalPages || 0)
        setTotalElements(data.page?.totalElements || 0)
        setCurrentPage(page)
      } else {
        // Handle non-paginated response (search endpoint)
        setProducts(Array.isArray(data) ? data : [])
        setTotalPages(1)
        setTotalElements(Array.isArray(data) ? data.length : 0)
        setCurrentPage(0)
      }
      setErrorMessage('')
    } catch (error) {
      setProducts([])
      setTotalPages(0)
      setTotalElements(0)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar produtos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0) // Reset to first page on new search
    fetchProducts({
      name: searchTerm.trim(),
      lineId: selectedLine,
      categoryId: selectedCategory,
      statusId: selectedStatus,
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
      categoryId: '1',
      colorId: '1',
      lineId: '1',
      accessoryCategoryId: '0',
      name: '',
      welds: '',
      minHeight: '',
      maxHeight: '',
      minWidth: '',
      maxWidth: '',
      statusId: '1',
      parentColorId: '1',
      parentLineId: '1',
      parentProductId: '0',
      file: null,
    })
    setCreateErrorMessage('')
    setParentProducts([])
  }

  const loadParentProducts = useCallback(async (lineId, colorId) => {
    if (!lineId || !colorId) {
      setParentProducts([])
      return
    }

    try {
      setIsParentProductsLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/api/products/parent-options?lineId=${lineId}&colorId=${colorId}&categoryId=1`
      )
      if (!response.ok) {
        throw new Error(`Falha ao buscar produtos pai (${response.status})`)
      }
      const data = await response.json()
      setParentProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      setParentProducts([])
      setCreateErrorMessage(
        error instanceof Error ? error.message : 'Erro ao buscar produtos pai'
      )
    } finally {
      setIsParentProductsLoading(false)
    }
  }, [])

  const handleOpenCreateModal = () => {
    resetCreateForm()
    setIsCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
    resetCreateForm()
  }

  const handleCreateChange = (field) => (event) => {
    const value = event.target.value

    setCreateForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      }

      if (field === 'categoryId') {
        if (value === '1') {
          next.accessoryCategoryId = '0'
        }
        if (value === '3' || value === '4') {
          next.parentProductId = '0'
        }
      }

      return next
    })
    setCreateErrorMessage('')
  }

  const handleParentColorChange = (event) => {
    const value = event.target.value
    setCreateForm((prev) => ({
      ...prev,
      parentColorId: value,
      parentProductId: '0',
    }))
    setCreateErrorMessage('')
  }

  const handleParentLineChange = (event) => {
    const value = event.target.value
    setCreateForm((prev) => ({
      ...prev,
      parentLineId: value,
      parentProductId: '0',
    }))
    setCreateErrorMessage('')
  }

  const handleCreateFileChange = (event) => {
    const selectedFile = event.target.files?.[0] ?? null
    setCreateForm((prev) => ({
      ...prev,
      file: selectedFile,
    }))
  }

  const shouldDisableColorLineAndParent =
    createForm.categoryId === '3' || createForm.categoryId === '4'
  const shouldDisableAccessory = createForm.categoryId === '1'

  const handleCreateSubmit = async (event) => {
    event.preventDefault()
    setIsCreateSaving(true)
    setCreateErrorMessage('')
    try {
      const formData = new FormData()
      formData.append('categoryId', createForm.categoryId)
      formData.append('accessoryCategoryId', shouldDisableAccessory ? '0' : createForm.accessoryCategoryId)
      formData.append('colorId', shouldDisableColorLineAndParent ? '1' : createForm.colorId)
      formData.append('lineId', shouldDisableColorLineAndParent ? '1' : createForm.lineId)
      formData.append('name', createForm.name.trim())
      formData.append('welds', createForm.welds)
      formData.append('statusId', createForm.statusId)
      formData.append('parentProductId', shouldDisableColorLineAndParent ? '0' : createForm.parentProductId)
      formData.append('minHeight', createForm.minHeight)
      formData.append('maxHeight', createForm.maxHeight)
      formData.append('minWidth', createForm.minWidth)
      formData.append('maxWidth', createForm.maxWidth)
      if (createForm.file) {
        formData.append('file', createForm.file)
      }

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error(`Falha ao criar produto (${response.status})`)
      }

      handleCloseCreateModal()
      setCurrentPage(0)
      fetchProducts(
        {
          name: searchTerm.trim(),
          lineId: selectedLine,
          categoryId: selectedCategory,
          statusId: selectedStatus,
        },
        0
      )
    } catch (error) {
      setCreateErrorMessage(error instanceof Error ? error.message : 'Erro ao criar produto')
    } finally {
      setIsCreateSaving(false)
    }
  }

  const loadProductInsumos = async (productId) => {
    setInsumosLoading(true)
    setInsumosErrorMessage('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/insumos`)
      if (!response.ok) {
        throw new Error(`Falha ao buscar insumos (${response.status})`)
      }
      const data = await response.json()
      setProductInsumos(Array.isArray(data) ? data : [])
    } catch (error) {
      setProductInsumos([])
      setInsumosErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar insumos')
    } finally {
      setInsumosLoading(false)
    }
  }

  const resetInsumoForm = () => {
    setSelectedInsumo('')
    setInsumoQuantidade('')
    setInsumoFormula('')
    setEditingProductInsumoId(null)
  }

  const handleOpenInsumosModal = async (product) => {
    setSelectedProduct(product)
    setProdutoAlterado(Boolean(product?.altered))
    setIsInsumosModalOpen(true)
    resetInsumoForm()
    setInsumoSearch('')
    setInsumoOptions([])
    await loadProductInsumos(product.id)
  }

  const handleSearchInsumos = async () => {
    const code = insumoSearch.trim()

    setInsumosErrorMessage('')
    try {
      const query = code
        ? `code=${encodeURIComponent(code)}&status=ATIVO`
        : 'status=ATIVO'
      const response = await fetch(
        `${API_BASE_URL}/api/insumos/search?${query}`
      )
      if (!response.ok) {
        throw new Error(`Falha ao buscar insumos (${response.status})`)
      }
      const data = await response.json()
      setInsumoOptions(Array.isArray(data) ? data : [])
    } catch (error) {
      setInsumoOptions([])
      setInsumosErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar insumos')
    }
  }

  const handleSaveProdutoAlterado = async (checked) => {
    if (!selectedProduct?.id) {
      return
    }

    const previousValue = produtoAlterado
    setProdutoAlterado(checked)
    setInsumosErrorMessage('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${selectedProduct.id}/alteracao?value=${checked}`,
        { method: 'PATCH' }
      )
      if (!response.ok) {
        throw new Error(`Falha ao salvar alteracao (${response.status})`)
      }
    } catch (error) {
      setProdutoAlterado(previousValue)
      setInsumosErrorMessage(error instanceof Error ? error.message : 'Erro ao salvar alteracao')
    }
  }

  const handleSaveInsumo = async () => {
    if (!selectedProduct?.id) {
      return
    }

    const insumoId = Number(selectedInsumo)
    const quantidade = Number(String(insumoQuantidade).replace(',', '.'))

    if (!insumoId || Number.isNaN(insumoId)) {
      setInsumosErrorMessage('Selecione um insumo.')
      return
    }
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      setInsumosErrorMessage('Informe uma quantidade valida.')
      return
    }

    setIsInsumoSaving(true)
    setInsumosErrorMessage('')
    try {
      const endpoint = editingProductInsumoId
        ? `${API_BASE_URL}/api/products/${selectedProduct.id}/insumos/${editingProductInsumoId}`
        : `${API_BASE_URL}/api/products/${selectedProduct.id}/insumos`
      const method = editingProductInsumoId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insumoId,
          quantity: quantidade,
          formula: insumoFormula,
        }),
      })
      if (!response.ok) {
        throw new Error(`Falha ao salvar vinculo (${response.status})`)
      }

      resetInsumoForm()
      await loadProductInsumos(selectedProduct.id)
    } catch (error) {
      setInsumosErrorMessage(error instanceof Error ? error.message : 'Erro ao salvar vinculo')
    } finally {
      setIsInsumoSaving(false)
    }
  }

  const handleEditInsumo = (insumo) => {
    setEditingProductInsumoId(insumo.productInsumoId || null)
    setSelectedInsumo(String(insumo.id ?? ''))
    setInsumoQuantidade(insumo.quantity != null ? String(insumo.quantity) : '')
    setInsumoFormula(insumo.formula || '')
  }

  const handleDeleteInsumo = async (insumo) => {
    if (!selectedProduct?.id || !insumo.productInsumoId) {
      return
    }
    const confirmed = window.confirm('Voce deseja excluir o insumo vinculado?')
    if (!confirmed) {
      return
    }

    setInsumosErrorMessage('')
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${selectedProduct.id}/insumos/${insumo.productInsumoId}`,
        { method: 'DELETE' }
      )
      if (!response.ok) {
        throw new Error(`Falha ao excluir vinculo (${response.status})`)
      }
      await loadProductInsumos(selectedProduct.id)
    } catch (error) {
      setInsumosErrorMessage(error instanceof Error ? error.message : 'Erro ao excluir vinculo')
    }
  }

  const handleCloseInsumosModal = () => {
    setIsInsumosModalOpen(false)
    setSelectedProduct(null)
    setProductInsumos([])
    setInsumosErrorMessage('')
    setInsumoSearch('')
    setInsumoOptions([])
    setSelectedInsumo('')
    setInsumoQuantidade('')
    setInsumoFormula('')
    setProdutoAlterado(false)
    setEditingProductInsumoId(null)
  }

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/categories`)
        if (!response.ok) {
          throw new Error(`Falha ao buscar categorias (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : [])
          setCategoriesErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setCategories([])
          setCategoriesErrorMessage(
            error instanceof Error ? error.message : 'Erro ao buscar categorias'
          )
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadLines = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/lines`)
        if (!response.ok) {
          throw new Error(`Falha ao buscar linhas (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setLines(Array.isArray(data) ? data : [])
          setLinesErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setLines([])
          setLinesErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar linhas')
        }
      }
    }

    loadLines()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadCreateOptions = async () => {
      let localCreateError = ''

      try {
        const colorsResponse = await fetch(`${API_BASE_URL}/api/products/colors`)
        if (!colorsResponse.ok) {
          throw new Error(`Falha ao buscar cores (${colorsResponse.status})`)
        }
        const colorsData = await colorsResponse.json()
        if (isMounted) {
          setColors(Array.isArray(colorsData) ? colorsData : [])
        }
      } catch (error) {
        if (isMounted) {
          setColors([])
          localCreateError = error instanceof Error ? error.message : 'Erro ao buscar cores'
        }
      }

      try {
        const accessoriesResponse = await fetch(`${API_BASE_URL}/api/products/accessory-categories`)
        if (!accessoriesResponse.ok) {
          // Endpoint pode nao existir temporariamente em alguns ambientes.
          if (accessoriesResponse.status === 404) {
            if (isMounted) {
              setAccessoryCategories([])
            }
          } else {
            throw new Error(`Falha ao buscar categorias de acessorios (${accessoriesResponse.status})`)
          }
        } else {
          const accessoriesData = await accessoriesResponse.json()
          if (isMounted) {
            setAccessoryCategories(Array.isArray(accessoriesData) ? accessoriesData : [])
          }
        }
      } catch (error) {
        if (isMounted) {
          setAccessoryCategories([])
          localCreateError =
            localCreateError || (error instanceof Error ? error.message : 'Erro ao buscar acessorios')
        }
      }

      if (isMounted) {
        setCreateOptionsError(localCreateError)
      }
    }

    loadCreateOptions()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isCreateModalOpen) {
      return
    }
    if (shouldDisableColorLineAndParent) {
      setParentProducts([])
      return
    }
    loadParentProducts(createForm.parentLineId, createForm.parentColorId)
  }, [
    isCreateModalOpen,
    createForm.parentLineId,
    createForm.parentColorId,
    shouldDisableColorLineAndParent,
    loadParentProducts,
  ])

  return (
    <div className="app products-page">
      <Header />
      <main className="products-container">
        <header className="products-header">
          <div>
            <h1>
              Produtos |{' '}
              <button className="users-create-link" type="button" onClick={handleOpenCreateModal}>
                Criar Produto
              </button>
            </h1>
          </div>
        </header>

        <section className="products-filters">
          <div className="products-filter-group">
            <label htmlFor="products-search">Busca:</label>
            <input
              id="products-search"
              className="products-filter-input"
              type="text"
              placeholder="Nome do Produto"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="products-filter-group">
            <label htmlFor="products-line">Linha:</label>
            <select
              id="products-line"
              className="products-filter-select"
              value={selectedLine}
              onChange={(event) => setSelectedLine(event.target.value)}
            >
              <option value="">Selecione</option>
              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name}
                </option>
              ))}
            </select>
          </div>
          <div className="products-filter-group">
            <label htmlFor="products-category">Categoria:</label>
            <select
              id="products-category"
              className="products-filter-select"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="products-filter-group">
            <label htmlFor="products-status">Status:</label>
            <select
              id="products-status"
              className="products-filter-select"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="">Selecione</option>
              <option value="1">Ativo</option>
              <option value="2">Inativo</option>
            </select>
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
          <table className="products-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Nome</th>
                <th>Insumos</th>
                <th>Categoria</th>
                <th>Soldas</th>
                <th>Altura</th>
                <th>Largura</th>
                <th>Criacao</th>
                <th>Modificacao</th>
                <th>Status</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={11}>Carregando produtos...</td>
                </tr>
              )}
              {!isLoading && errorMessage && (
                <tr>
                  <td colSpan={11}>{errorMessage}</td>
                </tr>
              )}
              {!isLoading && !errorMessage && products.length === 0 && (
                <tr>
                  <td colSpan={11}>Nenhum produto encontrado.</td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>
                    <button
                      className="products-link-button"
                      type="button"
                      onClick={() => handleOpenInsumosModal(product)}
                    >
                      {product.supply}
                    </button>
                  </td>
                  <td>{product.category}</td>
                  <td>{product.welds}</td>
                  <td>{product.height}</td>
                  <td>{product.width}</td>
                  <td>{product.createdAt}</td>
                  <td>{product.updatedAt}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        product.status === 'Ativo' ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="products-actions">
                    <button className="icon-button edit-button" type="button" aria-label="Editar">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.47-8.47.92.92-8.47 8.47zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.75 1.75 3.75 3.75 1.75-1.75z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button className="icon-button edit-button" type="button" aria-label="Duplicar">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M7 7h11v11H7zM5 5v11H3V5a2 2 0 0 1 2-2h11v2H5z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button className="icon-button edit-button" type="button" aria-label="Detalhes">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M4 5h16v2H4zm0 6h16v2H4zm0 6h16v2H4z"
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
          <div className="modal-content modal-large" onClick={(event) => event.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h2>Criar Produto</h2>
              </div>
              <button className="primary-button" type="button" onClick={handleCloseCreateModal}>
                Voltar
              </button>
            </header>

            <form className="modal-form products-create-form" onSubmit={handleCreateSubmit}>
              <div className="modal-form-group">
                <label htmlFor="create-product-category">Categoria</label>
                <select
                  id="create-product-category"
                  className="modal-select"
                  value={createForm.categoryId}
                  onChange={handleCreateChange('categoryId')}
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-product-color">Cor</label>
                <select
                  id="create-product-color"
                  className="modal-select"
                  value={createForm.colorId}
                  onChange={handleCreateChange('colorId')}
                  disabled={shouldDisableColorLineAndParent}
                >
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-product-line">Linha</label>
                <select
                  id="create-product-line"
                  className="modal-select"
                  value={createForm.lineId}
                  onChange={handleCreateChange('lineId')}
                  disabled={shouldDisableColorLineAndParent}
                >
                  {lines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {line.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-product-accessory">Acessorio</label>
                <select
                  id="create-product-accessory"
                  className="modal-select"
                  value={createForm.accessoryCategoryId}
                  onChange={handleCreateChange('accessoryCategoryId')}
                  disabled={shouldDisableAccessory}
                >
                  <option value="0">Selecione</option>
                  {accessoryCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group modal-form-group-full">
                <label htmlFor="create-product-name">Produto</label>
                <input
                  id="create-product-name"
                  className="modal-input"
                  type="text"
                  value={createForm.name}
                  onChange={handleCreateChange('name')}
                  placeholder="Nome do Produto"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-product-welds">Qtde de Soldas</label>
                <input
                  id="create-product-welds"
                  className="modal-input"
                  type="number"
                  step="0.01"
                  value={createForm.welds}
                  onChange={handleCreateChange('welds')}
                />
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-product-min-height">Altura minima</label>
                <input
                  id="create-product-min-height"
                  className="modal-input"
                  type="number"
                  step="0.01"
                  value={createForm.minHeight}
                  onChange={handleCreateChange('minHeight')}
                />
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-product-max-height">Altura maxima</label>
                <input
                  id="create-product-max-height"
                  className="modal-input"
                  type="number"
                  step="0.01"
                  value={createForm.maxHeight}
                  onChange={handleCreateChange('maxHeight')}
                />
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-product-min-width">Largura minima</label>
                <input
                  id="create-product-min-width"
                  className="modal-input"
                  type="number"
                  step="0.01"
                  value={createForm.minWidth}
                  onChange={handleCreateChange('minWidth')}
                />
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-product-max-width">Largura maxima</label>
                <input
                  id="create-product-max-width"
                  className="modal-input"
                  type="number"
                  step="0.01"
                  value={createForm.maxWidth}
                  onChange={handleCreateChange('maxWidth')}
                />
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-product-status">Status</label>
                <select
                  id="create-product-status"
                  className="modal-select"
                  value={createForm.statusId}
                  onChange={handleCreateChange('statusId')}
                >
                  <option value="1">Ativo</option>
                  <option value="2">Inativo</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-product-parent-color">Cor Produto Pai</label>
                <select
                  id="create-product-parent-color"
                  className="modal-select"
                  value={createForm.parentColorId}
                  onChange={handleParentColorChange}
                  disabled={shouldDisableColorLineAndParent}
                >
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="create-product-parent-line">Linha Prod. Pai</label>
                <select
                  id="create-product-parent-line"
                  className="modal-select"
                  value={createForm.parentLineId}
                  onChange={handleParentLineChange}
                  disabled={shouldDisableColorLineAndParent}
                >
                  {lines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {line.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group modal-form-group-full">
                <label htmlFor="create-product-parent-product">Produto Pai</label>
                <select
                  id="create-product-parent-product"
                  className="modal-select"
                  value={createForm.parentProductId}
                  onChange={handleCreateChange('parentProductId')}
                  disabled={shouldDisableColorLineAndParent}
                >
                  <option value="0">
                    {isParentProductsLoading ? 'Carregando...' : 'Selecione'}
                  </option>
                  {parentProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group modal-form-group-full">
                <label htmlFor="create-product-file">Foto do produto</label>
                <input id="create-product-file" type="file" onChange={handleCreateFileChange} />
              </div>

              {(createOptionsError || createErrorMessage) && (
                <p className="products-create-error">{createOptionsError || createErrorMessage}</p>
              )}

              <div className="products-create-actions">
                <button className="primary-button" type="submit" disabled={isCreateSaving}>
                  {isCreateSaving ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isInsumosModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content modal-large">
            <header className="modal-header">
              <div>
                <h2>Vincular Insumo | Listar Produtos</h2>
                <p className="modal-subtitle">
                  Produto: {selectedProduct?.name || 'Produto selecionado'}
                </p>
              </div>
              <button className="primary-button" type="button" onClick={handleCloseInsumosModal}>
                Voltar
              </button>
            </header>

            <section className="modal-form">
              <div className="modal-form-group">
                <label htmlFor="insumo-search">Buscar Insumo</label>
                <div className="modal-search">
                  <input
                    id="insumo-search"
                    className="modal-input"
                    type="text"
                    placeholder="Buscar Insumo"
                    value={insumoSearch}
                    onChange={(event) => setInsumoSearch(event.target.value)}
                  />
                  <button
                    className="icon-button modal-search-button"
                    type="button"
                    aria-label="Buscar"
                    onClick={handleSearchInsumos}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="modal-form-group">
                <label htmlFor="insumo-select">Insumo</label>
                <select
                  id="insumo-select"
                  className="modal-select"
                  value={selectedInsumo}
                  onChange={(event) => setSelectedInsumo(event.target.value)}
                >
                  <option value="">Efetue a busca</option>
                  {insumoOptions.map((insumo) => (
                    <option key={insumo.id} value={insumo.id}>
                      {insumo.code} - {insumo.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-form-group">
                <label htmlFor="insumo-quantidade">Quantidade</label>
                <input
                  id="insumo-quantidade"
                  className="modal-input"
                  type="text"
                  placeholder="Quantidade"
                  value={insumoQuantidade}
                  onChange={(event) => setInsumoQuantidade(event.target.value)}
                />
              </div>
              <div className="modal-form-group">
                <label htmlFor="insumo-formula">Fórmula</label>
                <input
                  id="insumo-formula"
                  className="modal-input"
                  type="text"
                  placeholder="Fórmula"
                  value={insumoFormula}
                  onChange={(event) => setInsumoFormula(event.target.value)}
                />
              </div>
              <div className="modal-form-group modal-checkbox">
                <label htmlFor="produto-alterado">Produto Alterado</label>
                <input
                  id="produto-alterado"
                  type="checkbox"
                  checked={produtoAlterado}
                  onChange={(event) => handleSaveProdutoAlterado(event.target.checked)}
                />
              </div>
              <button className="primary-button" type="button" onClick={handleSaveInsumo} disabled={isInsumoSaving}>
                {isInsumoSaving
                  ? 'Salvando...'
                  : editingProductInsumoId
                    ? 'Salvar Edicao'
                    : 'Vincular'}
              </button>
            </section>

            <section className="modal-table">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Categoria</th>
                    <th>Qtde</th>
                    <th>Formula</th>
                    <th>Descrição</th>
                    <th>#</th>
                  </tr>
                </thead>
                <tbody>
                  {insumosLoading && (
                    <tr>
                      <td colSpan={6}>Carregando insumos...</td>
                    </tr>
                  )}
                  {!insumosLoading && insumosErrorMessage && (
                    <tr>
                      <td colSpan={6}>{insumosErrorMessage}</td>
                    </tr>
                  )}
                  {!insumosLoading &&
                    !insumosErrorMessage &&
                    productInsumos.map((insumo) => (
                      <tr key={insumo.productInsumoId ?? insumo.id}>
                        <td>{insumo.code}</td>
                        <td>{insumo.category}</td>
                        <td>{insumo.quantity}</td>
                        <td>{insumo.formula}</td>
                        <td>{insumo.description}</td>
                        <td className="products-actions">
                          <button
                            className="icon-button edit-button"
                            type="button"
                            aria-label="Editar"
                            onClick={() => handleEditInsumo(insumo)}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.47-8.47.92.92-8.47 8.47zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.75 1.75 3.75 3.75 1.75-1.75z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                          <button
                            className="icon-button edit-button"
                            type="button"
                            aria-label="Excluir"
                            onClick={() => handleDeleteInsumo(insumo)}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                d="M6 7h12v2H6zm2 3h8l-1 9H9zm3-6h2l1 2H10z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  {!insumosLoading && !insumosErrorMessage && productInsumos.length === 0 && (
                    <tr>
                      <td colSpan={6}>Nenhum insumo vinculado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <div className="modal-footer">
              <span>
                Total de Insumos Vinculados:{' '}
                {productInsumos.reduce((total, item) => total + (Number(item.quantity) || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Produtos
