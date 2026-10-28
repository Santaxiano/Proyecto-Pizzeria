import { Router } from 'express';
import * as controller from './ingredientes.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.use(verificarToken);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;