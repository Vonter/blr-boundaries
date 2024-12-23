import { defineConfig, loadEnv } from 'vite'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import postcss from './postcss.config.js'

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  console.log('Building for /', process.env.VITE_BASE_URL)

  return defineConfig({
    css: { postcss },
    preprocess: [vitePreprocess({ script: true })],
    plugins: [svelte()],
    base: process.env.VITE_BASE_URL ? `/${process.env.VITE_BASE_URL}/` : './'
  });
}
