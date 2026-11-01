import { Router } from 'express';
import * as controller from './reservas.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.get('/', verificarToken, controller.listar);

export default router;