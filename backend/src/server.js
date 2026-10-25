import 'dotenv/config'
import app from './app.js'

const port = Number(process.env.PORT ?? 3000)

const server = app.listen(port, () => {
  console.log(`Backend disponible en http://localhost:${port}`)
})

server.on('error', (error) => {
  console.error('No se pudo iniciar el servidor:', error)
  process.exitCode = 1
})
