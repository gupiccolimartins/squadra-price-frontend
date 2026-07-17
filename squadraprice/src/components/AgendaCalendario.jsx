import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import '../App.css'
import Header from './Header'
import AgendaNav from './AgendaNav'
import { apiFetch } from '../utils/api'

function getLoggedUser() {
  try { return JSON.parse(localStorage.getItem('squadra_user') || '{}') } catch { return {} }
}

function AgendaCalendario() {
  const navigate = useNavigate()
  const user = useMemo(() => getLoggedUser(), [])
  const isAdmin = user.permissaoId === 1
  const [usuarios, setUsuarios] = useState([])
  const [usuarioId, setUsuarioId] = useState('')
  const [events, setEvents] = useState([])
  const [range, setRange] = useState(null)

  useEffect(() => {
    if (!isAdmin) return
    apiFetch('/api/orcamentos/usuarios').then((r) => r.ok ? r.json() : []).then(setUsuarios).catch(() => setUsuarios([]))
  }, [isAdmin])

  const loadEvents = useCallback(async (start, end, responsavel) => {
    if (!start || !end) return
    const params = new URLSearchParams({
      inicio: start.toISOString().slice(0, 19),
      fim: end.toISOString().slice(0, 19),
    })
    if (responsavel) params.set('usuarioId', responsavel)
    const response = await apiFetch(`/api/agenda/calendario?${params}`)
    if (!response.ok) {
      setEvents([])
      return
    }
    const data = await response.json()
    setEvents((data || []).map((ev) => ({
      id: String(ev.id),
      title: ev.title,
      start: ev.start,
      backgroundColor: ev.backgroundColor || ev.color,
      borderColor: ev.color,
      extendedProps: { agendaContatoId: ev.agendaContatoId },
    })))
  }, [])

  useEffect(() => {
    if (range) loadEvents(range.start, range.end, usuarioId)
  }, [usuarioId, range, loadEvents])

  return (
    <div className="app budgets-page">
      <Header />
      <main className="agenda-layout">
        <AgendaNav />
        <div className="agenda-content">
          <header className="budgets-header agenda-header-row">
            <h1>Calendário</h1>
            {isAdmin && (
              <select className="budgets-filter-select" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
                <option value="">Todos os responsáveis</option>
                {usuarios.map((u) => <option key={u.id} value={String(u.id)}>{u.nome}</option>)}
              </select>
            )}
          </header>
          <div className="agenda-calendar-wrap">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="pt-br"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              buttonText={{ today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' }}
              events={events}
              datesSet={(info) => setRange({ start: info.start, end: info.end })}
              eventClick={(info) => {
                const contatoId = info.event.extendedProps.agendaContatoId
                if (contatoId) navigate(`/Agenda/${contatoId}`)
              }}
              height="auto"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default AgendaCalendario
