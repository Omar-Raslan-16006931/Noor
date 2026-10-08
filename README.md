# Noor — Islamic Assistant

A daily companion app with prayer times, Qibla direction, Quran reading and tracking, and an AI assistant for Islamic questions.

## Features

- **Prayer times** based on your location, with notifications and a Jumu'ah card
- **Qibla compass** using the device's location and orientation
- **Quran reader and tracker** to log your daily reading progress
- **Hadith browser**
- **AI assistant** (Gemini) for Islamic guidance
- **Tasbih counter**, **Zakat calculator** and a personal **journal**
- **Community tab** for sharing
- **Shareable images:** turn a verse or hadith into an image card to share
- Installable as a PWA

## Tech stack

React, TypeScript, Vite, Framer Motion, Supabase (Auth + database), Google Gemini, html2canvas, deployed on Vercel

## Getting started

```bash
npm install
# create .env.local with your Supabase URL/anon key and GEMINI_API_KEY
npm run dev
```
