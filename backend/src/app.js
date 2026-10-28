import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import authRoutes from './modules/auth/auth.routes.js';
import ingredientesRoutes from './modules/Ingredientes/ingredientes.routes.js';
import mesasRoutes from './modules/Mesas/mesas.routes.js';
import pedidosRoutes from './modules/pedidos/pedidos.routes.js';
import productosRoutes from './modules/productos/productos.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, _res, next) => {
  if (req.body == null) req.body = {};
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/productos', productosRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;