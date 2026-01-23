import '../App.css'
import Header from './Header'
import { Link } from 'react-router-dom'

function Home() {
  const sections = [
    {
      title: 'Administrativo Geral',
      items: [
        { label: 'Usuários', icon: 'US', to: '/Usuarios' },
        { label: 'Constantes', icon: 'CO', to: '/Constantes' },
        { label: 'Cidade / Estado', icon: 'CE', to: '/Cidades' },
        { label: 'Texto de Orcamento', icon: 'TO', to: '/ModeloOrcamento' },
        { label: 'Fornecedores', icon: 'FO' },
      ],
    },
    {
      title: 'Produtos e Insumos',
      items: [
        { label: 'Produtos', icon: 'PR', to: '/Produtos' },
        { label: 'Insumos', icon: 'IN', to: '/Insumos' },
        { label: 'Vidros', icon: 'VI', to: '/Vidros' },
      ],
    },
    {
      title: 'Operacional',
      items: [
        { label: 'Criar Orcamento', icon: 'CO' },
        { label: 'Listar Orcamentos', icon: 'LO', to: '/Orcamentos' },
        { label: 'Agenda de Representantes', icon: 'AR' },
      ],
    },
  ]

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
