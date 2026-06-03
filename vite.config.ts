import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { aiMiddleware } from './scripts/ai-middleware'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env (incl. non-VITE_ vars like OPENAI_API_KEY) for the server-side
  // AI middleware. These are NOT exposed to the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), aiMiddleware(env)],
    server: {
      // Honor PORT when set (e.g. preview tooling); otherwise fall back to Vite's default.
      port: Number(process.env.PORT) || 5173,
      strictPort: !!process.env.PORT,
    },
  }
})
