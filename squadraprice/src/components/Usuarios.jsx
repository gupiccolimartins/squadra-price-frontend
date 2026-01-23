import '../App.css'
import Header from './Header'

const users = [
  {
    id: 4,
    name: 'Rafael Moura',
    login: 'rafael',
    phone: '(11) 973196439',
    email: 'rafmoura25@gmail.com',
    role: 'Administrador',
    lastLogin: '14/11/2025 06:16',
    createdAt: '08/07/2014 10:40',
    status: 'Ativo',
  },
  {
    id: 5,
    name: 'Nathalia Ferezin',
    login: 'nathalia',
    phone: '(19) 3886-7005',
    email: 'nathalia@squadrapvc.com.br',
    role: 'Administrador',
    lastLogin: '02/07/2021 01:08',
    createdAt: '16/07/2014 09:29',
    status: 'Inativo',
  },
  {
    id: 6,
    name: 'Representante',
    login: 'rep',
    phone: '(19) 3886-7005',
    email: 'representante@squadrapvc.com.br',
    role: 'Representante',
    lastLogin: '21/07/2021 10:18',
    createdAt: '16/07/2014 09:29',
    status: 'Inativo',
  },
  {
    id: 7,
    name: 'Euclides Koppe',
    login: 'euclides',
    phone: '(19) 99620-9588',
    email: 'euclides@squadrapvc.com.br',
    role: 'Administrador',
    lastLogin: '15/01/2026 09:19',
    createdAt: '13/08/2014 03:57',
    status: 'Ativo',
  },
  {
    id: 8,
    name: 'Daniel Losano',
    login: 'losano',
    phone: '(19) 99661-6704',
    email: 'dlosano@squadrapvc.com.br',
    role: 'Representante',
    lastLogin: '14/01/2026 07:08',
    createdAt: '13/08/2014 03:57',
    status: 'Ativo',
  },
  {
    id: 9,
    name: 'Nivaldo Nei',
    login: 'nei',
    phone: '(11) 94132-1123',
    email: 'nei@squadrapvc.com.br',
    role: 'Representante',
    lastLogin: '16/01/2026 03:28',
    createdAt: '13/08/2014 04:01',
    status: 'Ativo',
  },
  {
    id: 10,
    name: 'Nelson',
    login: 'nelson',
    phone: '(19) 98154-3784',
    email: 'nelson@squadrapvc.com.br',
    role: 'Representante',
    lastLogin: '14/02/2024 12:01',
    createdAt: '13/08/2014 04:01',
    status: 'Inativo',
  },
]

function Usuarios() {
  return (
    <div className="app users-page">
      <Header />
      <main className="users-container">
        <header className="users-header">
          <div>
            <h1>Usuarios</h1>
            <span className="users-subtitle">Criar Usuario</span>
          </div>
          <button className="primary-button" type="button">
            Novo Usuario
          </button>
        </header>

        <section className="users-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Nome</th>
                <th>Login</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Nivel</th>
                <th>Ultimo Login</th>
                <th>Criado em</th>
                <th>Status</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.login}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.lastLogin}</td>
                  <td>{user.createdAt}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.status === 'Ativo' ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
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

export default Usuarios
