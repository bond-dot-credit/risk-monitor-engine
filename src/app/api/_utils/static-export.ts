import { NextResponse } from 'next/server';

// Common responses for all API routes
export const staticResponses = {
  notAllowed: () => 
    NextResponse.json(
      { error: 'Method not allowed in static export' }, 
      { status: 405 }
    ),
  
  mockData: (data: any) => 
    NextResponse.json({ success: true, data }),
    
  error: (message = 'An error occurred', status = 500) =>
    NextResponse.json({ error: message }, { status })
};

// These constants will be inlined during build
export const FORCE_STATIC = 'force-static';
export const REVALIDATE_1H = 3600; // 1 hour in seconds
