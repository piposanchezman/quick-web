import type { APIRoute } from 'astro';

/**
 * API endpoint to get registered players count
 * This endpoint connects to jPremium database
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const dbHost = import.meta.env.JPREMIUM_DB_HOST;
    const dbPort = import.meta.env.JPREMIUM_DB_PORT;
    const dbName = import.meta.env.JPREMIUM_DB_NAME;
    const dbUser = import.meta.env.JPREMIUM_DB_USER;
    const dbPass = import.meta.env.JPREMIUM_DB_PASS;

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
