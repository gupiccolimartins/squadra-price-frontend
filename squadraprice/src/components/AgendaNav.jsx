import { NavLink } from 'react-router-dom'

function AgendaNav() {
  return (
    <nav className="agenda-nav" aria-label="Menu da Agenda">
      <NavLink to="/Agenda" end className={({ isActive }) => isActive ? 'agenda-nav-link active' : 'agenda-nav-link'}>
        Funil de Vendas
      </NavLink>
      <NavLink to="/Agenda/Oportunidades" className={({ isActive }) => isActive ? 'agenda-nav-link active' : 'agenda-nav-link'}>
        Oportunidades
      </NavLink>
      <NavLink to="/Agenda/Acoes" className={({ isActive }) => isActive ? 'agenda-nav-link active' : 'agenda-nav-link'}>
        Ações
      </NavLink>
      <NavLink to="/Agenda/Calendario" className={({ isActive }) => isActive ? 'agenda-nav-link active' : 'agenda-nav-link'}>
        Calendário
      </NavLink>
    </nav>
  )
}

export default AgendaNav
