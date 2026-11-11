import fs from 'node:fs';

// En local se lee el .env; en Render no existe y las variables vienen del panel
if (fs.existsSync('.env')) process.loadEnvFile();

export const env = {
  PORT: process.env.PORT ?? 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  // URL a la que Mercado Pago devuelve al usuario después de pagar.
  FRONTEND_URL: process.env.FRONTEND_URL ?? process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  PGHOST: process.env.PGHOST ?? 'localhost',
  PGPORT: process.env.PGPORT ?? 5432,
  PGUSER: process.env.PGUSER ?? 'postgres',
  PGPASSWORD: process.env.PGPASSWORD ?? '',
  PGDATABASE: process.env.PGDATABASE ?? 'Pizzeria',
  // Render entrega la conexión como una sola URL (Internal Database URL)
  DATABASE_URL: process.env.DATABASE_URL,

  JWT_SECRET: process.env.JWT_SECRET, 
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1h',

  MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
};

if (!env.JWT_SECRET) {
  throw new Error('Falta JWT_SECRET en el archivo .env');
}

if (!env.MERCADOPAGO_ACCESS_TOKEN) {
  console.warn('⚠️ Falta MERCADOPAGO_ACCESS_TOKEN en el archivo .env. Los pagos online fallarán.');
}
