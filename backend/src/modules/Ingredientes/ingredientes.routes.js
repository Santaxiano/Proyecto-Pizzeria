import { Router } from 'express';
import * as controller from './ingredientes.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { validarId } from '../../middlewares/validarId.js';
import { validarIngrediente } from '../../middlewares/validarIngrediente.js';

const router = Router();

router.use(verificarToken);

router.get('/', controller.listar);
router.get('/:id', validarId, controller.obtener);
router.get('/:id/productos', validarId, controller.listarProductos);
router.post('/', validarIngrediente, controller.crear);
router.put('/:id', validarId, validarIngrediente, controller.actualizar);
router.delete('/:id', validarId, controller.eliminar);

export default router;