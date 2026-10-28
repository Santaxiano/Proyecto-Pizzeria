import { Router } from 'express';
import * as controller from './mesas.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.use(verificarToken);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.patch('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;
