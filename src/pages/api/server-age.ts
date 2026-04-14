import type { APIRoute } from 'astro';

// CACHÉ EN MEMORIA RESTAURADO COMO MAP
// Esto permite extender a múltiples llaves si a futuro recibes parámetros estáticos
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // Refrescar 1 vez al día bastaría y sobra

function isAllowedOrigin(request: Request) {
  if (!import.meta.env.PROD) return true;
  const referer = request.headers.get('referer') || '';
  const origin = request.headers.get('origin') || '';
  const host = request.headers.get('host') || '';
  if (!host) return true;
  return referer.includes(host) || origin.includes(host);
}

export const GET: APIRoute = async ({ request }) => {
  if (!isAllowedOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  const cacheKey = 'server-age';
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && (now - cached.timestamp) < CACHE_DURATION_MS) {
    return new Response(JSON.stringify(cached.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Caché navegador por 24 horas
      },
    });
  }

  try {
    // Cálculo tradicional
    const serverStartDate = import.meta.env.SERVER_START_DATE || '2020-04-02';
    const startDate = new Date(serverStartDate);
    const currentDate = new Date();
    
    let years = currentDate.getFullYear() - startDate.getFullYear();
    
    if (
      currentDate.getMonth() < startDate.getMonth() ||
      (currentDate.getMonth() === startDate.getMonth() && currentDate.getDate() < startDate.getDate())
    ) {
      years--;
    }
    
    const data = {
      years: years,
      startDate: startDate.toISOString(),
      source: 'configured',
    };

    cache.set(cacheKey, { data, timestamp: now });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[API /api/server-age] Error:', error);
    
    return new Response(
      JSON.stringify({ years: 5, source: 'fallback' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
