# Panduan Deploy ke GitHub Pages

## 1. Setup di GitHub

### Step 1: Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/waruna8.git
git push -u origin main
```

### Step 2: Aktifkan GitHub Pages
1. Buka repository di GitHub
2. Pergi ke **Settings** → **Pages**
3. Di bagian "Build and deployment":
   - Source: Pilih "GitHub Actions"
   - Branch: main (atau master)

## 2. Deploy Otomatis dengan GitHub Actions

Workflow sudah dikonfigurasi untuk deploy otomatis setiap kali push ke branch main/master. File workflow ada di `.github/workflows/deploy.yml`

### Cara Kerja:
- Setiap push ke `main` atau `master` akan trigger GitHub Actions
- Workflow akan:
  1. Install dependencies
  2. Build project dengan Vite
  3. Deploy ke GitHub Pages

### Status Deploy:
- Actions akan berjalan otomatis
- Cek status di **Actions** tab di GitHub
- Website akan tersedia di: `https://USERNAME.github.io/waruna8/`

## 3. Deploy Manual dengan gh-pages (Opsional)

Jika ingin deploy manual:

### Install gh-pages:
```bash
npm install --save-dev gh-pages
```

### Deploy:
```bash
npm run deploy
```

Script ini akan:
1. Build project (`npm run build`)
2. Push folder `dist` ke branch `gh-pages`

## 4. Konfigurasi

Sudah dikonfigurasi di file:

### `vite.config.ts`
```typescript
base: process.env.NODE_ENV === 'production' ? '/waruna8/' : '/',
```
- `base` diatur otomatis berdasarkan nama repository

### `package.json`
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "npm run build && npx gh-pages -d dist"
}
```

## 5. Troubleshooting

### Website tidak muncul?
1. Cek status actions di GitHub (Actions tab)
2. Lihat kesalahan di log actions
3. Pastikan Settings → Pages sudah benar konfigurasinya

### Asset tidak loading?
- Pastikan `base` di `vite.config.ts` sesuai dengan nama repository
- Format: `/repo-name/` (perhatikan slash di awal dan akhir)

### CSS/JS tidak memuat?
- Clear browser cache (Ctrl+Shift+Delete atau Cmd+Shift+Delete)
- Atau buka di private/incognito window

## 6. URL Website

Setelah deploy berhasil, website akan tersedia di:
```
https://[USERNAME].github.io/waruna8/
```

Ganti `[USERNAME]` dengan username GitHub Anda.

---

Selamat! Project sudah siap di-deploy ke GitHub Pages! 🚀
