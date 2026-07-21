import '../App.css'
import Header from './Header'
import { Link } from 'react-router-dom'
import {
  Users,
  Settings,
  MapPinned,
  FilePenLine,
  Truck,
  AppWindow,
  Boxes,
  Layers,
  Palette,
  FilePlus2,
  ClipboardList,
  CalendarDays,
} from 'lucide-react'

function Home() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('squadra_user') || '{}')
    } catch {
      return {}
    }
  })()

  const isAdmin = user.permissaoId === 1

  const sections = []

  if (isAdmin) {
    sections.push({
      title: 'Administrativo Geral',
      items: [
        { label: 'Usuários', icon: Users, to: '/Usuarios' },
        { label: 'Constantes', icon: Settings, to: '/Constantes' },
        { label: 'Cidade / Estado', icon: MapPinned, to: '/Cidades' },
        { label: 'Texto de Orcamento', icon: FilePenLine, to: '/ModeloOrcamento' },
        { label: 'Fornecedores', icon: Truck, to: '/Fornecedores' },
      ],
    })

    sections.push({
      title: 'Produtos e Insumos',
      items: [
        { label: 'Produtos', icon: AppWindow, to: '/Produtos' },
        { label: 'Insumos', icon: Boxes, to: '/Insumos' },
        { label: 'Vidros', icon: Layers, to: '/Vidros' },
        { label: 'Cores Alumínio', icon: Palette, to: '/CoresAluminio' },
      ],
    })
  }

  sections.push({
    title: 'Operacional',
    items: [
      { label: 'Criar Orcamento', icon: FilePlus2, to: '/CriarOrcamento' },
      { label: 'Listar Orcamentos', icon: ClipboardList, to: '/Orcamentos' },
      { label: 'Agenda de Representantes', icon: CalendarDays, to: '/Agenda' },
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
              {section.items.map((item) => {
                const Icon = item.icon
                const content = (
                  <>
                    <span className="panel-icon" aria-hidden="true">
                      <Icon size={26} strokeWidth={1.75} />
                    </span>
                    <span>{item.label}</span>
                  </>
                )

                return item.to ? (
                  <Link className="panel-item" key={item.label} to={item.to}>
                    {content}
                  </Link>
                ) : (
                  <button className="panel-item" type="button" key={item.label}>
                    {content}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

export default Home
