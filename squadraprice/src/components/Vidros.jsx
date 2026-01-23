import '../App.css'
import Header from './Header'

const glasses = [
  {
    id: 1,
    name: 'Vidro Teste',
    price: '0,01',
    status: 'Inativo',
    order: 'Prioritario',
    supplier: 'Nao consta',
    createdAt: '18/07/2014 10:26:30',
    updatedAt: '11/09/2018 09:14:01',
  },
  {
    id: 2,
    name: 'Vidro 2',
    price: '100',
    status: 'Inativo',
    order: 'Prioritario',
    supplier: 'Nao consta',
    createdAt: '01/08/2014 18:52:36',
    updatedAt: '13/08/2014 11:56:25',
  },
  {
    id: 3,
    name: 'Comum Incolor 6mm',
    price: '132,13',
    status: 'Ativo',
    order: 'Nao Prioritario',
    supplier: 'Uniao Glass',
    createdAt: '04/08/2014 08:09:09',
    updatedAt: '13/08/2025 06:16:19',
  },
  {
    id: 4,
    name: 'Comum Incolor 4mm',
    price: '126,38',
    status: 'Ativo',
    order: 'Nao Prioritario',
    supplier: 'Uniao Glass',
    createdAt: '06/10/2014 15:51:24',
    updatedAt: '13/08/2025 06:16:48',
  },
  {
    id: 5,
    name: 'Liso Incolor 6mm',
    price: '51,75',
    status: 'Inativo',
    order: 'Prioritario',
    supplier: 'Nao consta',
    createdAt: '06/10/2014 15:51:39',
    updatedAt: '03/06/2016 15:35:28',
  },
]

function Vidros() {
  return (
    <div className="app glass-page">
      <Header />
      <main className="glass-container">
        <header className="glass-header">
          <div>
            <h1>Vidros</h1>
            <span className="glass-subtitle">Criar Vidro</span>
          </div>
        </header>

        <section className="glass-filters">
          <span className="glass-search-label">Busca:</span>
          <input
            className="glass-filter-input"
            type="text"
            placeholder="Nome do Vidro"
          />
          <select className="glass-filter-select" defaultValue="Ativo">
            <option>Ativo</option>
            <option>Inativo</option>
          </select>
          <button className="icon-button glass-search-button" type="button" aria-label="Buscar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                fill="currentColor"
              />
            </svg>
          </button>
        </section>

        <div className="glass-summary">Mostrando: 20 de 1499</div>

        <section className="glass-card">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Nome</th>
                <th>Preco</th>
                <th>Status</th>
                <th>Ordenacao</th>
                <th>Fornecedor</th>
                <th>Data de Criacao</th>
                <th>Data de Modificacao</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {glasses.map((glass) => (
                <tr key={glass.id}>
                  <td>{glass.id}</td>
                  <td>{glass.name}</td>
                  <td>{glass.price}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        glass.status === 'Ativo' ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      {glass.status}
                    </span>
                  </td>
                  <td>{glass.order}</td>
                  <td>{glass.supplier}</td>
                  <td>{glass.createdAt}</td>
                  <td>{glass.updatedAt}</td>
                  <td className="glass-actions">
                    <button className="icon-button edit-button" type="button" aria-label="Editar">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.47-8.47.92.92-8.47 8.47zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.75 1.75 3.75 3.75 1.75-1.75z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}

export default Vidros
