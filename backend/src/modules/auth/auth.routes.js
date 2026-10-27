import { Router } from 'express';
import * as controller from './auth.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';

const router = Router();

router.post('/registro', verificarToken, verificarRol('administrador'), controller.registro);
router.post('/login', controller.login);

export default router;