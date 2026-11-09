import { Router } from 'express';
import * as controller from './estadisticas.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

// Privado: son datos del negocio para el panel del gestor
router.get('/', verificarToken, controller.obtener);

export default router;
