import { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function PedidoOrcamento() {
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', cidade: '', observacoes: '' })
  const [arquivo, setArquivo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome.trim()) { setError('Informe seu nome'); return }
    try {
      setSubmitting(true)
      setError('')
      const fd = new FormData()
      fd.append('nome', form.nome.trim())
      if (form.telefone) fd.append('telefone', form.telefone.trim())
      if (form.email) fd.append('email', form.email.trim())
      if (form.cidade) fd.append('cidade', form.cidade.trim())
      if (form.observacoes) fd.append('observacoes', form.observacoes.trim())
      if (arquivo) fd.append('arquivo', arquivo)
      const response = await fetch(API_BASE_URL + '/api/orcamentos/pedido', { method: 'POST', body: fd })
      if (!response.ok) { const msg = await response.text(); throw new Error(msg || 'Erro ao enviar pedido') }
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Erro ao enviar pedido')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 16px rgba(0,0,0,0.1)', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>OK</div>
          <h2>Pedido enviado com sucesso!</h2>
          <p>Em breve entraremos em contato.</p>
        </div>
      </div>
    )
  }

  const inputStyle = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }
  const fieldStyle = { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 5, fontSize: 14 }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 16px rgba(0,0,0,0.1)', padding: 32, width: '100%', maxWidth: 500 }}>
        <h1 style={{ marginTop: 0, fontSize: 22, marginBottom: 4 }}>Solicitar Orcamento</h1>
        <p style={{ color: '#555', fontSize: 14, marginBottom: 24 }}>Preencha o formulario e entraremos em contato.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={inputStyle}>
            Nome *
            <input style={fieldStyle} type="text" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} disabled={submitting} placeholder="Seu nome completo" />
          </label>
          <label style={inputStyle}>
            Telefone
            <input style={fieldStyle} type="tel" value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} disabled={submitting} placeholder="(99) 99999-9999" />
          </label>
          <label style={inputStyle}>
            E-mail
            <input style={fieldStyle} type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} disabled={submitting} placeholder="seu@email.com" />
          </label>
          <label style={inputStyle}>
            Cidade / Estado
            <input style={fieldStyle} type="text" value={form.cidade} onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))} disabled={submitting} placeholder="Ex: Sao Paulo - SP" />
          </label>
          <label style={inputStyle}>
            Descreva seu projeto
            <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 90 }} rows={4} value={form.observacoes} onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))} disabled={submitting} placeholder="Detalhe o que voce precisa..." />
          </label>
          <label style={inputStyle}>
            Anexar arquivo (planta, fotos, etc.)
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.dwg" onChange={(e) => setArquivo(e.target.files?.[0] || null)} disabled={submitting} />
          </label>
          {error && <div style={{ color: '#dc2626', fontSize: 13, padding: '8px 12px', background: '#fef2f2', borderRadius: 4 }}>{error}</div>}
          <button type="submit" disabled={submitting} style={{ padding: '10px 0', fontSize: 15, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {submitting ? 'Enviando...' : 'Enviar Pedido'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PedidoOrcamento
