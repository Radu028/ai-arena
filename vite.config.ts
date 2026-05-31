import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { nitro } from 'nitro/vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'CLERK_PUBLISHABLE_KEY'],
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    tanstackStart(),
    nitro({ preset: process.env.NITRO_PRESET ?? 'vercel' }),
    viteReact(),
    tailwindcss(),
  ],
})

export default config
