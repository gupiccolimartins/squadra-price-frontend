import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const initialFormData = {
  tipoResponsavel: 'Eng.',
  nomeResponsavel: '',
  nomeCliente: '',
  telefone: '',
  email: '',
  endereco: '',
  ufId: '',
  cidadeId: '',
  faseObra: '',
  cor: '',
  comissao: '4',
  comissaoGerencial: '2.5',
  desconto: '5',
  rt: '0',
  distancia: '100',
  visitas: '1',
  fretes: '1',
  nota: '100',
  margem: '29',
  custoExtra: '25',
  descontoVidro: '0',
  descontoReforco: '0',
  semInstalacao: false,
  freteAutomatico: true,
  observacoes: '',
}

const fasesObra = [
  'Projeto',
  'Fundacao',
  'Primeira Laje',
  'Segunda Laje',
  'Telhado',
  'Reboco',
  'Acabamento',
  'Reforma',
]

const cores = [
  'Aco Cortain',
  'Branco',
  'Bronze Platin',
  'Carvalho Americano',
  'Carvalho Claro',
  'Chumbo',
  'Nogueira',
  'Ouro',
  'Prata',
  'Preto Absoluto',
  'Tabaco',
]

function CriarOrcamento() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormData)
  const [ufs, setUfs] = useState([])
  const [cidades, setCidades] = useState([])
  const [loadingUfs, setLoadingUfs] = useState(true)
  const [loadingCidades, setLoadingCidades] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadUfs = async () => {
      try {
        setLoadingUfs(true)
        const response = await fetch(`${API_BASE_URL}/api/cidades-estados/estados?page=0&size=1000`)
        if (!response.ok) {
          throw new Error(`Falha ao buscar UFs (${response.status})`)
        }
        const data = await response.json()
        const content = Array.isArray(data?.content) ? data.content : []
        if (isMounted) {
          setUfs(content)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setUfs([])
          setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar UFs')
        }
      } finally {
        if (isMounted) {
          setLoadingUfs(false)
        }
      }
    }

    loadUfs()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadCidades = async () => {
      if (!formData.ufId) {
        setCidades([])
        return
      }
      try {
        setLoadingCidades(true)
        const response = await fetch(`${API_BASE_URL}/api/cidades-estados/estados/${formData.ufId}/cidades`)
        if (!response.ok) {
          throw new Error(`Falha ao buscar cidades (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setCidades(Array.isArray(data) ? data : [])
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setCidades([])
          setErrorMessage(error instanceof Error ? error.message : 'Erro ao buscar cidades')
        }
      } finally {
        if (isMounted) {
          setLoadingCidades(false)
        }
      }
    }

    loadCidades()

    return () => {
      isMounted = false
    }
  }, [formData.ufId])

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((previousData) => {
      const next = {
        ...previousData,
        [name]: type === 'checkbox' ? checked : value,
      }

      if (name === 'ufId') {
        next.cidadeId = ''
      }

      if (name === 'freteAutomatico' && checked) {
        next.fretes = '1'
      }

      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFeedbackMessage('')
    setErrorMessage('')

    const payload = {
      tipoResponsavel: formData.tipoResponsavel,
      nomeResponsavel: formData.nomeResponsavel,
      nomeCliente: formData.nomeCliente,
      telefone: formData.telefone,
      email: formData.email,
      endereco: formData.endereco,
      cidadeId: formData.cidadeId ? Number.parseInt(formData.cidadeId, 10) : null,
      faseObra: formData.faseObra,
      cor: formData.cor,
      comissao: Number.parseFloat(formData.comissao),
      comissaoGerencial: Number.parseFloat(formData.comissaoGerencial),
      desconto: Number.parseFloat(formData.desconto),
      rt: Number.parseFloat(formData.rt),
      distancia: Number.parseFloat(formData.distancia),
      visitas: Number.parseFloat(formData.visitas),
      fretes: Number.parseFloat(formData.fretes),
      nota: Number.parseFloat(formData.nota),
      margem: Number.parseFloat(formData.margem),
      custoExtra: Number.parseFloat(formData.custoExtra),
      descontoVidro: Number.parseFloat(formData.descontoVidro),
      descontoReforco: Number.parseFloat(formData.descontoReforco),
      semInstalacao: formData.semInstalacao,
      freteAutomatico: formData.freteAutomatico,
      observacoes: formData.observacoes,
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/api/orcamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(`Falha ao criar orçamento (${response.status})`)
      }
      const data = await response.json()
      if (data?.id) {
        navigate(`/Orcamentos/${data.id}`)
        return
      }
      setFeedbackMessage('Orcamento criado com sucesso.')
      setFormData(initialFormData)
      setCidades([])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao criar orçamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app create-budget-page">
      <Header />

      <main className="create-budget-container">
        <section className="create-budget-card">
          <h1 className="create-budget-title">Criar Orcamento</h1>

          <form className="create-budget-form" onSubmit={handleSubmit}>
            <div className="create-budget-grid create-budget-grid-responsavel">
              <div className="create-budget-field">
                <label htmlFor="tipoResponsavel">Eng / Arq</label>
                <select
                  id="tipoResponsavel"
                  name="tipoResponsavel"
                  value={formData.tipoResponsavel}
                  onChange={handleFieldChange}
                >
                  <option value="Eng.">Engenheiro(a)</option>
                  <option value="Arq.">Arquiteto(a)</option>
                </select>
              </div>

              <div className="create-budget-field create-budget-field-grow">
                <label htmlFor="nomeResponsavel">Nome do Engenheiro(a) / Arquiteto(a)</label>
                <input
                  id="nomeResponsavel"
                  name="nomeResponsavel"
                  type="text"
                  value={formData.nomeResponsavel}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            <div className="create-budget-grid create-budget-grid-3">
              <div className="create-budget-field create-budget-field-grow">
                <label htmlFor="nomeCliente">Cliente</label>
                <input
                  id="nomeCliente"
                  name="nomeCliente"
                  type="text"
                  value={formData.nomeCliente}
                  onChange={handleFieldChange}
                />
              </div>
              <div className="create-budget-field">
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  name="telefone"
                  type="text"
                  value={formData.telefone}
                  onChange={handleFieldChange}
                />
              </div>
              <div className="create-budget-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleFieldChange} />
              </div>
            </div>

            <div className="create-budget-grid create-budget-grid-3">
              <div className="create-budget-field create-budget-field-grow">
                <label htmlFor="endereco">Endereco</label>
                <input
                  id="endereco"
                  name="endereco"
                  type="text"
                  value={formData.endereco}
                  onChange={handleFieldChange}
                />
              </div>
              <div className="create-budget-field">
                <label htmlFor="ufId">UF</label>
                <select
                  id="ufId"
                  name="ufId"
                  value={formData.ufId}
                  onChange={handleFieldChange}
                  disabled={loadingUfs}
                  required
                >
                  <option value="">{loadingUfs ? 'Carregando...' : 'UF'}</option>
                  {ufs.map((uf) => (
                    <option key={uf.id} value={uf.id}>
                      {uf.sigla}
                    </option>
                  ))}
                </select>
              </div>
              <div className="create-budget-field">
                <label htmlFor="cidadeId">Cidade</label>
                <select
                  id="cidadeId"
                  name="cidadeId"
                  value={formData.cidadeId}
                  onChange={handleFieldChange}
                  disabled={!formData.ufId || loadingCidades}
                  required
                >
                  <option value="">
                    {!formData.ufId ? 'Cidade' : loadingCidades ? 'Carregando...' : 'Selecione'}
                  </option>
                  {cidades.map((cidade) => (
                    <option key={cidade.id} value={cidade.id}>
                      {cidade.cidade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="create-budget-grid create-budget-grid-2">
              <div className="create-budget-field">
                <label htmlFor="faseObra">Fase da Obra</label>
                <select id="faseObra" name="faseObra" value={formData.faseObra} onChange={handleFieldChange}>
                  <option value="">Fase da Obra</option>
                  {fasesObra.map((fase) => (
                    <option key={fase} value={fase}>
                      {fase}
                    </option>
                  ))}
                </select>
              </div>
              <div className="create-budget-field">
                <label htmlFor="cor">Selecione a Cor</label>
                <select id="cor" name="cor" value={formData.cor} onChange={handleFieldChange}>
                  <option value="">Selecione</option>
                  {cores.map((cor) => (
                    <option key={cor} value={cor}>
                      {cor}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="create-budget-metrics">
              <span className="create-budget-section-label">Premissas</span>
              <div className="create-budget-grid create-budget-grid-5">
                <div className="create-budget-field create-budget-metric-field">
                  <input
                    id="comissao"
                    name="comissao"
                    type="number"
                    step="0.1"
                    value={formData.comissao}
                    onChange={handleFieldChange}
                  />
                  <label htmlFor="comissao">Comissao (%)</label>
                </div>
                <div className="create-budget-field create-budget-metric-field">
                  <input
                    id="comissaoGerencial"
                    name="comissaoGerencial"
                    type="number"
                    step="0.1"
                    value={formData.comissaoGerencial}
                    onChange={handleFieldChange}
                  />
                  <label htmlFor="comissaoGerencial">Comissao Gerencial (%)</label>
                </div>
                <div className="create-budget-field create-budget-metric-field">
                  <input
                    id="desconto"
                    name="desconto"
                    type="number"
                    step="0.1"
                    value={formData.desconto}
                    onChange={handleFieldChange}
                  />
                  <label htmlFor="desconto">Desconto (%)</label>
                </div>
                <div className="create-budget-field create-budget-metric-field">
                  <input id="rt" name="rt" type="number" step="0.1" value={formData.rt} onChange={handleFieldChange} />
                  <label htmlFor="rt">RT (%)</label>
                </div>
                <div className="create-budget-field create-budget-metric-field">
                  <input id="distancia" name="distancia" type="number" value={formData.distancia} onChange={handleFieldChange} />
                  <label htmlFor="distancia">Distancia (Km)</label>
                </div>
              </div>

              <div className="create-budget-grid create-budget-grid-5">
                <div className="create-budget-field create-budget-metric-field">
                  <input id="visitas" name="visitas" type="number" value={formData.visitas} onChange={handleFieldChange} />
                  <label htmlFor="visitas">Visitas</label>
                </div>
                <div className="create-budget-field create-budget-metric-field">
                  <input
                    id="fretes"
                    name="fretes"
                    type="number"
                    value={formData.fretes}
                    onChange={handleFieldChange}
                    disabled={formData.freteAutomatico}
                  />
                  <label htmlFor="fretes">Fretes</label>
                </div>
                <div className="create-budget-field create-budget-metric-field">
                  <input id="nota" name="nota" type="number" value={formData.nota} onChange={handleFieldChange} />
                  <label htmlFor="nota">Nota (%)</label>
                </div>
                <div className="create-budget-field create-budget-metric-field">
                  <input id="margem" name="margem" type="number" value={formData.margem} onChange={handleFieldChange} />
                  <label htmlFor="margem">Margem (%)</label>
                </div>
                <div className="create-budget-field create-budget-metric-field">
                  <input id="custoExtra" name="custoExtra" type="number" value={formData.custoExtra} onChange={handleFieldChange} />
                  <label htmlFor="custoExtra">Custo Extra (Veka) (%)</label>
                </div>
              </div>

              <div className="create-budget-grid create-budget-grid-2 create-budget-discount-grid">
                <div className="create-budget-field create-budget-metric-field">
                  <input
                    id="descontoVidro"
                    name="descontoVidro"
                    type="number"
                    step="0.1"
                    value={formData.descontoVidro}
                    onChange={handleFieldChange}
                  />
                  <label htmlFor="descontoVidro">Desconto Vidro (%)</label>
                </div>
                <div className="create-budget-field create-budget-metric-field">
                  <input
                    id="descontoReforco"
                    name="descontoReforco"
                    type="number"
                    step="0.1"
                    value={formData.descontoReforco}
                    onChange={handleFieldChange}
                  />
                  <label htmlFor="descontoReforco">Desconto Reforco (%)</label>
                </div>
              </div>
            </div>

            <div className="create-budget-checkboxes">
              <label className="create-budget-checkbox" htmlFor="semInstalacao">
                <input
                  id="semInstalacao"
                  name="semInstalacao"
                  type="checkbox"
                  checked={formData.semInstalacao}
                  onChange={handleFieldChange}
                />
                Sem Instalacao
              </label>
              <label className="create-budget-checkbox" htmlFor="freteAutomatico">
                <input
                  id="freteAutomatico"
                  name="freteAutomatico"
                  type="checkbox"
                  checked={formData.freteAutomatico}
                  onChange={handleFieldChange}
                />
                Frete Automatico
              </label>
            </div>

            <div className="create-budget-field">
              <label htmlFor="observacoes">Obs.</label>
              <textarea
                id="observacoes"
                name="observacoes"
                rows={4}
                value={formData.observacoes}
                onChange={handleFieldChange}
              />
            </div>

            <button className="primary-button create-budget-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar'}
            </button>

            {feedbackMessage && <p className="create-budget-feedback">{feedbackMessage}</p>}
            {errorMessage && <p className="create-budget-feedback">{errorMessage}</p>}
          </form>
        </section>
      </main>
    </div>
  )
}

export default CriarOrcamento
