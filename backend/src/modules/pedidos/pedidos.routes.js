import { Router } from 'express';
import * as controller from './pedidos.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { validarEstadoPedido } from '../../middlewares/validarEstadoPedido.js';
import { validarId } from '../../middlewares/validarId.js';

const router = Router();

router.use(verificarToken);

router.get('/', controller.listar);
router.put('/:id', validarId, validarEstadoPedido, controller.actualizar); 
router.delete('/:id', validarId, controller.eliminar);

export default router;