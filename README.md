<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Voice Grocery Demo

A lightweight Vite + React demo for building a voice-assisted grocery shopping experience with Gemini-powered natural-language item matching.

## Features

- Voice input for grocery requests.
- Text-based natural-language item matching.
- Searchable grocery catalog and cart management.
- Simple checkout flow with geolocation-based address detection.

## Run locally

**Prerequisites:** Node.js 20+.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and add your Gemini API key:
   ```bash
   cp .env.example .env.local
   ```
3. Set `GEMINI_API_KEY` in `.env.local`.
4. Start the development server:
   ```bash
   npm run dev
   ```

## Available scripts

- `npm run dev` — start the local development server on port 3000.
- `npm run lint` — run TypeScript checks.
- `npm run build` — create a production build.
- `npm run preview` — preview the production build locally.
