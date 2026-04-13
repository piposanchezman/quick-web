import type { APIRoute } from 'astro';
import { getDbPool } from '../../lib/db';

// CACHÉ EN MEMORIA: Evitar conexiones de spam a MySQL
// Como el número de jugadores online cambia rápido, el caché puede ser de solo 1 minuto
let memoryCache: { count: number, timestamp: number } | null = null;
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
 * API endpoint to get registered players count connecting to jPremium database
 */
export const GET: APIRoute = async ({ request }) => {
  // 1. Bloqueo de peticiones externas no autorizadas
  if (!isAllowedOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  // 2. Caché Rápida desde RAM sin tener que interrogar MySQL
  const now = Date.now();
  if (memoryCache && (now - memoryCache.timestamp) < CACHE_DURATION_MS) {
    return new Response(
      JSON.stringify({
        count: memoryCache.count,
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
  }

  try {
    const dbHost = import.meta.env.JPREMIUM_DB_HOST;
    const dbPort = import.meta.env.JPREMIUM_DB_PORT;
    const dbName = import.meta.env.JPREMIUM_DB_NAME;
    const dbUser = import.meta.env.JPREMIUM_DB_USER;
    const dbPass = import.meta.env.JPREMIUM_DB_PASS;

    if (dbHost && dbName && dbUser && dbPass) {
      const pool = getDbPool();

      // Consultar MySQL
      const [rows] = await pool.execute(
        'SELECT COUNT(DISTINCT lastAddress) as count FROM user_profiles'
      ) as any;

      const count = rows[0].count;

      // 3. Guardar nuevo valor en la RAM (Memoria caché de Node.js)
      memoryCache = { count, timestamp: now };

      return new Response(
        JSON.stringify({
          count: count,
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
    }

    return new Response(
      JSON.stringify({ error: 'Database not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[API /api/players] Error:', error);

    // 4. Fallback de emergencia, regresar valor cacheado previo si la BDD se cae
    if (memoryCache) {
       return new Response(
        JSON.stringify({
          count: memoryCache.count,
          source: 'expired_cache_fallback',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal failure' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
