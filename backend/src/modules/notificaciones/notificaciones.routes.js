import { Router } from 'express';
import * as controller from './notificaciones.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

// Privado: solo el personal con sesión puede ver pedidos y reservas recibidos.
router.get('/', verificarToken, controller.listar);

export default router;
