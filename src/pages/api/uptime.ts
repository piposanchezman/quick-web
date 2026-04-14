import type { APIRoute } from 'astro';

// CACHÉ EN MEMORIA RESTAURADO COMO MAP
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos guardados en RAM del servidor

// VALIDACIÓN DE ORIGEN: Protege que otros sitios no consuman nuestra API
function isAllowedOrigin(request: Request) {
  if (!import.meta.env.PROD) return true; // En modo local permitir siempre
  const referer = request.headers.get('referer') || '';
  const origin = request.headers.get('origin') || '';
  const host = request.headers.get('host') || '';
  
  if (!host) return true;
  return referer.includes(host) || origin.includes(host);
}

export const GET: APIRoute = async ({ request, url }) => {
  // 1. Bloquear accesos desde bots externos o iframes ajenos
  if (!isAllowedOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  // 2. Comprobar Caché, si es válido regresarlo AL INSTANTE
  const cacheKey = 'uptime_data';
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && (now - cached.timestamp) < CACHE_DURATION_MS) {
    return new Response(JSON.stringify(cached.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Caché de navegador
      },
    });
  }

  try {
    const apiKey = import.meta.env.UPTIME_ROBOT_API_KEY;
    const monitorId = import.meta.env.UPTIME_ROBOT_MONITOR_ID;

    if (!apiKey || !monitorId) {
      return new Response(
        JSON.stringify({ error: 'Uptime Robot credentials not configured', fallback: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. TIMEOUT DE FETCH: Cancelar petición externa si se queda colgada (Protege la RAM)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 segundos de tope

    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        api_key: apiKey,
        monitors: monitorId,
        custom_uptime_ratios: '1-7-30-365',
        logs: '1',
        logs_limit: '100',
      }),
      signal: controller.signal // Límite de tiempo aplicado a fetch
    });

    clearTimeout(timeoutId); // Limpiar timer

    if (!response.ok) throw new Error(`Uptime Robot API error: ${response.status}`);

    const data = await response.json();

    if (data.stat === 'fail' && data.error) {
      console.warn('[API /api/uptime] Uptime Robot API error:', data.error);
      return new Response(JSON.stringify({ error: 'Internal limit', fallback: true }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '300' },
      });
    }

    // GUARDAR EN CACHÉ antes de enviar al usuario
    cache.set(cacheKey, { data, timestamp: now });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[API /api/uptime] Fetch Error:', error);

    // MEGA-FALLBACK: Si UptimeRobot está muerto hace horas, seguimos enviando 
    // la última caché viva que tuvo Node en lugar del aviso de error.
    const fallbackCache = cache.get(cacheKey);
    if (fallbackCache) {
      return new Response(JSON.stringify(fallbackCache.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(
      JSON.stringify({ error: 'Internal service failure', fallback: true }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
