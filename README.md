# DominoPro1 🁓

Plataforma moderna y profesional de **Juego de Dominó Online**, inspirada en la arquitectura de juego de *Dominastia* con la estética visual oscura de *Web Service UI Kit*.

![DominoPro1](public/images/logo.png)

## 🎲 Modalidades de Juego

- **Tradicional por Parejas (2v2):** 4 jugadores, parejas cruzadas a 100 o 200 puntos.
- **Duelo Mano a Mano (1v1):** 7 fichas por jugador, cálculo táctico individual y partidas rápidas.
- **Modo Fantasmita:** Para 3 jugadores con jugador automatizado / comodín.
- **Dominó con Pozo:** Posibilidad de robar fichas acumuladas en el pozo al no tener jugada disponible.
- **Modo Pintitín:** Formato express con penalización individual por conteo de puntos.
- **Torneo Semanal Élite:** Brackets eliminatorios con premios en monedas y trofeos de clasificación.

## ✨ Características Principales

- **Mesa de Juego Interactiva:**
  - Renderizado táctil de fichas con bisel 3D, puntos marfil y spinner central de latón.
  - Validación automática de jugadas legales en ambas puntas de la cadena.
  - Colocación inteligente de fichas dobles en orientación perpendicular.
  - **Bots con IA:** Toman decisiones estratégicas simulando tiempo de pensamiento.
  - Detección automática de **Tranca / Cierre**, conteo de puntos y manos dominadas.
  - **Efectos de Sonido:** Síntesis de audio con Web Audio API (golpeo de fichas, toques al pasar, fanfarria de victoria).
  - Libreta digital integrada para llevar el marcador mano a mano.
  - Chat y reacciones rápidas en la mesa.
- **Lobby y Dashboard:**
  - Mesas públicas en vivo.
  - Libreta digital independiente para partidas físicas u online.
  - Ranking global con sistema ELO.
  - Perfil de jugador con estadísticas de partidas, victorias y racha.

## 🛠️ Tecnologías

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Lenguaje:** TypeScript (Strict Mode)
- **UI & Estilos:** Tailwind CSS v4 con variables OKLCH, shadcn/ui
- **Sonido:** Web Audio API

## 🚀 Inicio Rápido

Instalar dependencias:
```bash
npm install
```

Iniciar servidor de desarrollo:
```bash
npm run dev
```

Ejecutar verificaciones de calidad (lint, typecheck y build):
```bash
npm run check
```

---
Desarrollado con ❤️ por [@susejgo89](https://github.com/susejgo89)
