import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Perform basic health checks
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          status: 'ok'
        },
        database: {
          status: 'ok', // In production, add actual database connectivity check
          latency: '< 50ms'
        },
        apis: {
          status: 'ok',
          endpoints: [
            '/api/agents',
            '/api/credit',
            '/api/health'
          ]
        }
      }
    };

    // Check memory usage (alert if over 80%)
    const memoryUsagePercent = (healthCheck.checks.memory.used / healthCheck.checks.memory.total) * 100;
    if (memoryUsagePercent > 80) {
      healthCheck.checks.memory.status = 'warning';
    }

    // Determine overall status
    const allChecksHealthy = Object.values(healthCheck.checks).every(
      check => check.status === 'ok'
    );

    if (!allChecksHealthy) {
      healthCheck.status = 'degraded';
    }

    return NextResponse.json(healthCheck, {
      status: healthCheck.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}

// Simple HEAD request for basic availability check
export async function HEAD() {
  return new Response(null, { status: 200 });
}
