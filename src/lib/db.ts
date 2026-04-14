import mysql from 'mysql2/promise';
import {
  JPREMIUM_DB_HOST,
  JPREMIUM_DB_PORT,
  JPREMIUM_DB_NAME,
  JPREMIUM_DB_USER,
  JPREMIUM_DB_PASS
} from 'astro:env/server';

let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: JPREMIUM_DB_HOST,
      port: JPREMIUM_DB_PORT,
      database: JPREMIUM_DB_NAME,
      user: JPREMIUM_DB_USER,
      password: JPREMIUM_DB_PASS,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  
  return pool;
}