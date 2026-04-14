import type { APIRoute } from 'astro';
import type { RowDataPacket } from 'mysql2';
import { getDbPool } from '../../lib/db';

interface CountRow extends RowDataPacket {
  count: number;
}

// CACHÉ EN MEMORIA ANTI-STAMPEDE (Guardamos la Promesa, no el valor)
// Como el número de jugadores online cambia rápido, el caché puede ser de solo 1 minuto
let usersCachePromise: Promise<{ count: number }> | null = null;
let lastCacheTime = 0;
let fallbackCount: number | null = null; // Guardar siempre el último recuento exitoso
const CACHE_DURATION_MS = 60 * 1000; // 1 minuto (60,000 ms)

// VALIDACIÓN DE ORIGEN:
function isAllowedOrigin(request: Request) {
  if (!import.meta.env.PROD) return true;
  const referer = request.headers.get('referer') || '';
  const origin = request.headers.get('origin') || '';
  const host = request.headers.get('host') || '';
  
  if (!host) return true;
  return referer.includes(host) || origin.includes(host);
}

/**
 * API endpoint to get registered users count connecting to jPremium database
 */
export const GET: APIRoute = async ({ request }) => {
  // 1. Bloqueo de peticiones externas no autorizadas
  if (!isAllowedOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  // 2. Caché con Promesa (Anti-Stampede)
  const now = Date.now();

  if (usersCachePromise && (now - lastCacheTime) < CACHE_DURATION_MS) {
    try {
      const data = await usersCachePromise;
      return new Response(
        JSON.stringify({
          count: data.count,
          source: 'cache',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            // También indicamos al navegador que puede cachear
            'Cache-Control': 'public, max-age=60',
          },
        }
      );
    } catch (e) {
      // Si la promesa falló, la descartamos y seguimos al bloque de fetch nuevo.
      usersCachePromise = null;
    }
  }

  // Al expirar (o no existir, o fallar), reescribimos inmediatamente la promesa
  // de manera sincrónica para que las peticiones concurrentes se enganchen a ella
  usersCachePromise = (async () => {
    const dbHost = import.meta.env.JPREMIUM_DB_HOST;
    const dbPort = import.meta.env.JPREMIUM_DB_PORT;
    const dbName = import.meta.env.JPREMIUM_DB_NAME;
    const dbUser = import.meta.env.JPREMIUM_DB_USER;
    const dbPass = import.meta.env.JPREMIUM_DB_PASS;

    if (dbHost && dbName && dbUser && dbPass) {
      const pool = getDbPool();

      // Consultar MySQL
      const [rows] = await pool.execute<CountRow[]>(
        'SELECT COUNT(DISTINCT lastAddress) as count FROM user_profiles'
      );

      return { count: rows[0].count };
    }

    throw new Error('Database not configured');
  })();

  lastCacheTime = now;

  try {
    const data = await usersCachePromise;
    fallbackCount = data.count; // Respaldar para el fallback de emergencia
    return new Response(
      JSON.stringify({
        count: data.count,
        source: 'database',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  } catch (error) {
    usersCachePromise = null; // Limpiar para que la próxima intente de nuevo
    console.error('[API /api/users] Error:', error);

    // 4. Fallback de emergencia, regresar valor cacheado previo si la BDD se cae
    if (fallbackCount !== null) {
      return new Response(
        JSON.stringify({
          count: fallbackCount,
          source: 'expired_cache_fallback',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal failure or database not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
