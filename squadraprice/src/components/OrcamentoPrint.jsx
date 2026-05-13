import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const IMG_BASE_URL = import.meta.env.VITE_IMG_BASE_URL || 'http://localhost:8080'

const formatMoney = (value) => {
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) return '—'
  return parsed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const formatNumber = (value, decimals = 2) => {
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) return '—'
  return parsed.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function OrcamentoPrint() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/orcamentos/${id}/detalhes`)
      if (!res.ok) throw new Error(`Falha ao buscar orçamento (${res.status})`)
      const data = await res.json()
      setBudget(data)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar orçamento')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <div className="app"><Header /><main style={{ padding: '2rem' }}>Carregando...</main></div>
  if (error) return <div className="app"><Header /><main style={{ padding: '2rem' }}>{error}</main></div>

  const produtos = Array.isArray(budget?.produtos) ? budget.produtos : []

  return (
    <div className="app">
      <Header />
      <main style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>

        {/* Toolbar — hidden on print */}
        <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <button className="link-button" type="button" onClick={() => navigate(`/Orcamentos/${id}`)}>
            ← Voltar
          </button>
          <button className="chip-button" type="button" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>

        {/* ── Header ── */}
        <table width="100%" cellSpacing="0" cellPadding="4" style={{ borderBottom: '3px solid #545454', marginBottom: '1rem', lineHeight: '1.5' }}>
          <tbody>
            <tr>
              <td style={{ width: '35%', verticalAlign: 'top' }}>
                <strong>{budget?.cliente}</strong><br />
                {budget?.engNome && <>{budget.engNome}<br /></>}
                {budget?.telefone && <>Telefone: {budget.telefone}<br /></>}
                {budget?.email && <>Email: {budget.email}<br /></>}
                {budget?.obra && <>Obra: {budget.obra}<br /></>}
                {budget?.local && <>{budget.local}</>}
              </td>
              <td style={{ width: '30%', verticalAlign: 'top' }} />
              <td style={{ width: '35%', verticalAlign: 'top', textAlign: 'right', borderLeft: '1px solid #999' }}>
                <strong>Orçamento: #{budget?.orcamentoPaiId || id}</strong><br />
                Versão: <strong>{budget?.versao}</strong><br />
                Representante: {budget?.representante}<br />
                {budget?.usuarioTelefone}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Título e área ── */}
        <h2 style={{ fontSize: '1.1rem', margin: '0.5rem 0 0.25rem', paddingLeft: '4px' }}>Resumo do Orçamento</h2>
        <div style={{ fontSize: '0.875rem', marginBottom: '1rem', paddingLeft: '4px' }}>
          Área: <strong>{formatNumber(budget?.calculoArea)} m²</strong>
          {budget?.cor ? <> | Cor da obra: <strong>{budget.cor}</strong></> : null}
        </div>

        {/* ── Produtos ── */}
        {produtos.map((p) => (
          <div key={p.id} style={{ marginBottom: '1rem', border: '1px solid #aaa' }}>
            {/* Cabeçalho do produto */}
            <div style={{ background: '#eaeaea', padding: '6px 8px', fontWeight: 'bold', borderBottom: '1px solid #aaa', fontSize: '0.875rem' }}>
              {p.codigoPeca} — {p.ambiente}
            </div>

            {/* Detalhes do produto */}
            <table width="100%" cellSpacing="0" cellPadding="6" style={{ fontSize: '0.875rem' }}>
              <tbody>
                <tr>
                  <td style={{ width: '120px', verticalAlign: 'top', padding: '8px' }}>
                    {p.foto
                      ? <img src={`${IMG_BASE_URL}/content/img/${p.foto}`} width="110" height="110" alt={p.nome} style={{ objectFit: 'contain' }} />
                      : <div style={{ width: 110, height: 110, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#999' }}>Sem foto</div>
                    }
                  </td>
                  <td style={{ width: '40%', verticalAlign: 'top' }}>
                    {p.nome} {p.linhaProduto}<br />
                    <strong>Cor:</strong> {p.cor}<br />
                    <strong>Largura:</strong> {p.largura} &nbsp;<strong>Altura:</strong> {p.altura}<br />
                    <strong>Vidro:</strong> {p.vidroNome}
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    <strong>Quantidade:</strong> {p.quantidade}<br />
                    <strong>Valor Unitário:</strong> {formatMoney(p.valorUnitario)}<br />
                    <strong>Valor Total:</strong> {formatMoney(p.valorTotal)}
                  </td>
                </tr>
                {p.observacao && (
                  <tr>
                    <td />
                    <td colSpan="2" style={{ paddingTop: 0 }}>Obs: {p.observacao}</td>
                  </tr>
                )}

                {/* Acessórios do produto */}
                {Array.isArray(p.acessorios) && p.acessorios.map((a) => (
                  <>
                    <tr key={`sep-${a.id}`}>
                      <td colSpan="3" style={{ padding: 0 }}><hr style={{ margin: 0, borderColor: '#ccc' }} /></td>
                    </tr>
                    <tr key={a.id}>
                      <td style={{ padding: '8px', verticalAlign: 'top' }}>
                        {a.foto
                          ? <img src={`${IMG_BASE_URL}/content/img/${a.foto}`} width="110" height="110" alt={a.nome} style={{ objectFit: 'contain' }} />
                          : <div style={{ width: 110, height: 110, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#999' }}>Sem foto</div>
                        }
                      </td>
                      <td style={{ verticalAlign: 'top' }}>
                        <strong>Acessório:</strong> {a.nome}<br />
                        <strong>Largura:</strong> {a.largura} &nbsp;<strong>Altura:</strong> {a.altura}
                      </td>
                      <td style={{ verticalAlign: 'top' }}>
                        <strong>Quantidade:</strong> {a.quantidade}<br />
                        <strong>Valor Unitário:</strong> {formatMoney(a.valorUnitario)}<br />
                        <strong>Valor Total:</strong> {formatMoney(a.valorTotal)}
                      </td>
                    </tr>
                    {a.observacao && (
                      <tr key={`obs-${a.id}`}>
                        <td />
                        <td colSpan="2" style={{ paddingTop: 0 }}>Obs: {a.observacao}</td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* ── Totais ── */}
        <table width="100%" cellSpacing="0" cellPadding="4" style={{ marginTop: '0.5rem' }}>
          <tbody>
            <tr>
              <td />
              <td style={{ textAlign: 'right', paddingRight: '8px' }}>
                <strong style={{ fontSize: '1.1rem' }}>{formatMoney(budget?.total)}</strong><br />
                <span style={{ fontSize: '0.85rem', color: '#555' }}>
                  Área Total: {formatNumber(budget?.calculoArea)} m² &nbsp;|&nbsp; Preço/m²: {formatMoney(budget?.totalM2)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          header, nav { display: none !important; }
          body { background: white; }
          main { padding: 0 !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  )
}

export default OrcamentoPrint
