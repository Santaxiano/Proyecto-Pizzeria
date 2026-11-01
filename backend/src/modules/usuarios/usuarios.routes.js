import { Router } from 'express';
import * as controller from './usuarios.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';
import { validarId } from '../../middlewares/validarId.js';

const router = Router();

router.get('/', verificarToken, verificarRol('administrador'), controller.listar);
router.put('/:id', validarId, verificarToken, verificarRol('administrador'), controller.actualizar);
router.delete('/:id', validarId, verificarToken, verificarRol('administrador'), controller.eliminar);

export default router;