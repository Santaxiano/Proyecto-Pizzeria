import { Router } from 'express';
import * as controller from './productos.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { validarId } from '../../middlewares/validarId.js';
import { validarProducto } from '../../middlewares/validarProducto.js';
import { subirImagenProducto } from '../../middlewares/subirImagen.js';

const router = Router();

router.post('/imagen', verificarToken, subirImagenProducto, controller.subirImagen);

router.get('/', controller.listar);
router.get('/:id', validarId ,controller.obtener);

router.post('/', verificarToken, validarProducto,  controller.crear);
router.put('/:id', validarId ,verificarToken,validarProducto, controller.actualizar);
router.delete('/:id', validarId ,verificarToken, controller.eliminar);

export default router;