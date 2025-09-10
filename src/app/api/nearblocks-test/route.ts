import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint for NearBlocks API integration
 * This endpoint tests the integration with NearBlocks API to fetch transaction data
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId') || 'bctemp.near';
  
  try {
    // Log the API key to verify it's set
    console.log('NEARBLOCKS_API_KEY:', process.env.NEARBLOCKS_API_KEY ? 'SET' : 'NOT SET');
    
    const nearblocksApiKey = process.env.NEARBLOCKS_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if available
    if (nearblocksApiKey) {
      headers['Authorization'] = `Bearer ${nearblocksApiKey}`;
    }
    
    console.log(`Making request to NearBlocks API for account: ${accountId}`);
    
    // Fetch transactions from NearBlocks API
    const response = await fetch(
      `https://api.nearblocks.io/v1/account/${accountId}/txns`,
      { headers }
    );
    
    console.log(`NearBlocks API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`NearBlocks API error: ${response.status} ${response.statusText}`, errorText);
      
      return NextResponse.json({
        success: false,
        error: `NearBlocks API error: ${response.status} ${response.statusText}`,
        details: errorText,
        accountId
      });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Data fetched successfully from NearBlocks API',
      accountId
    });
  } catch (error) {
    console.error('Error fetching data from NearBlocks API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data from NearBlocks API',
      details: error instanceof Error ? error.message : String(error),
      accountId
    });
  }
}