import '../App.css'
import Header from './Header'

const constants = [
  {
    id: 1,
    name: 'Frete Esquadrias',
    value: '5,6391',
    note: 'R$/KM rodado',
  },
  {
    id: 2,
    name: 'Frete Insumos',
    value: '3',
    note: '% (Item 4 Planilha)',
  },
  {
    id: 3,
    name: 'Frete Obra - KM de comparação',
    value: '133',
    note: 'KM de comparação da fórmula do frete obra',
  },
  {
    id: 4,
    name: 'Ajuste Vidro',
    value: '150',
    note: 'mm',
  },
  {
    id: 5,
    name: 'Custo visita medição (R$)',
    value: '2',
    note: 'por km rodado',
  },
  {
    id: 6,
    name: 'Mão de Obra - Instalação',
    value: '122',
    note: 'por m² de obra',
  },
  {
    id: 7,
    name: 'Desperdício',
    value: '6',
    note: '% (Item 5 planilha)',
  },
  {
    id: 8,
    name: 'Transporte Instaladores',
    value: '3',
    note: '((Km ida + volta) - 200) * 3',
  },
  {
    id: 9,
    name: 'Custo Mensal por Funcionário',
    value: '4483,09',
    note: 'R$',
  },
  {
    id: 10,
    name: 'Soldas mensais por funcionário',
    value: '220',
    note: '',
  },
  {
    id: 11,
    name: 'Embalagem',
    value: '2,34',
    note: 'Por m² da peça x 2',
  },
  {
    id: 12,
    name: 'Parafusos',
    value: '0,05',
    note: 'A cada 20cm utiliza um parafuso. Valor unitário.',
  },
  {
    id: 13,
    name: 'Imposto',
    value: '14',
    note: '',
  },
]

function Constantes() {
  return (
    <div className="app users-page">
      <Header />
      <main className="users-container">
        <header className="users-header">
          <div>
            <h1>Constantes</h1>
            <span className="users-subtitle">Criar Constante</span>
          </div>
          <button className="primary-button" type="button">
            Nova Constante
          </button>
        </header>

        <section className="users-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Nome</th>
                <th>Valor</th>
                <th>Obs</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {constants.map((constant) => (
                <tr key={constant.id}>
                  <td>{constant.id}</td>
                  <td>{constant.name}</td>
                  <td>{constant.value}</td>
                  <td>{constant.note}</td>
                  <td>
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

export default Constantes
