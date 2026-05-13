import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const fallbackBudget = (id) => ({
  id,
  cliente: 'Cliente não informado',
  telefone: '(11) 99999-9999',
  email: 'cliente@squadra.com',
  obra: 'Obra sem descrição',
  local: 'Local não informado',
  status: 'Em elaboração',
  usuario: 'Usuário',
  usuarioTelefone: '',
  representante: 'Representante',
  criadoEm: '01/01/2026 09:00',
  atualizadoEm: '01/01/2026 09:00',
  versao: '1',
  versoes: [],
})

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const formatNumber = (value) => {
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) {
    return '—'
  }
  return parsed.toLocaleString('pt-BR')
}

const formatMoney = (value) => {
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) {
    return '—'
  }
  return currencyFormatter.format(parsed)
}

const formatPercent = (value) => {
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) {
    return '—'
  }
  return parsed.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const resolveBudgetNumber = (source, keys) => {
  if (!source) {
    return null
  }
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
      const parsed = Number.parseFloat(source[key])
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }
  return null
}

const resolveBudgetText = (source, keys) => {
  if (!source) {
    return ''
  }
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
      return String(source[key])
    }
  }
  return ''
}

const resolveImageSrc = (foto) => {
  if (!foto) {
    return ''
  }
  if (foto.startsWith('http') || foto.startsWith('data:')) {
    return foto
  }
  const baseUrl = import.meta.env.BASE_URL || '/'
  const normalized = foto.replace(/^\/+/, '')
  if (normalized.startsWith('img/')) {
    return `${baseUrl}${normalized}`
  }
  return `${baseUrl}img/${normalized}`
}

function OrcamentoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [productsError, setProductsError] = useState('')
  const [productsLoading, setProductsLoading] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [items, setItems] = useState([])
  const [detailsError, setDetailsError] = useState('')
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [brokenImages, setBrokenImages] = useState({})
  const [activeTab, setActiveTab] = useState('resumo')
  const [isAddEsquadriaModalOpen, setIsAddEsquadriaModalOpen] = useState(false)
  const [addEsquadriaLoading, setAddEsquadriaLoading] = useState(false)
  const [addEsquadriaSubmitting, setAddEsquadriaSubmitting] = useState(false)
  const [addEsquadriaError, setAddEsquadriaError] = useState('')
  const [colorOptions, setColorOptions] = useState([])
  const [lineOptions, setLineOptions] = useState([])
  const [glassOptions, setGlassOptions] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [filteredProductsLoading, setFilteredProductsLoading] = useState(false)
  const [editingMedidas, setEditingMedidas] = useState({})
  const [savingMedidas, setSavingMedidas] = useState({})
  const [editingVidro, setEditingVidro] = useState({})
  const [savingVidro, setSavingVidro] = useState({})
  const [editingProduto, setEditingProduto] = useState(null)
  const [addEsquadriaForm, setAddEsquadriaForm] = useState({
    corId: '',
    linhaId: '',
    produtoId: '',
    quantidade: '',
    largura: '',
    altura: '',
    codigo: '',
    ambiente: '',
    vidroId: '',
    observacao: '',
  })

  const [isEditOrcamentoModalOpen, setIsEditOrcamentoModalOpen] = useState(false)
  const [editOrcamentoSubmitting, setEditOrcamentoSubmitting] = useState(false)
  const [editOrcamentoError, setEditOrcamentoError] = useState('')
  const [editOrcamentoForm, setEditOrcamentoForm] = useState({})
  const [estadoOptions, setEstadoOptions] = useState([])
  const [cidadeOptions, setCidadeOptions] = useState([])
  const [cidadesLoading, setCidadesLoading] = useState(false)
  const [editOrcamentoUfId, setEditOrcamentoUfId] = useState('')

  const [isAlterarStatusModalOpen, setIsAlterarStatusModalOpen] = useState(false)
  const [statusOptions, setStatusOptions] = useState([])
  const [selectedStatusId, setSelectedStatusId] = useState('')
  const [alterarStatusSubmitting, setAlterarStatusSubmitting] = useState(false)
  const [alterarStatusError, setAlterarStatusError] = useState('')

  const [isAlterarUsuarioModalOpen, setIsAlterarUsuarioModalOpen] = useState(false)
  const [usuarioOptions, setUsuarioOptions] = useState([])
  const [selectedUsuarioId, setSelectedUsuarioId] = useState('')
  const [alterarUsuarioSubmitting, setAlterarUsuarioSubmitting] = useState(false)
  const [alterarUsuarioError, setAlterarUsuarioError] = useState('')

  const initialBudget = useMemo(() => {
    const stateBudget = location.state?.budget
    if (stateBudget) {
      return {
        ...fallbackBudget(stateBudget.id),
        ...stateBudget,
      }
    }
    return fallbackBudget(id || '—')
  }, [id, location.state])

  const [budget, setBudget] = useState(initialBudget)

  const resetAddEsquadriaForm = useCallback(() => {
    setAddEsquadriaForm({
      corId: '',
      linhaId: '',
      produtoId: '',
      quantidade: '',
      largura: '',
      altura: '',
      codigo: '',
      ambiente: '',
      vidroId: '',
      observacao: '',
    })
    setFilteredProducts([])
    setAddEsquadriaError('')
  }, [])

  const loadBudgetDetails = useCallback(async () => {
    if (!id) {
      return
    }
    try {
      setDetailsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/orcamentos/${id}/detalhes`)
      if (!response.ok) {
        throw new Error(`Falha ao buscar detalhes do orçamento (${response.status})`)
      }
      const data = await response.json()
      setBudget({
        ...fallbackBudget(id),
        ...data,
      })
      const mappedItems = Array.isArray(data?.produtos)
        ? data.produtos.map((produto, index) => {
            const resolvedQuantity = Number.parseFloat(produto.quantidade) || 0
            const resolvedUnitPrice = Number.parseFloat(produto.valorUnitario) || 0
            return {
              id: String(produto.id || `${produto.produtoId || 'item'}-${index}`),
              name: produto.nome || produto.codigoPeca || 'Produto',
              quantity: resolvedQuantity,
              unitPrice: resolvedUnitPrice,
              total: resolvedUnitPrice * resolvedQuantity,
            }
          })
        : []
      setItems(mappedItems)
      setDetailsError('')
    } catch (error) {
      setDetailsError(error instanceof Error ? error.message : 'Erro ao buscar detalhes do orçamento')
    } finally {
      setDetailsLoading(false)
    }
  }, [id])

  const loadProdutosPorCorLinha = useCallback(async (linhaId, corId) => {
    if (!linhaId || !corId) {
      setFilteredProducts([])
      return
    }
    try {
      setFilteredProductsLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/api/orcamentos/lista-produtos?corId=${corId}&linhaId=${linhaId}`
      )
      if (!response.ok) {
        throw new Error('Falha ao carregar produtos da linha/cor')
      }
      const data = await response.json()
      setFilteredProducts(Array.isArray(data) ? data : [])
      setAddEsquadriaError('')
    } catch (error) {
      setFilteredProducts([])
      setAddEsquadriaError(
        error instanceof Error ? error.message : 'Erro ao carregar produtos para a esquadria'
      )
    } finally {
      setFilteredProductsLoading(false)
    }
  }, [])

  const loadAddEsquadriaDependencies = useCallback(async () => {
    try {
      setAddEsquadriaLoading(true)
      setAddEsquadriaError('')
      const [colorsResponse, linesResponse, glassesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/products/colors`),
        fetch(`${API_BASE_URL}/api/products/lines`),
        fetch(`${API_BASE_URL}/api/vidros?page=0&size=200`),
      ])

      if (!colorsResponse.ok || !linesResponse.ok || !glassesResponse.ok) {
        throw new Error('Falha ao carregar dados para adicionar esquadria')
      }

      const [colorsData, linesData, glassesData] = await Promise.all([
        colorsResponse.json(),
        linesResponse.json(),
        glassesResponse.json(),
      ])

      setColorOptions(Array.isArray(colorsData) ? colorsData : [])
      setLineOptions(Array.isArray(linesData) ? linesData : [])
      setGlassOptions(Array.isArray(glassesData?.content) ? glassesData.content : [])
    } catch (error) {
      setAddEsquadriaError(
        error instanceof Error ? error.message : 'Erro ao carregar listas de esquadria'
      )
    } finally {
      setAddEsquadriaLoading(false)
    }
  }, [])

  const startEditingMedidas = useCallback((produtoId, largura, altura) => {
    setEditingMedidas((current) => ({
      ...current,
      [produtoId]: { largura: String(largura ?? ''), altura: String(altura ?? '') },
    }))
  }, [])

  const cancelEditingMedidas = useCallback((produtoId) => {
    setEditingMedidas((current) => {
      const next = { ...current }
      delete next[produtoId]
      return next
    })
  }, [])

  const saveMedidas = useCallback(
    async (produtoId) => {
      const editing = editingMedidas[produtoId]
      if (!editing) return
      const largura = Number.parseFloat(editing.largura)
      const altura = Number.parseFloat(editing.altura)
      if (Number.isNaN(largura) || largura <= 0 || Number.isNaN(altura) || altura <= 0) return
      try {
        setSavingMedidas((current) => ({ ...current, [produtoId]: true }))
        const response = await fetch(
          `${API_BASE_URL}/api/orcamentos/produtos/${produtoId}/medidas`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ largura, altura }),
          }
        )
        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || 'Erro ao atualizar medidas')
        }
        cancelEditingMedidas(produtoId)
        await loadBudgetDetails()
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erro ao atualizar medidas')
      } finally {
        setSavingMedidas((current) => {
          const next = { ...current }
          delete next[produtoId]
          return next
        })
      }
    },
    [editingMedidas, cancelEditingMedidas, loadBudgetDetails]
  )

  const startEditingVidro = useCallback((produtoId, vidroId) => {
    setEditingVidro((current) => ({
      ...current,
      [produtoId]: String(vidroId ?? ''),
    }))
  }, [])

  const cancelEditingVidro = useCallback((produtoId) => {
    setEditingVidro((current) => {
      const next = { ...current }
      delete next[produtoId]
      return next
    })
  }, [])

  const saveVidro = useCallback(
    async (produtoId) => {
      const vidroId = editingVidro[produtoId]
      if (!vidroId) return
      try {
        setSavingVidro((current) => ({ ...current, [produtoId]: true }))
        const response = await fetch(
          `${API_BASE_URL}/api/orcamentos/produtos/${produtoId}/vidro`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vidroId: Number.parseInt(vidroId, 10) }),
          }
        )
        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || 'Erro ao atualizar vidro')
        }
        cancelEditingVidro(produtoId)
        await loadBudgetDetails()
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erro ao atualizar vidro')
      } finally {
        setSavingVidro((current) => {
          const next = { ...current }
          delete next[produtoId]
          return next
        })
      }
    },
    [editingVidro, cancelEditingVidro, loadBudgetDetails]
  )

  useEffect(() => {
    setBudget(initialBudget)
  }, [initialBudget])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/products`)
        if (!response.ok) {
          throw new Error(`Falha ao buscar produtos (${response.status})`)
        }
        const data = await response.json()
        const payload = Array.isArray(data) ? data : data?.content
        setProducts(Array.isArray(payload) ? payload : [])
        setProductsError('')
      } catch (error) {
        setProducts([])
        setProductsError(error instanceof Error ? error.message : 'Erro ao buscar produtos')
      } finally {
        setProductsLoading(false)
      }
    }

    loadBudgetDetails()
    loadProducts()
  }, [loadBudgetDetails])

  const handleAddItem = () => {
    const selectedProduct = products.find((product) => String(product.id) === selectedProductId)
    if (!selectedProduct) {
      return
    }
    const parsedQuantity = Number.parseFloat(quantity)
    const parsedUnitPrice = Number.parseFloat(unitPrice)
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return
    }
    const resolvedUnitPrice = Number.isNaN(parsedUnitPrice)
      ? Number.parseFloat(selectedProduct.price || 0)
      : parsedUnitPrice
    const total = resolvedUnitPrice * parsedQuantity

    setItems((current) => [
      ...current,
      {
        id: `${selectedProduct.id}-${Date.now()}`,
        name: selectedProduct.name || selectedProduct.nome || 'Produto',
        quantity: parsedQuantity,
        unitPrice: resolvedUnitPrice,
        total,
      },
    ])
    setSelectedProductId('')
    setQuantity('1')
    setUnitPrice('')
  }

  const handleRemoveItem = (itemId) => {
    setItems((current) => current.filter((item) => item.id !== itemId))
  }

  const openAddEsquadriaModal = async () => {
    setIsAddEsquadriaModalOpen(true)
    resetAddEsquadriaForm()
    await loadAddEsquadriaDependencies()
  }

  const closeAddEsquadriaModal = () => {
    setIsAddEsquadriaModalOpen(false)
    setEditingProduto(null)
    resetAddEsquadriaForm()
  }

  const openEditEsquadriaModal = useCallback(
    async (produto) => {
      setEditingProduto(produto)
      setIsAddEsquadriaModalOpen(true)
      setAddEsquadriaError('')
      await loadAddEsquadriaDependencies()
      setAddEsquadriaForm({
        corId: '',
        linhaId: '',
        produtoId: String(produto.produtoId ?? ''),
        quantidade: String(produto.quantidade ?? ''),
        largura: String(produto.largura ?? ''),
        altura: String(produto.altura ?? ''),
        codigo: produto.codigoPeca ?? '',
        ambiente: produto.ambiente ?? '',
        vidroId: String(produto.vidroId ?? ''),
        observacao: produto.observacao ?? '',
      })
    },
    [loadAddEsquadriaDependencies]
  )

  const loadCidadesByUf = useCallback(async (ufId) => {
    if (!ufId) {
      setCidadeOptions([])
      return
    }
    try {
      setCidadesLoading(true)
      const resp = await fetch(`${API_BASE_URL}/api/cidades-estados/estados/${ufId}/cidades`)
      if (resp.ok) {
        const data = await resp.json()
        setCidadeOptions(Array.isArray(data) ? data : [])
      }
    } catch {
      setCidadeOptions([])
    } finally {
      setCidadesLoading(false)
    }
  }, [])

  const openEditOrcamentoModal = useCallback(async () => {
    setEditOrcamentoError('')
    setEditOrcamentoForm({
      engNome: budget.engNome ?? '',
      clienteNome: budget.cliente ?? '',
      clienteTel: budget.telefone ?? '',
      clienteEmail: budget.email ?? '',
      endereco: budget.endereco ?? '',
      cidadeId: budget.cidadeId ? String(budget.cidadeId) : '',
      faseObra: budget.faseObra ?? '',
      cor: budget.cor ?? '',
      comissao: budget.comissao != null ? String(budget.comissao) : '',
      comissaoGerencial: budget.comissaoGerencial != null ? String(budget.comissaoGerencial) : '',
      desconto: budget.desconto != null ? String(budget.desconto) : '',
      rt: budget.rt != null ? String(budget.rt) : '',
      distancia: budget.distancia != null ? String(budget.distancia) : '',
      visitas: budget.visitas != null ? String(budget.visitas) : '',
      fretes: budget.fretes != null ? String(budget.fretes) : '',
      nota: budget.nota != null ? String(budget.nota) : '',
      margem: budget.margem != null ? String(budget.margem) : '',
      descontoAdicional: budget.descontoAdicional != null ? String(budget.descontoAdicional) : '',
      custoExtra: budget.custoExtraPorc != null ? String(budget.custoExtraPorc) : '',
      descontoVidro: budget.descontoVidroPorc != null ? String(budget.descontoVidroPorc) : '',
      descontoReforco: budget.descontoReforcoPorc != null ? String(budget.descontoReforcoPorc) : '',
      semInstalacao: budget.semInstalacao ?? false,
      freteAutomatico: budget.freteAutomatico ?? false,
      observacao: budget.observacao ?? '',
    })
    const ufId = budget.ufId ? String(budget.ufId) : ''
    setEditOrcamentoUfId(ufId)
    try {
      const resp = await fetch(`${API_BASE_URL}/api/cidades-estados/estados?page=0&size=100`)
      if (resp.ok) {
        const data = await resp.json()
        setEstadoOptions(Array.isArray(data?.content) ? data.content : [])
      }
    } catch {
      setEstadoOptions([])
    }
    if (ufId) {
      await loadCidadesByUf(ufId)
    }
    setIsEditOrcamentoModalOpen(true)
  }, [budget, loadCidadesByUf])

  const closeEditOrcamentoModal = useCallback(() => {
    setIsEditOrcamentoModalOpen(false)
    setEditOrcamentoError('')
  }, [])

  const openAlterarStatusModal = useCallback(async () => {
    setAlterarStatusError('')
    setSelectedStatusId('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/orcamentos/status`)
      if (response.ok) {
        const data = await response.json()
        setStatusOptions(Array.isArray(data) ? data : [])
      } else {
        setStatusOptions([])
      }
    } catch {
      setStatusOptions([])
    }
    setIsAlterarStatusModalOpen(true)
  }, [])

  const closeAlterarStatusModal = useCallback(() => {
    setIsAlterarStatusModalOpen(false)
    setAlterarStatusError('')
  }, [])

  const openAlterarUsuarioModal = useCallback(async () => {
    setAlterarUsuarioError('')
    setSelectedUsuarioId('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/orcamentos/usuarios`)
      if (response.ok) {
        const data = await response.json()
        setUsuarioOptions(Array.isArray(data) ? data : [])
      } else {
        setUsuarioOptions([])
      }
    } catch {
      setUsuarioOptions([])
    }
    setIsAlterarUsuarioModalOpen(true)
  }, [])

  const closeAlterarUsuarioModal = useCallback(() => {
    setIsAlterarUsuarioModalOpen(false)
    setAlterarUsuarioError('')
  }, [])

  const handleAlterarStatusSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      if (!selectedStatusId) {
        setAlterarStatusError('Selecione um status')
        return
      }
      try {
        setAlterarStatusSubmitting(true)
        setAlterarStatusError('')
        const response = await fetch(`${API_BASE_URL}/api/orcamentos/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statusOrcamentoId: Number(selectedStatusId) }),
        })
        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || 'Erro ao alterar status')
        }
        closeAlterarStatusModal()
        await loadBudgetDetails()
      } catch (error) {
        setAlterarStatusError(error instanceof Error ? error.message : 'Erro ao alterar status')
      } finally {
        setAlterarStatusSubmitting(false)
      }
    },
    [id, selectedStatusId, closeAlterarStatusModal, loadBudgetDetails]
  )

  const handleAlterarUsuarioSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      if (!selectedUsuarioId) {
        setAlterarUsuarioError('Selecione um usuário')
        return
      }
      try {
        setAlterarUsuarioSubmitting(true)
        setAlterarUsuarioError('')
        const response = await fetch(`${API_BASE_URL}/api/orcamentos/${id}/usuario`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarioId: Number(selectedUsuarioId) }),
        })
        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || 'Erro ao alterar usuário')
        }
        closeAlterarUsuarioModal()
        await loadBudgetDetails()
      } catch (error) {
        setAlterarUsuarioError(error instanceof Error ? error.message : 'Erro ao alterar usuário')
      } finally {
        setAlterarUsuarioSubmitting(false)
      }
    },
    [id, selectedUsuarioId, closeAlterarUsuarioModal, loadBudgetDetails]
  )

  const handleEditOrcamentoUfChange = useCallback(
    async (ufId) => {
      setEditOrcamentoUfId(ufId)
      setEditOrcamentoForm((prev) => ({ ...prev, cidadeId: '' }))
      await loadCidadesByUf(ufId)
    },
    [loadCidadesByUf]
  )

  const handleEditOrcamentoSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      try {
        setEditOrcamentoSubmitting(true)
        setEditOrcamentoError('')
        const parseNum = (val) => (val !== '' && val != null ? Number(val) : null)
        const payload = {
          engNome: editOrcamentoForm.engNome,
          clienteNome: editOrcamentoForm.clienteNome,
          clienteTel: editOrcamentoForm.clienteTel,
          clienteEmail: editOrcamentoForm.clienteEmail,
          endereco: editOrcamentoForm.endereco,
          cidadeId: parseNum(editOrcamentoForm.cidadeId),
          faseObra: editOrcamentoForm.faseObra,
          cor: editOrcamentoForm.cor,
          comissao: parseNum(editOrcamentoForm.comissao),
          comissaoGerencial: parseNum(editOrcamentoForm.comissaoGerencial),
          desconto: parseNum(editOrcamentoForm.desconto),
          rt: parseNum(editOrcamentoForm.rt),
          distancia: parseNum(editOrcamentoForm.distancia),
          visitas: parseNum(editOrcamentoForm.visitas),
          fretes: parseNum(editOrcamentoForm.fretes),
          nota: parseNum(editOrcamentoForm.nota),
          margem: parseNum(editOrcamentoForm.margem),
          descontoAdicional: parseNum(editOrcamentoForm.descontoAdicional),
          custoExtra: parseNum(editOrcamentoForm.custoExtra),
          descontoVidro: parseNum(editOrcamentoForm.descontoVidro),
          descontoReforco: parseNum(editOrcamentoForm.descontoReforco),
          semInstalacao: editOrcamentoForm.semInstalacao,
          freteAutomatico: editOrcamentoForm.freteAutomatico,
          observacao: editOrcamentoForm.observacao,
        }
        const response = await fetch(`${API_BASE_URL}/api/orcamentos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || 'Erro ao salvar orçamento')
        }
        closeEditOrcamentoModal()
        await loadBudgetDetails()
      } catch (error) {
        setEditOrcamentoError(
          error instanceof Error ? error.message : 'Erro ao salvar orçamento'
        )
      } finally {
        setEditOrcamentoSubmitting(false)
      }
    },
    [id, editOrcamentoForm, closeEditOrcamentoModal, loadBudgetDetails]
  )

  const handleDuplicarEsquadria = useCallback(
    async (produtoId) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/orcamentos/produtos/${produtoId}/duplicar`,
          { method: 'POST' }
        )
        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || 'Erro ao duplicar esquadria')
        }
        await loadBudgetDetails()
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erro ao duplicar esquadria')
      }
    },
    [loadBudgetDetails]
  )

  const handleExcluirEsquadria = useCallback(
    async (produtoId) => {
      if (!window.confirm('Você deseja excluir a esquadria?')) return
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/orcamentos/produtos/${produtoId}`,
          { method: 'DELETE' }
        )
        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || 'Erro ao excluir esquadria')
        }
        await loadBudgetDetails()
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erro ao excluir esquadria')
      }
    },
    [loadBudgetDetails]
  )

  const handleExcluirOrcamento = useCallback(async () => {
    if (!window.confirm('Você deseja excluir a versão do orçamento?')) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/orcamentos/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Erro ao excluir orçamento')
      }
      const redirectId = await response.json()
      if (redirectId) {
        navigate(`/Orcamentos/${redirectId}`)
      } else {
        navigate('/Orcamentos')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir orçamento')
    }
  }, [id, navigate])

  const handleDuplicarOrcamento = useCallback(async () => {
    if (!window.confirm('Deseja duplicar este orçamento?')) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/orcamentos/${id}/duplicar`, { method: 'POST' })
      if (!response.ok) {
        throw new Error('Erro ao duplicar orçamento')
      }
      const novoId = await response.json()
      navigate(`/Orcamentos/${novoId}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao duplicar orçamento')
    }
  }, [id, navigate])

  const handleAddEsquadriaFieldChange = async (field, value) => {
    const nextForm = {
      ...addEsquadriaForm,
      [field]: value,
    }
    if (field === 'corId' || field === 'linhaId') {
      nextForm.produtoId = ''
      setFilteredProducts([])
    }
    setAddEsquadriaForm(nextForm)

    if (
      (field === 'corId' || field === 'linhaId') &&
      nextForm.corId &&
      nextForm.linhaId
    ) {
      await loadProdutosPorCorLinha(nextForm.linhaId, nextForm.corId)
    }
  }

  const validateAddEsquadriaForm = () => {
    if (!addEsquadriaForm.produtoId || addEsquadriaForm.produtoId === '0') {
      setAddEsquadriaError('Selecione um produto')
      return false
    }
    if (
      !addEsquadriaForm.quantidade ||
      Number.parseFloat(addEsquadriaForm.quantidade) <= 0
    ) {
      setAddEsquadriaError('Informe a quantidade')
      return false
    }
    if (!addEsquadriaForm.largura || Number.parseFloat(addEsquadriaForm.largura) <= 0) {
      setAddEsquadriaError('Informe a largura')
      return false
    }
    if (!addEsquadriaForm.altura || Number.parseFloat(addEsquadriaForm.altura) <= 0) {
      setAddEsquadriaError('Informe a altura')
      return false
    }
    if (!addEsquadriaForm.codigo.trim()) {
      setAddEsquadriaError('Informe o código')
      return false
    }
    if (!addEsquadriaForm.vidroId || addEsquadriaForm.vidroId === '0') {
      setAddEsquadriaError('Selecione um vidro')
      return false
    }
    setAddEsquadriaError('')
    return true
  }

  const handleAddEsquadriaSubmit = async (event) => {
    event.preventDefault()
    if (!validateAddEsquadriaForm()) {
      return
    }

    try {
      setAddEsquadriaSubmitting(true)

      let response
      if (editingProduto) {
        response = await fetch(
          `${API_BASE_URL}/api/orcamentos/produtos/${editingProduto.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              produtoId: Number.parseInt(addEsquadriaForm.produtoId, 10),
              quantidade: Number.parseFloat(addEsquadriaForm.quantidade),
              largura: Number.parseFloat(addEsquadriaForm.largura),
              altura: Number.parseFloat(addEsquadriaForm.altura),
              codigo: addEsquadriaForm.codigo.trim(),
              ambiente: addEsquadriaForm.ambiente.trim(),
              vidroId: Number.parseInt(addEsquadriaForm.vidroId, 10),
              observacao: addEsquadriaForm.observacao.trim(),
            }),
          }
        )
      } else {
        const orcamentoId = Number.parseInt(id ?? '', 10)
        if (!orcamentoId) {
          setAddEsquadriaError('Orçamento inválido')
          return
        }
        response = await fetch(`${API_BASE_URL}/api/orcamentos/adicionar-esquadria`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orcamentoId,
            produtoId: Number.parseInt(addEsquadriaForm.produtoId, 10),
            quantidade: Number.parseFloat(addEsquadriaForm.quantidade),
            largura: Number.parseFloat(addEsquadriaForm.largura),
            altura: Number.parseFloat(addEsquadriaForm.altura),
            codigo: addEsquadriaForm.codigo.trim(),
            ambiente: addEsquadriaForm.ambiente.trim(),
            vidroId: Number.parseInt(addEsquadriaForm.vidroId, 10),
            observacao: addEsquadriaForm.observacao.trim(),
          }),
        })
      }

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || (editingProduto ? 'Não foi possível editar a esquadria' : 'Não foi possível adicionar a esquadria'))
      }

      await loadBudgetDetails()
      closeAddEsquadriaModal()
    } catch (error) {
      setAddEsquadriaError(
        error instanceof Error ? error.message : 'Erro ao salvar esquadria'
      )
    } finally {
      setAddEsquadriaSubmitting(false)
    }
  }

  const totalValue = items.reduce((sum, item) => sum + item.total, 0)
  const budgetProducts = Array.isArray(budget.produtos) ? budget.produtos : []
  const budgetArea =
    resolveBudgetNumber(budget, [
      'area',
      'Area',
      'calculoArea',
      'CalculoArea',
      'areaM2',
      'AreaM2',
      'totalArea',
    ]) ?? 48.49
  const freteObraNote = [
    resolveBudgetNumber(budget, ['distancia', 'Distancia']),
    resolveBudgetNumber(budget, ['fretes', 'Fretes']),
  ]
    .map((value, index) => {
      if (!value && value !== 0) {
        return ''
      }
      return index === 0 ? `${formatNumber(value)} Km` : `${formatNumber(value)} frete`
    })
    .filter(Boolean)
    .join(' | ')

  const pricingRows = useMemo(() => {
    const rawRows =
      budget?.precificacao || budget?.detalhesPrecificacao || budget?.precificacaoItens || []
    if (Array.isArray(rawRows) && rawRows.length > 0) {
      return rawRows.map((row, index) => {
        const value =
          row.valor ?? row.total ?? row.value ?? row.valorTotal ?? row.valorProdutoTotal ?? null
        const percent = row.percentual ?? row.percent ?? row.porcentagem ?? row.percentage ?? null
        const label = row.item ?? row.nome ?? row.descricao ?? `Item ${index + 1}`
        const note = row.obs ?? row.observacao ?? row.nota ?? row.info ?? ''
        const highlight = Boolean(row.destaque ?? row.totalizador ?? row.highlight)
        const negative = Boolean(row.negative) || Number.parseFloat(value) < 0
        return {
          id: row.id ?? `${label}-${index}`,
          label,
          value,
          percent,
          note,
          highlight,
          negative,
        }
      })
    }

    const fallbackRows = [
      {
        id: 'veka',
        label: 'Veka',
        value: resolveBudgetNumber(budget, ['totalVeka', 'TotalVeka', 'valorVeka', 'Veka']),
        percent: resolveBudgetNumber(budget, ['porcVeka', 'PorcVeka', 'percentVeka']),
      },
      {
        id: 'custo-extra',
        label: 'Custo Extra',
        value: resolveBudgetNumber(budget, [
          'custoExtra',
          'CustoExtra',
          'valorCustoExtra',
        ]),
        percent: resolveBudgetNumber(budget, ['porcCustoExtra', 'PorcCustoExtra']),
      },
      {
        id: 'ferragens',
        label: 'Ferragens',
        value: resolveBudgetNumber(budget, [
          'totalFerragens',
          'TotalFerragens',
          'valorFerragens',
        ]),
        percent: resolveBudgetNumber(budget, ['porcFerragens', 'PorcFerragens']),
      },
      {
        id: 'reforcos',
        label: 'Reforços',
        value: resolveBudgetNumber(budget, ['totalReforcos', 'TotalReforcos', 'valorReforcos']),
        percent: resolveBudgetNumber(budget, ['porcReforcos', 'PorcReforcos']),
      },
      {
        id: 'desconto-reforco',
        label: 'Desconto Reforço',
        value: resolveBudgetNumber(budget, [
          'descontoReforco',
          'DescontoReforco',
          'valorDescontoReforco',
        ]),
        percent: resolveBudgetNumber(budget, ['porcDescontoReforco', 'PorcDescontoReforco']),
      },
      {
        id: 'outros',
        label: 'Outros',
        value: resolveBudgetNumber(budget, ['totalOutros', 'TotalOutros', 'valorOutros']),
        percent: resolveBudgetNumber(budget, ['porcOutros', 'PorcOutros']),
      },
      {
        id: 'pvc',
        label: 'PVC',
        value: resolveBudgetNumber(budget, ['totalPVC', 'TotalPVC', 'valorPVC']),
        percent: resolveBudgetNumber(budget, ['porcPVC', 'PorcPVC']),
      },
      {
        id: 'vidro',
        label: 'Vidro',
        value: resolveBudgetNumber(budget, ['vidro', 'Vidro', 'valorVidro']),
        percent: resolveBudgetNumber(budget, ['porcVidro', 'PorcVidro']),
      },
      {
        id: 'desconto-vidro',
        label: 'Desconto Vidro',
        value: resolveBudgetNumber(budget, [
          'descontoVidro',
          'DescontoVidro',
          'valorDescontoVidro',
        ]),
        percent: resolveBudgetNumber(budget, ['porcDescontoVidro', 'PorcDescontoVidro']),
      },
      {
        id: 'motor',
        label: 'Motor',
        value: resolveBudgetNumber(budget, ['totalMotor', 'TotalMotor', 'valorMotor']),
        percent: resolveBudgetNumber(budget, ['porcMotor', 'PorcMotor']),
      },
      {
        id: 'embalagem',
        label: 'Embalagem',
        value: resolveBudgetNumber(budget, ['embalagem', 'Embalagem', 'valorEmbalagem']),
        percent: resolveBudgetNumber(budget, ['porcEmbalagem', 'PorcEmbalagem']),
      },
      {
        id: 'parafusos',
        label: 'Parafusos',
        value: resolveBudgetNumber(budget, ['parafusos', 'Parafusos', 'valorParafusos']),
        percent: resolveBudgetNumber(budget, ['porcParafusos', 'PorcParafusos']),
      },
      {
        id: 'total-material',
        label: 'Total Material',
        value: resolveBudgetNumber(budget, ['totalMaterial', 'TotalMaterial']),
        percent: resolveBudgetNumber(budget, ['porcTotalMaterial', 'PorcTotalMaterial']),
        highlight: true,
      },
      {
        id: 'desperdicio',
        label: 'Desperdício',
        value: resolveBudgetNumber(budget, ['desperdicio', 'Desperdicio', 'valorDesperdicio']),
        percent: resolveBudgetNumber(budget, ['porcDesperdicio', 'PorcDesperdicio']),
      },
      {
        id: 'frete-insumo',
        label: 'Frete Insumo',
        value: resolveBudgetNumber(budget, ['freteInsumo', 'FreteInsumo']),
        percent: resolveBudgetNumber(budget, ['porcFreteInsumo', 'PorcFreteInsumo']),
      },
      {
        id: 'mao-de-obra',
        label: 'M.O.',
        value: resolveBudgetNumber(budget, ['mo', 'MO', 'maoDeObra', 'valorMO']),
        percent: resolveBudgetNumber(budget, ['porcMO', 'PorcMO']),
        note: resolveBudgetText(budget, ['soldas', 'Soldas']),
      },
      {
        id: 'frete-obra',
        label: 'Frete Obra',
        value: resolveBudgetNumber(budget, ['freteObra', 'FreteObra']),
        percent: resolveBudgetNumber(budget, ['porcFreteObra', 'PorcFreteObra']),
        note: freteObraNote,
      },
      {
        id: 'instalacao',
        label: 'Instalação',
        value: resolveBudgetNumber(budget, ['instalacao', 'Instalacao', 'valorInstalacao']),
        percent: resolveBudgetNumber(budget, ['porcInstalacao', 'PorcInstalacao']),
      },
      {
        id: 'transporte-instalacao',
        label: 'Transporte Instalação',
        value: resolveBudgetNumber(budget, ['transporteInstalacao', 'TranspInst', 'transpInst']),
        percent: resolveBudgetNumber(budget, ['porcTranspInst', 'PorcTranspInst']),
      },
      {
        id: 'visita-tecnica',
        label: 'Visita Técnica',
        value: resolveBudgetNumber(budget, ['visitaTecnica', 'VisitaTecnica', 'valorVisitaTecnica']),
        percent: resolveBudgetNumber(budget, ['porcVisitaTecnica', 'PorcVisitaTecnica']),
      },
      {
        id: 'total-material-servicos',
        label: 'Total Material + Serviços',
        value: resolveBudgetNumber(budget, ['totalMatServ', 'TotalMatServ', 'totalMaterialServ']),
        percent: resolveBudgetNumber(budget, ['porcTotalMatServ', 'PorcTotalMatServ']),
        highlight: true,
      },
      {
        id: 'comissao',
        label: 'Comissão',
        value: resolveBudgetNumber(budget, ['valorComissao', 'comissaoValor']),
        percent: resolveBudgetNumber(budget, ['comissao', 'Comissao']),
      },
      {
        id: 'comissao-gerencial',
        label: 'Comissão Gerencial',
        value: resolveBudgetNumber(budget, [
          'valorComissaoGerencial',
          'comissaoGerencialValor',
        ]),
        percent: resolveBudgetNumber(budget, ['comissaoGerencial', 'ComissaoGerencial']),
      },
      {
        id: 'rt',
        label: 'RT',
        value: resolveBudgetNumber(budget, ['valorRT', 'rtValor', 'ValorRT']),
        percent: resolveBudgetNumber(budget, ['rt', 'RT']),
      },
      {
        id: 'desconto',
        label: 'Desconto',
        value: resolveBudgetNumber(budget, ['valorDesconto', 'descontoValor']),
        percent: resolveBudgetNumber(budget, ['desconto', 'Desconto']),
      },
      {
        id: 'impostos',
        label: 'Impostos',
        value: resolveBudgetNumber(budget, ['valorImposto', 'impostoValor']),
        percent: resolveBudgetNumber(budget, ['porcentagemImposto', 'PorcentagemImposto']),
      },
      {
        id: 'ctb',
        label: 'CTB',
        value: resolveBudgetNumber(budget, ['valorMargem', 'margemValor']),
        percent: resolveBudgetNumber(budget, ['margem', 'Margem']),
      },
      {
        id: 'desconto-adicional',
        label: 'Desconto Adicional',
        value: resolveBudgetNumber(budget, [
          'descontoAdicional',
          'DescontoAdicional',
          'valorDescontoAdicional',
        ]),
        percent: resolveBudgetNumber(budget, ['porcDescontoAdicional', 'PorcDescontoAdicional']),
        negative: true,
      },
      {
        id: 'total',
        label: 'Total',
        value: resolveBudgetNumber(budget, ['total', 'Total']),
        percent: 100,
        highlight: true,
      },
      {
        id: 'total-m2',
        label: `Total/m² (${formatNumber(budgetArea)} m²)`,
        value: resolveBudgetNumber(budget, ['totalM2', 'Totalm2', 'totalm2', 'totalPorMetro']),
        percent: null,
      },
    ]

    return fallbackRows.map((row) => ({
      ...row,
      negative: row.negative || Number.parseFloat(row.value) < 0,
      note: row.note || '',
    }))
  }, [budget, budgetArea, freteObraNote])

  return (
    <div className="app budget-detail-page">
      <Header />

      <main className="budget-detail-container">
        <header className="budget-detail-header">
          <button className="link-button" type="button" onClick={() => navigate('/Orcamentos')}>
            Voltar para orçamentos
          </button>
          <h1>Detalhes do Orçamento</h1>
        </header>

        <section className="budget-detail-card">
          {detailsLoading && <p>Carregando detalhes do orçamento...</p>}
          {!detailsLoading && detailsError && <p>{detailsError}</p>}
          <div className="budget-detail-info">
            <div className="budget-info-column">
              <p>
                <strong>{budget.cliente}</strong>
              </p>
              <p>Eng.</p>
              <p>Telefone: {budget.telefone}</p>
              <p>Email: {budget.email}</p>
              <p>
                Obra: {budget.obra} {budget.local ? `- ${budget.local}` : ''}
              </p>
              <p>Status: {budget.status}</p>
            </div>
            <div className="budget-info-column">
              <p>
                <strong>Orçamento: #{budget.id}</strong>
              </p>
              <p>Representante: {budget.representante || budget.usuario}</p>
              <p>Criado em: {budget.criadoEm}</p>
              <p>Modificado em: {budget.atualizadoEm}</p>
              <p>
                Versão: <strong>{budget.versao}</strong>
                {Array.isArray(budget.versoes) && budget.versoes.length > 1 && (
                  <span className="budget-versoes-nav">
                    {' '}|{' '}Versões:{' '}
                    {budget.versoes.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className={`budget-versao-link${String(v.versao) === String(budget.versao) ? ' budget-versao-link--active' : ''}`}
                        onClick={() => navigate(`/Orcamentos/${v.id}`)}
                      >
                        {v.versao}
                      </button>
                    ))}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="budget-detail-actions">
            <button className="chip-button" type="button" onClick={openAddEsquadriaModal}>
              Adicionar Esquadria
            </button>
            <button className="chip-button" type="button" onClick={() => navigate(`/Orcamentos/${id}/print`)}>
              Orçamento
            </button>
            <button className="chip-button" type="button" onClick={() => navigate(`/Orcamentos/${id}/memorial`)}>
              Memorial
            </button>
            <button className="chip-button" type="button" onClick={handleDuplicarOrcamento}>
              Duplicar
            </button>
            <button className="chip-button" type="button" onClick={openEditOrcamentoModal}>
              Editar Orçamento
            </button>
            <button className="chip-button" type="button" onClick={openAlterarUsuarioModal}>
              Alterar Usuário
            </button>
            <button className="chip-button" type="button" onClick={openAlterarStatusModal}>
              Alterar Status
            </button>
            <button className="chip-button chip-danger" type="button" onClick={handleExcluirOrcamento}>
              Excluir
            </button>
          </div>
        </section>

        <section className="budget-detail-grid budget-detail-grid-full">
          <div className="budget-detail-panel">
            <div className="budget-detail-tabs">
              <button
                className={`tab-button ${activeTab === 'resumo' ? 'tab-active' : ''}`}
                type="button"
                onClick={() => setActiveTab('resumo')}
              >
                Resumo do Orçamento
              </button>
              <button
                className={`tab-button ${activeTab === 'precificacao' ? 'tab-active' : ''}`}
                type="button"
                onClick={() => setActiveTab('precificacao')}
              >
                Detalhes da Precificação
              </button>
            </div>
            {activeTab === 'resumo' ? (
              <>
                <div className="budget-summary">
                  <p>
                    Área: <strong>{formatNumber(budgetArea)} m²</strong> | Cor da obra:{' '}
                    <strong>Branco</strong> | Alterar Linha
                  </p>
                </div>

                <div className="budget-products">
                  <div className="budget-products-header">
                    <h2>Produtos do orçamento</h2>
                    <span className="muted">{budgetProducts.length} produtos vinculados</span>
                  </div>

                  {budgetProducts.length === 0 && (
                    <div className="budget-empty">Nenhum produto vinculado.</div>
                  )}

                  <div className="budget-products-list">
                    {budgetProducts.map((produto, index) => {
                      const productKey = String(
                        produto.id || produto.produtoId || produto.codigoPeca || index
                      )
                      const productImage = resolveImageSrc(produto.foto)
                      const isImageAvailable = productImage && !brokenImages[productKey]
                      const unitPrice = produto.valorUnitario ?? produto.valorProdutoUnitario
                      const totalPrice = produto.valorTotal ?? produto.valorProdutoTotal

                      return (
                        <article className="budget-product-card" key={productKey}>
                          <div className="budget-product-top">
                            <span className="budget-product-code">
                              {produto.codigoPeca || '—'} - {produto.ambiente || '—'}
                            </span>
                            <div className="budget-product-top-actions">
                              <button className="link-button" type="button">
                                +Acessórios
                              </button>
                              <span className="budget-product-divider">|</span>
                              <button
                                className="icon-button"
                                type="button"
                                aria-label="Editar produto"
                                title="Editar esquadria"
                                onClick={() => openEditEsquadriaModal(produto)}
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path
                                    d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92-8.06 8.06zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </button>
                              <button
                                className="icon-button"
                                type="button"
                                aria-label="Duplicar produto"
                                title="Duplicar esquadria"
                                onClick={() => handleDuplicarEsquadria(produto.id)}
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path
                                    d="M16 1H4C3 1 2 2 2 3v14h2V3h12V1zm3 4H8C7 5 6 6 6 7v14c0 1 1 2 2 2h11c1 0 2-1 2-2V7c0-1-1-2-2-2zm0 16H8V7h11v14z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </button>
                              <button
                                className="icon-button"
                                type="button"
                                aria-label="Excluir produto"
                                title="Excluir esquadria"
                                onClick={() => handleExcluirEsquadria(produto.id)}
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path
                                    d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="budget-product-header">
                            <div className="budget-product-image">
                              {isImageAvailable ? (
                                <img
                                  src={productImage}
                                  alt={produto.nome || 'Produto'}
                                  onError={() => {
                                    setBrokenImages((current) => ({
                                      ...current,
                                      [productKey]: true,
                                    }))
                                  }}
                                />
                              ) : (
                                <div className="budget-product-image-placeholder">Sem imagem</div>
                              )}
                            </div>
                            <div className="budget-product-main">
                              <h3 className="budget-product-title">
                                {produto.nome || produto.codigoPeca || 'Produto'}
                              </h3>
                              <div className="budget-product-meta">
                                <span className="budget-product-meta-row">
                                  <strong>Cor:</strong> {produto.cor || '—'}
                                </span>
                                <span className="budget-product-meta-row">
                                  <strong>Largura:</strong>{' '}
                                  {editingMedidas[produto.id] ? (
                                    <>
                                      <input
                                        className="inline-edit-input"
                                        type="number"
                                        value={editingMedidas[produto.id].largura}
                                        onChange={(e) =>
                                          setEditingMedidas((cur) => ({
                                            ...cur,
                                            [produto.id]: {
                                              ...cur[produto.id],
                                              largura: e.target.value,
                                            },
                                          }))
                                        }
                                        disabled={savingMedidas[produto.id]}
                                      />
                                      <strong style={{ marginLeft: 8 }}>Altura:</strong>{' '}
                                      <input
                                        className="inline-edit-input"
                                        type="number"
                                        value={editingMedidas[produto.id].altura}
                                        onChange={(e) =>
                                          setEditingMedidas((cur) => ({
                                            ...cur,
                                            [produto.id]: {
                                              ...cur[produto.id],
                                              altura: e.target.value,
                                            },
                                          }))
                                        }
                                        disabled={savingMedidas[produto.id]}
                                      />
                                      <button
                                        className="inline-edit-save"
                                        type="button"
                                        onClick={() => saveMedidas(produto.id)}
                                        disabled={savingMedidas[produto.id]}
                                        title="Salvar medidas"
                                      >
                                        {savingMedidas[produto.id] ? '...' : '✓'}
                                      </button>
                                      <button
                                        className="inline-edit-cancel"
                                        type="button"
                                        onClick={() => cancelEditingMedidas(produto.id)}
                                        disabled={savingMedidas[produto.id]}
                                        title="Cancelar"
                                      >
                                        ✕
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {formatNumber(produto.largura)}{' '}
                                      <strong style={{ marginLeft: 8 }}>Altura:</strong>{' '}
                                      {formatNumber(produto.altura)}{' '}
                                      <button
                                        className="icon-button inline-edit-icon"
                                        type="button"
                                        title="Editar medidas"
                                        onClick={() =>
                                          startEditingMedidas(
                                            produto.id,
                                            produto.largura,
                                            produto.altura
                                          )
                                        }
                                      >
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                          <path
                                            d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92-8.06 8.06zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                            fill="currentColor"
                                          />
                                        </svg>
                                      </button>
                                    </>
                                  )}
                                </span>
                                <span className="budget-product-meta-row">
                                  <strong>Vidro:</strong>{' '}
                                  {editingVidro[produto.id] !== undefined ? (
                                    <>
                                      <select
                                        className="inline-edit-select"
                                        value={editingVidro[produto.id]}
                                        onChange={(e) =>
                                          setEditingVidro((cur) => ({
                                            ...cur,
                                            [produto.id]: e.target.value,
                                          }))
                                        }
                                        disabled={savingVidro[produto.id]}
                                      >
                                        <option value="">Selecione</option>
                                        {glassOptions.map((vidro) => (
                                          <option key={vidro.id} value={vidro.id}>
                                            {vidro.name || vidro.nome}
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        className="inline-edit-save"
                                        type="button"
                                        onClick={() => saveVidro(produto.id)}
                                        disabled={
                                          savingVidro[produto.id] || !editingVidro[produto.id]
                                        }
                                        title="Salvar vidro"
                                      >
                                        {savingVidro[produto.id] ? '...' : '✓'}
                                      </button>
                                      <button
                                        className="inline-edit-cancel"
                                        type="button"
                                        onClick={() => cancelEditingVidro(produto.id)}
                                        disabled={savingVidro[produto.id]}
                                        title="Cancelar"
                                      >
                                        ✕
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {produto.vidroNome || (produto.vidroId ? `#${produto.vidroId}` : '—')}{' '}
                                      <button
                                        className="icon-button inline-edit-icon"
                                        type="button"
                                        title="Editar vidro"
                                        onClick={() => {
                                          if (glassOptions.length === 0) {
                                            loadAddEsquadriaDependencies()
                                          }
                                          startEditingVidro(produto.id, produto.vidroId)
                                        }}
                                      >
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                          <path
                                            d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92-8.06 8.06zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                            fill="currentColor"
                                          />
                                        </svg>
                                      </button>
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="budget-product-divider-line" />

                          <div className="budget-product-values budget-product-values-main">
                            <div>
                              <span>Quantidade:</span>
                              <strong>{formatNumber(produto.quantidade)}</strong>
                            </div>
                            {unitPrice !== undefined && (
                              <div>
                                <span>Valor Unitário:</span>
                                <strong>{formatMoney(unitPrice)}</strong>
                              </div>
                            )}
                            {totalPrice !== undefined && (
                              <div>
                                <span>Valor Total:</span>
                                <strong>{formatMoney(totalPrice)}</strong>
                              </div>
                            )}
                          </div>

                          <div className="budget-product-obs budget-product-obs-main">
                            <strong>Obs:</strong> {produto.observacao || '—'}
                          </div>

                          <div className="budget-product-accessories">
                            <div className="budget-accessories-title">Acessórios:</div>
                            {Array.isArray(produto.acessorios) && produto.acessorios.length > 0 ? (
                              <div className="budget-accessories-list">
                                {produto.acessorios.map((acessorio) => {
                                  const accessoryUnit =
                                    acessorio.valorUnitario ?? acessorio.valorProdutoUnitario
                                  const accessoryTotal =
                                    acessorio.valorTotal ?? acessorio.valorProdutoTotal
                                  return (
                                    <div
                                      className="budget-accessory-card"
                                      key={`${produto.id}-${acessorio.id || acessorio.acessorioId}`}
                                    >
                                      <div className="budget-accessory-image">
                                        <div className="budget-product-image-placeholder">
                                          Sem imagem
                                        </div>
                                      </div>
                                      <div className="budget-accessory-main">
                                        <div className="budget-accessory-title-row">
                                          <strong className="budget-accessory-title">
                                            Acessório {acessorio.acessorioId || acessorio.id || ''}
                                          </strong>
                                          <div className="budget-accessory-actions">
                                            <button
                                              className="icon-button"
                                              type="button"
                                              aria-label="Editar acessório"
                                            >
                                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path
                                                  d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92-8.06 8.06zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                                  fill="currentColor"
                                                />
                                              </svg>
                                            </button>
                                            <button
                                              className="icon-button"
                                              type="button"
                                              aria-label="Excluir acessório"
                                            >
                                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path
                                                  d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z"
                                                  fill="currentColor"
                                                />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                        <div className="budget-accessory-meta">
                                          <span>
                                            <strong>Largura:</strong>{' '}
                                            {formatNumber(acessorio.largura)}
                                          </span>
                                          <span>
                                            <strong>Altura:</strong> {formatNumber(acessorio.altura)}
                                          </span>
                                        </div>
                                        <div className="budget-product-divider-line" />
                                        <div className="budget-product-values budget-accessory-values">
                                          <div>
                                            <span>Quantidade:</span>
                                            <strong>{formatNumber(acessorio.quantidade)}</strong>
                                          </div>
                                          {accessoryUnit !== undefined && (
                                            <div>
                                              <span>Valor Unitário:</span>
                                              <strong>{formatMoney(accessoryUnit)}</strong>
                                            </div>
                                          )}
                                          {accessoryTotal !== undefined && (
                                            <div>
                                              <span>Valor Total:</span>
                                              <strong>{formatMoney(accessoryTotal)}</strong>
                                            </div>
                                          )}
                                        </div>
                                        <div className="budget-product-obs">
                                          <strong>Obs:</strong> {acessorio.observacao || '—'}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="budget-empty">Nenhum acessório cadastrado.</div>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="budget-pricing">
                <div className="budget-pricing-header">
                  <h2>Detalhes da precificação</h2>
                  <button className="icon-button" type="button" aria-label="Imprimir precificação">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M6 7V3h12v4h2v10h-4v4H8v-4H4V7h2zm2-2v2h8V5H8zm8 12H8v2h8v-2zm2-2V9H6v6h12z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
                <div className="budget-pricing-table-wrapper">
                  <table className="budget-pricing-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Valor</th>
                        <th>%</th>
                        <th>*</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingRows.map((row) => (
                        <tr
                          key={row.id}
                          className={row.highlight ? 'pricing-row-highlight' : undefined}
                        >
                          <td className="pricing-cell-item">{row.label}</td>
                          <td
                            className={`pricing-cell-value ${
                              row.negative ? 'pricing-value-negative' : ''
                            }`}
                          >
                            {formatMoney(row.value)}
                          </td>
                          <td className="pricing-cell-percent">
                            {row.percent === null || row.percent === undefined || row.percent === ''
                              ? ''
                              : formatPercent(row.percent)}
                          </td>
                          <td className="pricing-cell-note">
                            {row.note ? row.note : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {isEditOrcamentoModalOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content budget-add-esquadria-modal">
              <div className="modal-header">
                <h2>Editar Orçamento</h2>
                <button
                  type="button"
                  className="icon-button"
                  onClick={closeEditOrcamentoModal}
                  disabled={editOrcamentoSubmitting}
                >
                  X
                </button>
              </div>

              <form className="modal-form" onSubmit={handleEditOrcamentoSubmit}>
                <label className="modal-form-group modal-form-group-full">
                  Eng / Arq
                  <input
                    className="modal-input"
                    type="text"
                    value={editOrcamentoForm.engNome ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, engNome: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Cliente
                  <input
                    className="modal-input"
                    type="text"
                    value={editOrcamentoForm.clienteNome ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, clienteNome: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Telefone
                  <input
                    className="modal-input"
                    type="text"
                    value={editOrcamentoForm.clienteTel ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, clienteTel: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group modal-form-group-full">
                  Email
                  <input
                    className="modal-input"
                    type="text"
                    value={editOrcamentoForm.clienteEmail ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, clienteEmail: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group modal-form-group-full">
                  Endereço
                  <input
                    className="modal-input"
                    type="text"
                    value={editOrcamentoForm.endereco ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, endereco: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Estado
                  <select
                    className="modal-select"
                    value={editOrcamentoUfId}
                    onChange={(e) => handleEditOrcamentoUfChange(e.target.value)}
                    disabled={editOrcamentoSubmitting}
                  >
                    <option value="">Selecione o estado</option>
                    {estadoOptions.map((uf) => (
                      <option key={uf.id} value={uf.id}>
                        {uf.sigla}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modal-form-group">
                  Cidade
                  <select
                    className="modal-select"
                    value={editOrcamentoForm.cidadeId ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, cidadeId: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting || cidadesLoading || !editOrcamentoUfId}
                  >
                    <option value="">
                      {cidadesLoading ? 'Carregando...' : 'Selecione a cidade'}
                    </option>
                    {cidadeOptions.map((cidade) => (
                      <option key={cidade.id} value={cidade.id}>
                        {cidade.cidade}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modal-form-group">
                  Fase da Obra
                  <select
                    className="modal-select"
                    value={editOrcamentoForm.faseObra ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, faseObra: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  >
                    <option value="">Selecione</option>
                    {['Projeto', 'Fundação', 'Primeira Laje', 'Segunda Laje', 'Telhado', 'Reboco', 'Acabamento', 'Reforma'].map((fase) => (
                      <option key={fase} value={fase}>{fase}</option>
                    ))}
                  </select>
                </label>

                <label className="modal-form-group">
                  Cor
                  <select
                    className="modal-select"
                    value={editOrcamentoForm.cor ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, cor: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  >
                    <option value="">Selecione a cor</option>
                    {['Aço Cortain', 'Branco', 'Bronze Platin', 'Carvalho Americano', 'Carvalho Claro', 'Chumbo', 'Colors', 'Nogueira', 'Ouro', 'Prata', 'Preto Absoluto', 'Tabaco'].map((cor) => (
                      <option key={cor} value={cor}>{cor}</option>
                    ))}
                  </select>
                </label>

                <label className="modal-form-group">
                  Comissão (%)
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.comissao ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, comissao: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Comissão Gerencial (%)
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.comissaoGerencial ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, comissaoGerencial: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Desconto (%)
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.desconto ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, desconto: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  RT (%)
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.rt ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, rt: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Distância (km)
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.distancia ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, distancia: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Visitas
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.visitas ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, visitas: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Fretes
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.fretes ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, fretes: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Nota (%)
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.nota ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, nota: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Margem (%)
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.margem ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, margem: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Desconto Adicional (R$)
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.descontoAdicional ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, descontoAdicional: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Custo Extra Veka (%)
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.custoExtra ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, custoExtra: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Desconto Vidro (%)
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.descontoVidro ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, descontoVidro: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Desconto Reforço (%)
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    value={editOrcamentoForm.descontoReforco ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, descontoReforco: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                  />
                </label>

                <div className="modal-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editOrcamentoForm.semInstalacao ?? false}
                      onChange={(e) =>
                        setEditOrcamentoForm((prev) => ({ ...prev, semInstalacao: e.target.checked }))
                      }
                      disabled={editOrcamentoSubmitting}
                    />
                    Sem Instalação
                  </label>
                </div>

                <div className="modal-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editOrcamentoForm.freteAutomatico ?? false}
                      onChange={(e) =>
                        setEditOrcamentoForm((prev) => ({ ...prev, freteAutomatico: e.target.checked }))
                      }
                      disabled={editOrcamentoSubmitting}
                    />
                    Frete Automático
                  </label>
                </div>

                <label className="modal-form-group modal-form-group-full">
                  Observações
                  <textarea
                    className="modal-input"
                    rows={3}
                    value={editOrcamentoForm.observacao ?? ''}
                    onChange={(e) =>
                      setEditOrcamentoForm((prev) => ({ ...prev, observacao: e.target.value }))
                    }
                    disabled={editOrcamentoSubmitting}
                    style={{ resize: 'vertical' }}
                  />
                </label>

                {editOrcamentoError && (
                  <div className="modal-form-group-full budget-modal-feedback">
                    {editOrcamentoError}
                  </div>
                )}

                <div className="modal-form-group-full budget-add-modal-actions">
                  <button
                    type="button"
                    className="chip-button"
                    onClick={closeEditOrcamentoModal}
                    disabled={editOrcamentoSubmitting}
                  >
                    Fechar
                  </button>
                  <button type="submit" className="chip-button" disabled={editOrcamentoSubmitting}>
                    {editOrcamentoSubmitting ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAlterarUsuarioModalOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Alterar Usuário</h2>
                <button
                  type="button"
                  className="icon-button"
                  onClick={closeAlterarUsuarioModal}
                  disabled={alterarUsuarioSubmitting}
                >
                  X
                </button>
              </div>

              <form className="modal-form" onSubmit={handleAlterarUsuarioSubmit}>
                <label className="modal-form-group modal-form-group-full">
                  Usuário
                  <select
                    className="modal-select"
                    value={selectedUsuarioId}
                    onChange={(e) => setSelectedUsuarioId(e.target.value)}
                    disabled={alterarUsuarioSubmitting}
                  >
                    <option value="">Selecione o usuário</option>
                    {usuarioOptions.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nome}
                      </option>
                    ))}
                  </select>
                </label>

                {alterarUsuarioError && (
                  <div className="modal-form-group-full budget-modal-feedback">
                    {alterarUsuarioError}
                  </div>
                )}

                <div className="modal-form-group-full budget-add-modal-actions">
                  <button
                    type="button"
                    className="chip-button"
                    onClick={closeAlterarUsuarioModal}
                    disabled={alterarUsuarioSubmitting}
                  >
                    Fechar
                  </button>
                  <button type="submit" className="chip-button" disabled={alterarUsuarioSubmitting}>
                    {alterarUsuarioSubmitting ? 'Salvando...' : 'Alterar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAlterarStatusModalOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Alterar Status</h2>
                <button
                  type="button"
                  className="icon-button"
                  onClick={closeAlterarStatusModal}
                  disabled={alterarStatusSubmitting}
                >
                  X
                </button>
              </div>

              <form className="modal-form" onSubmit={handleAlterarStatusSubmit}>
                <label className="modal-form-group modal-form-group-full">
                  Status
                  <select
                    className="modal-select"
                    value={selectedStatusId}
                    onChange={(e) => setSelectedStatusId(e.target.value)}
                    disabled={alterarStatusSubmitting}
                  >
                    <option value="">Selecione o status</option>
                    {statusOptions.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.nome}
                      </option>
                    ))}
                  </select>
                </label>

                {alterarStatusError && (
                  <div className="modal-form-group-full budget-modal-feedback">
                    {alterarStatusError}
                  </div>
                )}

                <div className="modal-form-group-full budget-add-modal-actions">
                  <button
                    type="button"
                    className="chip-button"
                    onClick={closeAlterarStatusModal}
                    disabled={alterarStatusSubmitting}
                  >
                    Fechar
                  </button>
                  <button type="submit" className="chip-button" disabled={alterarStatusSubmitting}>
                    {alterarStatusSubmitting ? 'Salvando...' : 'Alterar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAddEsquadriaModalOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content budget-add-esquadria-modal">
              <div className="modal-header">
                <h2>{editingProduto ? 'Editar Esquadria' : 'Adicionar Esquadria'}</h2>
                <button type="button" className="icon-button" onClick={closeAddEsquadriaModal}>
                  X
                </button>
              </div>

              <form className="modal-form" onSubmit={handleAddEsquadriaSubmit}>
                <label className="modal-form-group">
                  Cor
                  <select
                    className="modal-select"
                    value={addEsquadriaForm.corId}
                    onChange={(event) => {
                      handleAddEsquadriaFieldChange('corId', event.target.value)
                    }}
                    disabled={addEsquadriaLoading || addEsquadriaSubmitting}
                  >
                    <option value="">Selecione</option>
                    {colorOptions.map((cor) => (
                      <option key={cor.id} value={cor.id}>
                        {cor.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modal-form-group">
                  Linha
                  <select
                    className="modal-select"
                    value={addEsquadriaForm.linhaId}
                    onChange={(event) => {
                      handleAddEsquadriaFieldChange('linhaId', event.target.value)
                    }}
                    disabled={addEsquadriaLoading || addEsquadriaSubmitting}
                  >
                    <option value="">Selecione</option>
                    {lineOptions.map((linha) => (
                      <option key={linha.id} value={linha.id}>
                        {linha.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modal-form-group modal-form-group-full">
                  Produto
                  <select
                    className="modal-select"
                    value={addEsquadriaForm.produtoId}
                    onChange={(event) => {
                      handleAddEsquadriaFieldChange('produtoId', event.target.value)
                    }}
                    disabled={
                      addEsquadriaLoading ||
                      addEsquadriaSubmitting ||
                      filteredProductsLoading ||
                      !addEsquadriaForm.corId ||
                      !addEsquadriaForm.linhaId
                    }
                  >
                    <option value="0">Selecione</option>
                    {filteredProducts.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modal-form-group">
                  Quantidade
                  <input
                    className="modal-input"
                    type="number"
                    min="1"
                    step="1"
                    value={addEsquadriaForm.quantidade}
                    onChange={(event) => {
                      handleAddEsquadriaFieldChange('quantidade', event.target.value)
                    }}
                    disabled={addEsquadriaSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Largura
                  <input
                    className="modal-input"
                    type="number"
                    min="1"
                    step="0.01"
                    value={addEsquadriaForm.largura}
                    onChange={(event) => {
                      handleAddEsquadriaFieldChange('largura', event.target.value)
                    }}
                    disabled={addEsquadriaSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Altura
                  <input
                    className="modal-input"
                    type="number"
                    min="1"
                    step="0.01"
                    value={addEsquadriaForm.altura}
                    onChange={(event) => {
                      handleAddEsquadriaFieldChange('altura', event.target.value)
                    }}
                    disabled={addEsquadriaSubmitting}
                  />
                </label>

                <label className="modal-form-group">
                  Código
                  <input
                    className="modal-input"
                    type="text"
                    value={addEsquadriaForm.codigo}
                    onChange={(event) => {
                      handleAddEsquadriaFieldChange('codigo', event.target.value)
                    }}
                    disabled={addEsquadriaSubmitting}
                  />
                </label>

                <label className="modal-form-group modal-form-group-full">
                  Ambiente
                  <input
                    className="modal-input"
                    type="text"
                    value={addEsquadriaForm.ambiente}
                    onChange={(event) => {
                      handleAddEsquadriaFieldChange('ambiente', event.target.value)
                    }}
                    disabled={addEsquadriaSubmitting}
                  />
                </label>

                <label className="modal-form-group modal-form-group-full">
                  Vidro
                  <select
                    className="modal-select"
                    value={addEsquadriaForm.vidroId}
                    onChange={(event) => {
                      handleAddEsquadriaFieldChange('vidroId', event.target.value)
                    }}
                    disabled={addEsquadriaLoading || addEsquadriaSubmitting}
                  >
                    <option value="0">Selecione</option>
                    {glassOptions.map((vidro) => (
                      <option key={vidro.id} value={vidro.id}>
                        {vidro.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modal-form-group modal-form-group-full">
                  Observação
                  <input
                    className="modal-input"
                    type="text"
                    value={addEsquadriaForm.observacao}
                    onChange={(event) => {
                      handleAddEsquadriaFieldChange('observacao', event.target.value)
                    }}
                    disabled={addEsquadriaSubmitting}
                  />
                </label>

                {(addEsquadriaError || filteredProductsLoading) && (
                  <div className="modal-form-group-full budget-modal-feedback">
                    {filteredProductsLoading
                      ? 'Carregando produtos...'
                      : addEsquadriaError}
                  </div>
                )}

                <div className="modal-form-group-full budget-add-modal-actions">
                  <button
                    type="button"
                    className="chip-button"
                    onClick={closeAddEsquadriaModal}
                    disabled={addEsquadriaSubmitting}
                  >
                    Fechar
                  </button>
                  <button type="submit" className="chip-button" disabled={addEsquadriaSubmitting}>
                    {addEsquadriaSubmitting
                      ? editingProduto ? 'Salvando...' : 'Adicionando...'
                      : editingProduto ? 'Salvar' : 'Adicionar'}
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

export default OrcamentoDetalhes
