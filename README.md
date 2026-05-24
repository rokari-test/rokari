# InkScroll

A Kagane-inspired manhwa & novel reading site with a professional admin panel — discovery, clean reader, library, and content management.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Admin panel

| URL | Purpose |
|-----|---------|
| `/admin/login` | Sign in |
| `/admin` | Dashboard |
| `/admin/series` | Manage titles |
| `/admin/series/new` | Add series |
| `/admin/series/:id/chapters` | Upload chapter page URLs |

**Default password:** `changeme`

Set a real password in `.env`:

```env
VITE_ADMIN_PASSWORD=your-secure-password
```

The catalog is stored in the browser (`localStorage`) so you can manage content without a backend during development. For production at Kagane scale, connect the admin UI to an API (Node, Supabase, PostgreSQL, S3/R2 for images).

## Public site features

- **Home** — hero carousel, trending, latest updates, Roll Your Fate
- **Browse** — type, genre, sort filters
- **Search** — `/search?q=...` (press `/` to focus)
- **Library** — continue reading + bookmarks
- **Preferences** — data saver, genre highlight/exclude, backup/restore
- **Reader** — scroll progress, wide mode, ← → chapters, **F** fullscreen, **Space** toggle UI
- **Series** — details, chapter list, bookmarks

## Stack

React 19, Vite, React Router, TypeScript

## Production checklist

1. Change `VITE_ADMIN_PASSWORD`
2. Host on Vercel/Netlify or your VPS
3. Add backend + CDN for images and user accounts
4. Use only licensed/official content (like Kagane’s model)
