import { Router } from 'express';
import * as controller from './pedidos.controller.js';

const router = Router();

router.get('/', controller.listar);

export default router;
