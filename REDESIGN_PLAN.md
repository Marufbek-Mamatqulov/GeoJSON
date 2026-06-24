# GeoO'yin — Redesign Plan

## 1. Mavjud holat tahlili

### Yaxshi tomonlari
- Zamonaviy stek: React 18 + Vite + TS + Tailwind v3 (`darkMode: 'class'`) + Zustand (persist) + react-leaflet + Lucide.
- O'yin mantig'i toza ajratilgan: `gameStore.ts` (holat), `useGame.ts` (timer/klik mantig'i), `gameLogic.ts` (ball/savol).
- 10 ta o'yin rejimi, 3 til (uz/ru/en), light/dark rejim CSS override orqali ishlaydi.
- Animatsiyalar va dizayn allaqachon yetuk (shimmer, glow, gradient text).

### Yomon / yetishmaydigan tomonlari
- Dizayn tokenlari yo'q — ranglar (`#050814`, indigo/violet) hamma joyda hardcode qilingan.
- `provinces.json` juda kam ma'lumotli (maydon, aholi, fakt, asosiy shaharlar yo'q).
- "O'rgan" (Encyclopedia) rejimi yo'q — faqat o'yin va demografiya bor.
- Maxsus font yo'q (tizim shrifti).
- SEO/a11y minimal (og tags yo'q, aria-live yo'q).
- ResultModalda xato hududlar tahlili yo'q.

## 2. Bosqichli reja

| Bosqich | Mazmun | Asosiy fayllar |
|---|---|---|
| 1 | Dizayn tokenlari + Inter font | `index.css`, `index.html` |
| 2 | `provinces.json` boyitish | `public/data/provinces.json` |
| 3 | Tiplar (`ProvinceEnriched`) | `src/types/index.ts` |
| 4 | Framer Motion o'rnatish | `package.json` |
| 5 | Encyclopedia rejimi (yangi) | `src/components/Encyclopedia/*`, `App.tsx`, `Header.tsx` |
| 6 | i18n kalitlari (3 til) | `src/i18n/{uz,ru,en}.ts` |
| 7 | ResultModal — xato hududlar tahlili | `ResultModal.tsx` |
| 8 | LandingPage statistikasi | `LandingPage.tsx` |
| 9 | SEO + a11y | `index.html`, `GamePanel.tsx` |
| 10 | Build tekshirish + commit | — |

## 3. Dizayn tizimi

CSS o'zgaruvchilar `:root` va `.dark` da (emerald asosli token qatlami qo'shiladi, mavjud
indigo aksent saqlanadi qayta yozishdan kelib chiqadigan regressiyani oldini olish uchun).

- Radiuslar: `--radius-sm: 6px` … `--radius-xl: 20px`.
- Tipografiya: **Inter** (Google Fonts), `font-feature-settings` bilan.
- Ranglar: emerald primary (`#10b981`), surface/border/text tokenlari light va dark uchun.

## 4. Qoidalar
- O'yin mantig'i (`gameStore`, `useGame`, `gameLogic`) buzilmaydi.
- Light va dark ikkalasi ishlaydi.
- Barcha 10 GameMode uchun yozuvlar to'liq.
- `npx tsc -b` va `npx vite build` xatosiz tugaydi.
