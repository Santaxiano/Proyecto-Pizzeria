import { Router } from 'express';
import * as controller from './auth.controller.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = Router();

router.post('/registro', controller.registro); 
router.post('/login', controller.login); 
router.get('/perfil', verificarToken, controller.perfil); 

export default router;