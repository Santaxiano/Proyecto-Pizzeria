import { Router } from 'express';
import * as controller from './pedidos.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.use(verificarToken);

router.get('/', controller.listar);

export default router;