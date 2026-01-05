import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const apiKey = import.meta.env.PUBLIC_UPTIME_ROBOT_API_KEY;
    const monitorId = import.meta.env.PUBLIC_UPTIME_ROBOT_MONITOR_ID;

    // Get days parameter from query string (default to 7)
    const days = parseInt(url.searchParams.get('days') || '7');

    // Validate credentials
    if (!apiKey || !monitorId) {
      return new Response(
        JSON.stringify({
          error: 'Uptime Robot credentials not configured',
          fallback: true,
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

    // Fetch from Uptime Robot API (server-side, no CORS issues)
    // Always request all periods (1-7-30-365) and logs for detailed calculation
    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api_key: apiKey,
        monitors: monitorId,
        custom_uptime_ratios: '1-7-30-365',
        logs: '1',
        logs_limit: '100',
      }),
    });

    if (!response.ok) {
      throw new Error(`Uptime Robot API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for rate limit errors from Uptime Robot API
    if (data.stat === 'fail' && data.error) {
      console.error('[API /api/uptime] Uptime Robot API error:', data.error);
      return new Response(JSON.stringify({
        error: data.error.message || 'API error',
        fallback: true,
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          'Retry-After': '300'
        },
      });
    }

    // Return the data with 5-minute cache to respect rate limits
    // Uptime Robot free tier: 10 requests per minute
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[API /api/uptime] Error:', error);

    // Return error response with cache to avoid hammering the API
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  }
};
