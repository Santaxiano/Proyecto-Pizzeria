import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const CARPETA_BACKEND = path.resolve(dirname, '../backend')

// https://vite.dev/config/
function servirBackend() {
  let configuracion

  function middleware(req, res, next) {
    let url
    try {
      url = decodeURIComponent((req.url ?? '').split('?')[0])
    } catch {
      return next()
    }
    if (!url.startsWith('/backend/')) return next()

    const archivo = path.resolve(CARPETA_BACKEND, '.' + url.slice('/backend'.length))
    const esValido =
      archivo.startsWith(CARPETA_BACKEND + path.sep) && // no permite salir de ../backend
      archivo.endsWith('.json') &&
      fs.existsSync(archivo)

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    if (!esValido) {
      res.statusCode = 404
      return res.end(JSON.stringify({ error: 'Recurso no encontrado' }))
    }
    fs.createReadStream(archivo).pipe(res)
  }

  return {
    name: 'servir-backend',
    configResolved(config) {
      configuracion = config
    },
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
    closeBundle() {
      // La carpeta solo existe en instalaciones que aún conservan datos JSON legacy.
      if (configuracion.command !== 'build') return
      const origen = path.join(CARPETA_BACKEND, 'data')
      if (!fs.existsSync(origen)) return

      const destino = path.resolve(configuracion.root, configuracion.build.outDir, 'backend/data')
      fs.cpSync(origen, destino, { recursive: true })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    servirBackend(),
  ],
})