import { Router } from 'express';
import * as controller from './pedidos.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { validarEstadoPedido } from '../../middlewares/validarEstadoPedido.js';
import { validarId } from '../../middlewares/validarId.js';
import { validarPedido } from '../../middlewares/validarPedido.js';
import { tokenOpcional } from '../../middlewares/tokenOpcional.js';

const router = Router();

// Público: los clientes crean pedidos desde el carrito sin iniciar sesión.
// tokenOpcional: si lo carga el gestor (comanda) no se le exige la ubicación del mapa.
router.post('/', tokenOpcional, validarPedido, controller.crear);

// Privado: el token se pone ruta por ruta para que el POST público no dependa del orden de las líneas.
router.get('/', verificarToken, controller.listar);
router.get('/:id', verificarToken, validarId, controller.obtener);
router.put('/:id', verificarToken, validarId, validarEstadoPedido, controller.actualizar);
// Edición completa de la comanda desde el gestor (el PUT de arriba solo cambia el estado)
router.put('/:id/editar', verificarToken, validarId, validarPedido, controller.editar);
router.delete('/:id', verificarToken, validarId, controller.eliminar);

export default router;
