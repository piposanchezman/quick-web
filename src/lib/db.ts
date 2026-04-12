import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool {
  if (!pool) {
    const dbHost = import.meta.env.JPREMIUM_DB_HOST;
    const dbPort = import.meta.env.JPREMIUM_DB_PORT;
    const dbName = import.meta.env.JPREMIUM_DB_NAME;
    const dbUser = import.meta.env.JPREMIUM_DB_USER;
    const dbPass = import.meta.env.JPREMIUM_DB_PASS;

    if (!dbHost || !dbName || !dbUser || !dbPass) {
      throw new Error('Database completely configured without environment variables (JPREMIUM_DB_*).');
    }

    pool = mysql.createPool({
      host: dbHost,
      port: parseInt(dbPort || '3306', 10),
      database: dbName,
      user: dbUser,
      password: dbPass,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  
  return pool;
}
