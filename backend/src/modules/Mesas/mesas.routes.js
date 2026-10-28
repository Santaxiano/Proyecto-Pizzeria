import { Router } from 'express';
import * as controller from './mesas.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { validarId } from '../../middlewares/validarId.js';
import { validarMesa } from '../../middlewares/validarMesa.js';

const router = Router();

router.use(verificarToken);

router.get('/', controller.listar);
router.get('/:id', validarId, controller.obtener);
router.post('/', validarMesa, controller.crear);
router.put('/:id', validarId, validarMesa, controller.actualizar); // Cambiado a PUT
router.delete('/:id', validarId, controller.eliminar);

export default router;