import { Router } from 'express';
import * as controller from './pedidos.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { validarEstadoPedido } from '../../middlewares/validarEstadoPedido.js';
import { validarId } from '../../middlewares/validarId.js';
import { validarPedido } from '../../middlewares/validarPedido.js';

const router = Router();

// Público: los clientes crean pedidos desde el carrito sin iniciar sesión.
router.post('/', validarPedido, controller.crear);

// Privado: el token se pone ruta por ruta para que el POST público no dependa del orden de las líneas.
router.get('/', verificarToken, controller.listar);
router.put('/:id', verificarToken, validarId, validarEstadoPedido, controller.actualizar);
router.delete('/:id', verificarToken, validarId, controller.eliminar);

export default router;
