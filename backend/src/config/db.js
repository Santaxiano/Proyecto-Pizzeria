import pkg from 'pg';
import { env } from './env.js';

const { Pool } = pkg;

// Producción (Render): una sola URL. Local: variables PG* como siempre
const conexion = env.DATABASE_URL
  ? { connectionString: env.DATABASE_URL }
  : {
      host: env.PGHOST,
      port: env.PGPORT,
      user: env.PGUSER,
      password: env.PGPASSWORD,
      database: env.PGDATABASE,
    };

export const pool = new Pool({
  ...conexion,

  max: 20,
  min: 0,

  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 5000, 
  query_timeout: 10000, 
  statement_timeout: 10000, 

  allowExitOnIdle: false, 
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones', err);
});
