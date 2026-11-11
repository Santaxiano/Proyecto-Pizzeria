import { Router } from 'express';
import * as controller from './configuracion.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';

const router = Router();

// Público: el carrito del cliente necesita mostrar el costo de envío sin iniciar sesión
router.get('/envio', controller.obtener);

// Privado: lo cambian empleados y administradores desde el gestor
router.put('/envio', verificarToken, verificarRol('empleado', 'administrador'), controller.actualizar);

export default router;
