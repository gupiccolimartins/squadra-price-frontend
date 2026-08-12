# Deploy

## Contabo (produção / paralelo)
Infra em `squadra-price-backend/deploy/` (Compose + Caddy).
No servidor, este frontend fica como pasta irmã do backend.
Build: `VITE_API_BASE_URL` vazio (same-origin).

## Imagens de produto

Com `STORAGE_PROVIDER=s3`, a API já devolve em `foto` uma **URL pré-assinada** (HTTPS, TTL ~1h).
O front usa o valor como está (`resolveProductImageSrc` só passa adiante).

Fallback quando `foto` ainda é uma storage key (dev local / storage em disco):

- Sem `VITE_IMG_BASE_URL`: `${VITE_API_BASE_URL}/content/img/{key}` (a própria API serve o arquivo).
- Com `VITE_IMG_BASE_URL` (CloudFront opcional): `${VITE_IMG_BASE_URL}/{key}`.

Na prática, em produção com S3 a variável `VITE_IMG_BASE_URL` **não é necessária** — a API assina as URLs. Só configure se o front precisar montar URLs públicas a partir de keys.

## Render (teste free + cold start)
Ver guia completo: `squadra-price-backend/deploy/RENDER.md`

Resumo Static Site:
- Root: `squadraprice`
- Build: `npm ci && npm run build`
- Publish: `dist`
- Env: `VITE_API_BASE_URL=https://sua-api.onrender.com` (e opcionalmente `VITE_IMG_BASE_URL` se usar CDN)
- Rewrite SPA: `/*` → `/index.html`
