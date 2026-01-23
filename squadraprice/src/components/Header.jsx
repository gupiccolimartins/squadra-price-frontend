function Header() {
  return (
    <header className="topbar">
      <div className="topbar-content">
        <div className="brand">
          <span className="brand-mark">S</span>
          <div className="brand-text">
            <strong>SQUADRA</strong>
            <span>esquadrias de pvc</span>
          </div>
        </div>

        <div className="search">
          <input type="text" placeholder="Orcamento" aria-label="Pesquisar" />
          <button type="button" className="icon-button" aria-label="Buscar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M11 4a7 7 0 0 1 5.48 11.37l3.58 3.58-1.41 1.41-3.58-3.58A7 7 0 1 1 11 4zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <select className="topbar-select" aria-label="Ultimos Orcamentos">
          <option>Ultimos Orcamentos</option>
          <option>Orcamento 2217</option>
          <option>Orcamento 2216</option>
        </select>

        <div className="topbar-actions">
          <button type="button" className="icon-button" aria-label="Inicio">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 5.1 4 12h2.5v7h4.5v-4h2v4h4.5v-7H20L12 5.1z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button type="button" className="icon-button" aria-label="Menu">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 6h7v7H4V6zm9 0h7v7h-7V6zM4 15h7v7H4v-7zm9 0h7v7h-7v-7z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button type="button" className="icon-button" aria-label="Ajustes">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2zm8.1 3.6-.97-.56.1-1.12-1.1-.64-.79.8-1.04-.44-.35-1.09h-1.28l-.35 1.09-1.04.44-.79-.8-1.1.64.1 1.12-.97.56.5 1.2.97-.56.88.72-.2 1.13 1.1.64.79-.8 1.04.44.35 1.09h1.28l.35-1.09 1.04-.44.79.8 1.1-.64-.2-1.13.88-.72.97.56.5-1.2z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
