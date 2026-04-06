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
  representante: 'Representante',
  criadoEm: '01/01/2026 09:00',
  atualizadoEm: '01/01/2026 09:00',
  versao: '1',
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
    resetAddEsquadriaForm()
  }

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

    const orcamentoId = Number.parseInt(id ?? '', 10)
    if (!orcamentoId) {
      setAddEsquadriaError('Orçamento inválido')
      return
    }

    try {
      setAddEsquadriaSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/api/orcamentos/adicionar-esquadria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Não foi possível adicionar a esquadria')
      }

      await loadBudgetDetails()
      closeAddEsquadriaModal()
    } catch (error) {
      setAddEsquadriaError(
        error instanceof Error ? error.message : 'Erro ao adicionar esquadria'
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
              <p>Versão: {budget.versao}</p>
            </div>
          </div>

          <div className="budget-detail-actions">
            <button className="chip-button" type="button" onClick={openAddEsquadriaModal}>
              Adicionar Esquadria
            </button>
            <button className="chip-button" type="button">
              Orçamento
            </button>
            <button className="chip-button" type="button">
              Memorial
            </button>
            <button className="chip-button" type="button">
              Duplicar
            </button>
            <button className="chip-button" type="button">
              Editar Orçamento
            </button>
            <button className="chip-button" type="button">
              Alterar Usuário
            </button>
            <button className="chip-button" type="button">
              Alterar Status
            </button>
            <button className="chip-button chip-danger" type="button">
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
                                aria-label="Excluir produto"
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
                                <span>
                                  <strong>Cor:</strong> {produto.cor || '—'}
                                </span>
                                <span>
                                  <strong>Largura:</strong> {formatNumber(produto.largura)}
                                </span>
                                <span>
                                  <strong>Altura:</strong> {formatNumber(produto.altura)}
                                </span>
                                <span>
                                  <strong>Vidro:</strong>{' '}
                                  {produto.vidroId ? `#${produto.vidroId}` : '—'}
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

        {isAddEsquadriaModalOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content budget-add-esquadria-modal">
              <div className="modal-header">
                <h2>Adicionar Esquadria</h2>
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
                    {addEsquadriaSubmitting ? 'Adicionando...' : 'Adicionar'}
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
