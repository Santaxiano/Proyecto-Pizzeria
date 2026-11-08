import { Router } from 'express';
import * as controller from './reservas.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';
import { validarId } from '../../middlewares/validarId.js';
import { validarReserva } from '../../middlewares/validarReserva.js';

const router = Router();

router.get('/', verificarToken, controller.listar);
router.post('/', validarReserva('crear'), controller.crear);
router.patch('/:id', verificarToken, verificarRol('empleado', 'administrador'), validarId, validarReserva('actualizar'), controller.actualizar);
router.delete('/:id', verificarToken, verificarRol('empleado', 'administrador'), validarId, controller.eliminar);

export default router;
