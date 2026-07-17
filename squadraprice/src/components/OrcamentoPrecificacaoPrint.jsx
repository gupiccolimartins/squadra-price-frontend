import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../utils/api'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)
const pct = (v) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    v ?? 0
  ) + '%'

const PRICING_ROWS = [
  { key: 'totalVeka', label: 'VEKA', pctKey: 'porcVeka' },
  { key: 'custoExtra', label: 'Custo Extra', pctKey: 'porcCustoExtra' },
  { key: 'totalFerragens', label: 'Ferragens', pctKey: 'porcFerragens' },
  { key: 'totalReforcos', label: 'Reforos', pctKey: 'porcReforcos' },
  { key: 'descontoReforco', label: 'Desconto Reforo', pctKey: 'porcDescontoReforco' },
  { key: 'totalOutros', label: 'Outros', pctKey: 'porcOutros' },
  { key: 'totalPvc', label: 'PVC', pctKey: 'porcPvc' },
  { key: 'totalPintura', label: 'Pintura', pctKey: 'porcPintura' },
  { key: 'vidro', label: 'Vidro', pctKey: 'porcVidro' },
  { key: 'descontoVidro', label: 'Desconto Vidro', pctKey: 'porcDescontoVidro' },
  { key: 'totalMotor', label: 'Motor', pctKey: 'porcMotor' },
  { key: 'embalagem', label: 'Embalagem', pctKey: 'porcEmbalagem' },
  { key: 'parafusos', label: 'Parafusos', pctKey: 'porcParafusos' },
  { key: 'totalMaterial', label: 'Total Material', pctKey: 'porcTotalMaterial', highlight: true },
  { key: 'desperdicio', label: 'Desperdicio', pctKey: 'porcDesperdicio' },
  { key: 'freteInsumo', label: 'Frete Insumo', pctKey: 'porcFreteInsumo' },
  { key: 'mo', label: 'M.O.', pctKey: 'porcMO' },
  { key: 'freteObra', label: 'Frete Obra', pctKey: 'porcFreteObra' },
  { key: 'instalacao', label: 'Instalacao', pctKey: 'porcInstalacao' },
  { key: 'transpInst', label: 'Transporte Instalacao', pctKey: 'porcTranspInst' },
  { key: 'visitaTecnica', label: 'Visita Tecnica', pctKey: 'porcVisitaTecnica' },
  { key: 'totalMatServ', label: 'Total Mat + Serv', pctKey: 'porcTotalMatServ', highlight: true },
  { key: 'valorComissao', label: 'Comissao', pctKey: 'comissao' },
  { key: 'valorComissaoGerencial', label: 'Comissao Gerencial', pctKey: 'comissaoGerencial' },
  { key: 'valorRT', label: 'RT', pctKey: 'rt' },
  { key: 'valorDesconto', label: 'Desconto', pctKey: 'desconto' },
  { key: 'valorImposto', label: 'Impostos', pctKey: 'porcentagemImposto' },
  { key: 'valorMargem', label: 'CTB', pctKey: 'margem' },
  { key: 'descontoAdicional', label: 'Desconto Adicional', pctKey: 'porcDescontoAdicional', negative: true },
  { key: 'total', label: 'Total', pctKey: null, highlight: true },
  { key: 'totalM2', label: 'Total / m2', pctKey: null },
]

function OrcamentoPrecificacaoPrint() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiFetch('/api/orcamentos/' + id + '/detalhes')
      if (!response.ok) throw new Error('Erro ' + response.status)
      const json = await response.json()
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (data) {
      const t = setTimeout(() => window.print(), 500)
      return () => clearTimeout(t)
    }
  }, [data])

  if (loading) return <div style={{ padding: 24 }}>Carregando...</div>
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>
  if (!data) return null

  return (
    <div style={{ padding: '24px 32px', fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <style>{`
        @media print { body { margin: 0; } button { display: none !important; } }
        .hl { background: #f0f0f0; font-weight: bold; }
        .neg { color: #dc2626; }
        table { border-collapse: collapse; width: 100%; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 6px 10px; font-size: 13px; }
        th { background: #f5f5f5; text-align: left; }
        td:nth-child(2), td:nth-child(3) { text-align: right; }
      `}</style>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18 }}>Precificacao -- Orcamento #{data.id ?? id}</h1>
          <p style={{ margin: '4px 0', fontSize: 13 }}>Cliente: {data.cliente}</p>
          <p style={{ margin: '4px 0', fontSize: 13 }}>Local: {data.local}</p>
          <p style={{ margin: '4px 0', fontSize: 13 }}>Usuario: {data.usuario}</p>
        </div>
        <button style={{ padding: '6px 14px', cursor: 'pointer' }} onClick={() => window.print()}>
          Imprimir
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Valor</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {PRICING_ROWS.map(({ key, label, pctKey, highlight, negative }) => {
            const value = data[key] ?? 0
            const pctValue = pctKey ? data[pctKey] : null
            const isNeg = negative && value < 0
            return (
              <tr key={key} className={highlight ? 'hl' : isNeg ? 'neg' : ''}>
                <td>{label}</td>
                <td>{fmt(value)}</td>
                <td>{pctValue != null ? pct(pctValue) : ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default OrcamentoPrecificacaoPrint
