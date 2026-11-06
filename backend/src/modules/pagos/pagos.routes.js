import { Router } from 'express';
import { crearPreferencia } from './pagos.controller.js'; // Ajustá la ruta

const router = Router();

router.post('/crear-preferencia', crearPreferencia);

export default router;