import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const resolveImageSrc = (foto) => {
  if (!foto) return ''
  if (foto.startsWith('http') || foto.startsWith('data:')) return foto
  const baseUrl = import.meta.env.BASE_URL || '/'
  const normalized = foto.replace(/^\/+/, '')
  if (normalized.startsWith('img/')) return `${baseUrl}${normalized}`
  return `${baseUrl}img/${normalized}`
}

const formatArea = (value) => {
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) return '0,00'
  return parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function OrcamentoMemorial() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [memorial, setMemorial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [brokenImages, setBrokenImages] = useState({})

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/orcamentos/${id}/memorial`)
      if (!res.ok) throw new Error(`Falha ao buscar memorial (${res.status})`)
      const data = await res.json()
      setMemorial(data)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar memorial')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleImageError = (key) => {
    setBrokenImages((prev) => ({ ...prev, [key]: true }))
  }

  if (loading) return <div className="app"><Header /><main style={{ padding: '2rem' }}>Carregando...</main></div>
  if (error) return <div className="app"><Header /><main style={{ padding: '2rem' }}>{error}</main></div>

  const { modeloHtml, detalhes } = memorial
  const produtos = Array.isArray(detalhes?.produtos) ? detalhes.produtos : []

  return (
    <div className="app">
      <Header />
      <main className="memorial-main" style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>

        {/* Toolbar */}
        <div className="memorial-no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button className="link-button" type="button" onClick={() => navigate(`/Orcamentos/${id}`)}>
            Voltar
          </button>
          <button className="chip-button" type="button" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>

        {/* Modelo / intro HTML */}
        {modeloHtml && (
          <div
            style={{ marginBottom: '1.5rem' }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: conteúdo vem do banco interno do sistema
            dangerouslySetInnerHTML={{ __html: modeloHtml }}
          />
        )}

        {/* Cabeçalho do orçamento */}
        <table style={{ width: '100%', borderBottom: '4px solid #545454', marginBottom: '1.5rem', borderCollapse: 'collapse', lineHeight: '1.6' }}>
          <tbody>
            <tr>
              <td style={{ width: '33%', verticalAlign: 'top', paddingRight: '1rem' }}>
                <strong>{detalhes?.cliente}</strong><br />
                {detalhes?.engNome}<br />
                {detalhes?.telefone && <>Telefone: {detalhes.telefone}<br /></>}
                {detalhes?.email && <>Email: {detalhes.email}<br /></>}
                Obra: {detalhes?.obra}<br />
                {detalhes?.local}
              </td>
              <td style={{ width: '33%', verticalAlign: 'top', textAlign: 'right', borderLeft: '1px solid #999', paddingLeft: '1rem' }}>
                <strong>Orçamento: #{detalhes?.orcamentoPaiId}</strong><br />
                Versão: <strong>{detalhes?.versao}</strong><br />
                Representante: {detalhes?.usuario}<br />
                {detalhes?.usuarioTelefone}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Título e área */}
        <h1 style={{ fontSize: '18px', paddingLeft: '8px', marginBottom: '4px' }}>Resumo do Orçamento</h1>
        <div style={{ fontSize: '13px', paddingBottom: '8px', paddingLeft: '10px', marginBottom: '1rem' }}>
          Área: <strong>{formatArea(detalhes?.calculoArea)} m²</strong> | Cor da obra: <strong>{detalhes?.cor}</strong>
        </div>

        {/* Produtos */}
        {produtos.map((produto) => {
          const prodKey = String(produto.id || produto.produtoId || produto.codigoPeca)
          const imgSrc = resolveImageSrc(produto.foto)
          const imgOk = imgSrc && !brokenImages[`prod-${prodKey}`]
          const acessorios = Array.isArray(produto.acessorios) ? produto.acessorios : []

          return (
            <div key={prodKey} className="memorial-product-block" style={{ marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', border: '1px solid #555', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#eaeaea' }}>
                    <td colSpan={3} style={{ borderBottom: '1px solid #555', padding: '6px 8px', fontWeight: 'bold' }}>
                      {produto.codigoPeca} — {produto.ambiente}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', width: '120px', verticalAlign: 'top' }}>
                      {imgOk ? (
                        <img
                          src={imgSrc}
                          alt={produto.nome || 'Produto'}
                          width={110}
                          height={110}
                          style={{ objectFit: 'contain' }}
                          onError={() => handleImageError(`prod-${prodKey}`)}
                        />
                      ) : (
                        <div style={{ width: 110, height: 110, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>
                          Sem foto
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '8px', fontSize: '13px', verticalAlign: 'top', width: '45%' }}>
                      {produto.nome} {produto.linhaProduto}<br />
                      <strong>Cor:</strong> {produto.cor}<br />
                      <strong>Largura:</strong> {produto.largura} <strong>Altura:</strong> {produto.altura}<br />
                      <strong>Vidro:</strong> {produto.vidroNome || 'Sem Vidro'}
                    </td>
                    <td style={{ padding: '8px', fontSize: '13px', verticalAlign: 'top' }}>
                      <strong>Quantidade:</strong> {produto.quantidade}
                    </td>
                  </tr>
                  {produto.observacao && (
                    <tr>
                      <td />
                      <td style={{ padding: '4px 8px', fontSize: '13px' }} colSpan={2}>
                        Obs: {produto.observacao}
                      </td>
                    </tr>
                  )}

                  {/* Acessórios */}
                  {acessorios.map((ac) => {
                    const acKey = String(ac.id || ac.acessorioId)
                    const acImgSrc = resolveImageSrc(ac.foto)
                    const acImgOk = acImgSrc && !brokenImages[`ac-${acKey}`]

                    return (
                      <React.Fragment key={acKey}>
                        <tr>
                          <td colSpan={3}><hr style={{ margin: '4px 0' }} /></td>
                        </tr>
                        <tr>
                          <td colSpan={3} style={{ padding: '4px 8px', fontSize: '13px', fontWeight: 'bold' }}>Acessório:</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px', verticalAlign: 'top' }}>
                            {acImgOk ? (
                              <img
                                src={acImgSrc}
                                alt={ac.nome || 'Acessório'}
                                width={110}
                                height={110}
                                style={{ objectFit: 'contain' }}
                                onError={() => handleImageError(`ac-${acKey}`)}
                              />
                            ) : (
                              <div style={{ width: 110, height: 110, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>
                                Sem foto
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '8px', fontSize: '13px', verticalAlign: 'top' }}>
                            {ac.nome}<br />
                            {(ac.largura || ac.altura) && (
                              <><strong>Largura:</strong> {ac.largura} <strong>Altura:</strong> {ac.altura}<br /></>
                            )}
                          </td>
                          <td style={{ padding: '8px', fontSize: '13px', verticalAlign: 'top' }}>
                            <strong>Quantidade:</strong> {ac.quantidade}
                          </td>
                        </tr>
                        {ac.observacao && (
                          <tr>
                            <td />
                            <td style={{ padding: '4px 8px', fontSize: '13px' }} colSpan={2}>
                              Obs: {ac.observacao}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}
      </main>
    </div>
  )
}

export default OrcamentoMemorial
