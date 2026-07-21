# Deploy

## Contabo (produção / paralelo)
Infra em `squadra-price-backend/deploy/` (Compose + Caddy).
No servidor, este frontend fica como pasta irmã do backend.
Build: `VITE_API_BASE_URL` vazio (same-origin).

## Render (teste free + cold start)
Ver guia completo: `squadra-price-backend/deploy/RENDER.md`

Resumo Static Site:
- Root: `squadraprice`
- Build: `npm ci && npm run build`
- Publish: `dist`
- Env: `VITE_API_BASE_URL=https://sua-api.onrender.com`
- Rewrite SPA: `/*` → `/index.html`
