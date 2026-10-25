import express from 'express'
import { errorHandler } from './middlewares/errorHandler.js'
import { logger } from './middlewares/logger.js'
import productosRouter from './modules/productos/productos.routes.js'
import { HttpError } from './shared/errors/HttpError.js'

const app = express()

app.use(logger)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ estado: 'ok' })
})

app.use('/api/productos', productosRouter)

app.use((_req, _res, next) => {
  next(new HttpError(404, 'Ruta no encontrada'))
})

app.use(errorHandler)

export default app
