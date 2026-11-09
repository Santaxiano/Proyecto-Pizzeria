import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import authRoutes from './modules/auth/auth.routes.js';
import ingredientesRoutes from './modules/Ingredientes/ingredientes.routes.js';
import mesasRoutes from './modules/Mesas/mesas.routes.js';
import pedidosRoutes from './modules/pedidos/pedidos.routes.js';
import productosRoutes from './modules/productos/productos.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js'; 
import reservasRoutes from './modules/reservas/reservas.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import pagosRoutes from './modules/pagos/pagos.routes.js';
import estadisticasRoutes from './modules/estadisticas/estadisticas.routes.js';
import { CARPETA_UPLOADS } from './middlewares/subirImagen.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
// Imágenes subidas desde el panel (ej. /uploads/productos/123-abcd.jpg)
app.use('/uploads', express.static(CARPETA_UPLOADS));
app.use((req, _res, next) => {
  if (req.body == null) req.body = {};
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes); 
app.use('/api/reservas', reservasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;