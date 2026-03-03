# Moje Diagnostika

Interaktivní diagnostický nástroj pro vyplňování PID-5 a LPFS-SR dotazníků s živým vyhodnocováním.

## Funkce

- **PID-5** — 220 otázek, 25 facet, 5 domén, 13 diagnostických profilů
- **LPFS-SR** — 80 otázek, úroveň fungování osobnosti
- Průběžné live skóry během vyplňování
- Radar chart vizualizace
- Export výsledků do JSON
- Historie výsledků v localStorage

## Technologie

- React 18
- Vite
- Tailwind CSS
- Recharts

## Spuštění lokálně

```bash
npm install
npm run dev
```

## Build pro produkci

```bash
npm run build
```

## Deploy na Vercel

1. Pushni repo na GitHub
2. Importuj projekt na [vercel.com](https://vercel.com)
3. Framework preset: **Vite**
4. Deploy ✅
