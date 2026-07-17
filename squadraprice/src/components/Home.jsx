import { useEffect, useState } from 'react'
import '../App.css'
import Header from './Header'
import { Link } from 'react-router-dom'
import { apiFetch } from '../utils/api'

function Home() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('squadra_user') || '{}')
    } catch {
      return {}
    }
  })()

  const isAdmin = user.permissaoId === 1
  const [pendentesAgenda, setPendentesAgenda] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiFetch('/api/agenda/acoes-pendentes/count')
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((data) => {
        if (!cancelled) setPendentesAgenda(data.count ?? 0)
      })
      .catch(() => {
        if (!cancelled) setPendentesAgenda(null)
      })
    return () => { cancelled = true }
  }, [])

  const sections = []

  if (isAdmin) {
    sections.push({
      title: 'Administrativo Geral',
      items: [
        { label: 'Usuários', icon: 'US', to: '/Usuarios' },
        { label: 'Constantes', icon: 'CO', to: '/Constantes' },
        { label: 'Cidade / Estado', icon: 'CE', to: '/Cidades' },
        { label: 'Texto de Orcamento', icon: 'TO', to: '/ModeloOrcamento' },
        { label: 'Fornecedores', icon: 'FO', to: '/Fornecedores' },
      ],
    })

    sections.push({
      title: 'Produtos e Insumos',
      items: [
        { label: 'Produtos', icon: 'PR', to: '/Produtos' },
        { label: 'Insumos', icon: 'IN', to: '/Insumos' },
        { label: 'Vidros', icon: 'VI', to: '/Vidros' },
        { label: 'Cores Alumínio', icon: 'CA', to: '/CoresAluminio' },
      ],
    })
  }

  sections.push({
    title: 'Operacional',
    items: [
      { label: 'Criar Orcamento', icon: 'CO', to: '/CriarOrcamento' },
      { label: 'Listar Orcamentos', icon: 'LO', to: '/Orcamentos' },
      { label: 'Agenda de Representantes', icon: 'AR', to: '/Agenda', badgeKey: 'agendaPendentes' },
    ],
  })

  return (
    <div className="app">
      <Header />

      <main className="dashboard">
        {sections.map((section) => (
          <section className="panel" key={section.title}>
            <h2>{section.title}</h2>
            <div className="panel-items">
              {section.items.map((item) => (
                item.to ? (
                  <Link className="panel-item" key={item.label} to={item.to}>
                    <span className="panel-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badgeKey === 'agendaPendentes' && pendentesAgenda != null && pendentesAgenda > 0 && (
                      <span className="panel-badge">{pendentesAgenda}</span>
                    )}
                  </Link>
                ) : (
                  <button className="panel-item" type="button" key={item.label}>
                    <span className="panel-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

export default Home
