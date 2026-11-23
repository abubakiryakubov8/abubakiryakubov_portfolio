# Abubakir Yakubov — portfolio

Personal portfolio site. Hand-written HTML, CSS and JavaScript — no framework, no build step.

**Live:** https://abubakiryakubov8.github.io/abubakiryakubov_portfolio/

## Stack

- `index.html` — all sections (hero, about, skills, work, experience, contact)
- `assets/css/neon.css` — the neon/matrix design system
- `assets/js/matrix.js` — canvas matrix rain with a toggle
- `assets/js/site.js` — boot sequence, typing effect, scroll reveal, counters, KST clock

## Local preview

Open `index.html` directly, or serve the folder:

```powershell
# any static server works, for example
npx serve .
```

## Customising

- **Portrait:** drop an image at `assets/img/portrait.jpg`. The ID card picks it up
  automatically; without it the neon `AY` monogram stays.
- **Content:** everything lives in `index.html`. Colours and spacing are custom
  properties at the top of `assets/css/neon.css`.

## Deployed on

GitHub Pages, from the `main` branch root.

---

© Abubakir Yakubov · Gachon University, Computer Engineering
