import { Router } from 'express';
import * as controller from './productos.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', verificarToken, controller.crear);
router.patch('/:id', verificarToken, controller.actualizar);
router.delete('/:id', verificarToken, controller.eliminar);

export default router;
