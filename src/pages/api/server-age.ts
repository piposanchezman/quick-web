import type { APIRoute } from 'astro';

/**
 * API endpoint to get server age based on server start date
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    // Calculate from the known server start date
    const serverStartDate = import.meta.env.SERVER_START_DATE || '2020-04-02';
    console.log('[API /api/server-age] SERVER_START_DATE from env:', import.meta.env.SERVER_START_DATE);
    console.log('[API /api/server-age] Using date:', serverStartDate);
    
    const startDate = new Date(serverStartDate);
    const now = new Date();
    
    // Calculate years considering full years only
    let years = now.getFullYear() - startDate.getFullYear();
    
    // Adjust if the current date hasn't reached the anniversary this year
    if (
      now.getMonth() < startDate.getMonth() ||
      (now.getMonth() === startDate.getMonth() && now.getDate() < startDate.getDate())
    ) {
      years--;
    }
    
    return new Response(
      JSON.stringify({
        years: years,
        startDate: startDate.toISOString(),
        source: 'configured',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      }
    );
  } catch (error) {
    console.error('[API /api/server-age] Error:', error);

    // Fallback to 5 years
    return new Response(
      JSON.stringify({
        years: 5,
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
