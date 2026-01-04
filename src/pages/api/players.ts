import type { APIRoute } from 'astro';

/**
 * API endpoint to get registered players count
 * This endpoint connects to jPremium database or API
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    // Configuration from environment variables
    const jPremiumApiUrl = import.meta.env.JPREMIUM_API_URL;
    const jPremiumApiKey = import.meta.env.JPREMIUM_API_KEY;
    
    // Alternative: Direct database connection
    const dbHost = import.meta.env.JPREMIUM_DB_HOST;
    const dbPort = import.meta.env.JPREMIUM_DB_PORT;
    const dbName = import.meta.env.JPREMIUM_DB_NAME;
    const dbUser = import.meta.env.JPREMIUM_DB_USER;
    const dbPass = import.meta.env.JPREMIUM_DB_PASS;

    // Method 1: If jPremium has an API endpoint (COMMENTED OUT)
    /*
    if (jPremiumApiUrl && jPremiumApiKey) {
      try {
        const response = await fetch(`${jPremiumApiUrl}/players/count`, {
          headers: {
            'Authorization': `Bearer ${jPremiumApiKey}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(
            JSON.stringify({
              count: data.count || 0,
              source: 'api',
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
              },
            }
          );
        }
      } catch (apiError) {
        console.error('[API /api/players] API method failed:', apiError);
      }
    }
    */

    // Method 2: Direct database query (requires mysql2 package)
    if (dbHost && dbName && dbUser && dbPass) {
      const mysql = await import('mysql2/promise');
      
      const connection = await mysql.createConnection({
        host: dbHost,
        port: parseInt(dbPort || '3306'),
        database: dbName,
        user: dbUser,
        password: dbPass,
      });

      const [rows] = await connection.execute(
        'SELECT COUNT(DISTINCT lastAddress) as count FROM user_profiles'
      ) as any;

      await connection.end();

      return new Response(
        JSON.stringify({
          count: rows[0].count,
          source: 'database',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
          },
        }
      );
    }

    // Database not configured
    return new Response(
      JSON.stringify({
        error: 'Database not configured',
        message: 'Please configure JPREMIUM_DB_* environment variables',
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[API /api/players] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Database error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
