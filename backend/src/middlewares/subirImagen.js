import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Carpeta raíz de archivos subidos (backend/uploads). app.js la sirve en /uploads
export const CARPETA_UPLOADS = path.resolve(dirname, '../../uploads');
const CARPETA_PRODUCTOS = path.join(CARPETA_UPLOADS, 'productos');
fs.mkdirSync(CARPETA_PRODUCTOS, { recursive: true });

const TIPOS_PERMITIDOS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
const TAMANO_MAXIMO_MB = 5;

const almacenamiento = multer.diskStorage({
  destination: CARPETA_PRODUCTOS,
  // Nombre único para que dos fotos "foto.jpg" no se pisen
  filename: (_req, file, cb) => {
    const nombre = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${TIPOS_PERMITIDOS[file.mimetype]}`;
    cb(null, nombre);
  },
});

const subida = multer({
  storage: almacenamiento,
  limits: { fileSize: TAMANO_MAXIMO_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (TIPOS_PERMITIDOS[file.mimetype]) return cb(null, true);
    const error = new Error('Solo se permiten imágenes JPG, PNG o WEBP');
    error.status = 400;
    cb(error);
  },
}).single('imagen');

// Envuelve multer para devolver errores claros (400) en vez de un 500 genérico
export const subirImagenProducto = (req, res, next) => {
  subida(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const mensaje = err.code === 'LIMIT_FILE_SIZE'
        ? `La imagen no puede pesar más de ${TAMANO_MAXIMO_MB} MB`
        : 'No se pudo procesar la imagen enviada';
      return res.status(400).json({ error: mensaje });
    }
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ error: "Falta el archivo en el campo 'imagen'" });
    next();
  });
};
