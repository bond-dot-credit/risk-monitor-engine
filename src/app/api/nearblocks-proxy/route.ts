import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint for NearBlocks API
 * This endpoint integrates with NearBlocks API to fetch transaction data
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // Use bctemp.near as default wallet ID if none provided
  const accountId = searchParams.get('accountId') || 'bctemp.near';
  
  if (!accountId) {
    return NextResponse.json(
      { success: false, error: 'Missing accountId parameter' },
      { status: 400 }
    );
  }
  
  try {
    const nearblocksApiKey = process.env.NEARBLOCKS_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if available
    if (nearblocksApiKey) {
      headers['Authorization'] = `Bearer ${nearblocksApiKey}`;
    }
    
    // Fetch transactions from NearBlocks API
    const response = await fetch(
      `https://api.nearblocks.io/v1/account/${accountId}/txns`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`NearBlocks API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Data fetched successfully from NearBlocks API'
    });
  } catch (error) {
    console.error('Error fetching data from NearBlocks API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data from NearBlocks API',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Use bctemp.near as default wallet ID if none provided
  const { accountId = 'bctemp.near' } = body;
  
  if (!accountId) {
    return NextResponse.json(
      { success: false, error: 'Missing accountId in request body' },
      { status: 400 }
    );
  }
  
  try {
    const nearblocksApiKey = process.env.NEARBLOCKS_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if available
    if (nearblocksApiKey) {
      headers['Authorization'] = `Bearer ${nearblocksApiKey}`;
    }
    
    // Fetch account information from NearBlocks API
    const response = await fetch(
      `https://api.nearblocks.io/v1/account/${accountId}`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`NearBlocks API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // The account data is in the 'account' property
    const accountData = data.account || data;
    
    return NextResponse.json({
      success: true,
      data: accountData,
      message: 'Account data fetched successfully from NearBlocks API'
    });
  } catch (error) {
    console.error('Error fetching account data from NearBlocks API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch account data from NearBlocks API',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}