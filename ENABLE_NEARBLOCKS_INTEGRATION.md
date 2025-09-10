# Enabling Real NearBlocks API Integration

This document explains how to enable the real NearBlocks API integration in the Risk Monitor Engine.

## Overview

The NearBlocks proxy API endpoint currently returns mock data for demonstration purposes. To enable real integration with the NearBlocks API, you need to:

1. Obtain a NearBlocks API key
2. Configure your environment variables
3. Uncomment the real API call code in the proxy endpoint

## Step 1: Obtain a NearBlocks API Key

1. Visit [nearblocks.io](https://nearblocks.io)
2. Sign up for an account or log in if you already have one
3. Navigate to your account settings or developer dashboard
4. Generate a new API key
5. Copy the API key for use in the next step

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root of your project with the following content:

```env
NEARBLOCKS_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you obtained from NearBlocks.

## Step 3: Enable Real API Calls

In the file `src/app/api/nearblocks-proxy/route.ts`, you'll find two code blocks that are currently commented out:

### For GET requests (transaction data):

```typescript
// Uncomment this block to enable real API calls
/*
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
*/
```

### For POST requests (account information):

```typescript
// Uncomment this block to enable real API calls
/*
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

return NextResponse.json({
  success: true,
  data: data,
  message: 'Account data fetched successfully from NearBlocks API'
});
*/
```

To enable real API calls, simply remove the `/*` and `*/` comments around these blocks.

## Step 4: Restart the Development Server

After making these changes, restart your development server:

```bash
npm run dev
```

## API Endpoints

Once enabled, the following endpoints will make real calls to NearBlocks:

### GET /api/nearblocks-proxy
Fetch transaction data for an account:
```
GET /api/nearblocks-proxy?accountId=example.near
```

### POST /api/nearblocks-proxy
Fetch account information:
```
POST /api/nearblocks-proxy
Content-Type: application/json

{
  "accountId": "example.near"
}
```

## Error Handling

The integration includes proper error handling for common scenarios:

1. **Missing API Key**: If no API key is provided, requests will be made without authentication (may have rate limits)
2. **Invalid Account**: If an account doesn't exist, NearBlocks will return a 404 error
3. **Rate Limiting**: NearBlocks has rate limits; implement appropriate retry logic if needed
4. **Network Errors**: Network issues will be caught and returned as error responses

## Data Format

The NearBlocks API returns data in the following formats:

### Transaction Data
```json
{
  "txns": [
    {
      "transaction_hash": "string",
      "block_timestamp": "number (nanoseconds)",
      "signer_account_id": "string",
      "receiver_account_id": "string",
      "actions": [
        {
          "type": "string",
          "method_name": "string (for FunctionCall actions)",
          "args": "string (JSON string)",
          "deposit": "string (yoctoNEAR)",
          "gas": "string"
        }
      ]
    }
  ]
}
```

### Account Information
```json
{
  "account_id": "string",
  "amount": "string (yoctoNEAR)",
  "locked": "string (yoctoNEAR)",
  "storage_usage": "number (bytes)",
  "storage_paid_at": "number",
  "transactions_count": "number",
  "receipts_count": "number"
}
```

## Converting Data Formats

### Timestamps
NearBlocks returns timestamps in nanoseconds. To convert to JavaScript Date objects:

```javascript
const date = new Date(timestamp / 1000000); // Convert nanoseconds to milliseconds
```

### Token Amounts
Token amounts are in yoctoNEAR (10^-24 NEAR). To convert to whole NEAR units:

```javascript
const nearAmount = yoctoAmount / 1e24;
```

## Rate Limits

NearBlocks API has the following rate limits:
- Free tier: 100 requests per minute
- Paid tiers: Higher limits available

Implement appropriate caching and rate limiting in your application to avoid hitting these limits.

## Security Considerations

1. **API Key Protection**: Never commit your API key to version control
2. **Environment Variables**: Use environment variables to store sensitive data
3. **Server-side Proxy**: The proxy approach helps protect your API key from client-side exposure
4. **Input Validation**: Always validate account IDs before making API calls

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check that your API key is correct and properly configured
2. **404 Not Found**: Verify the account ID exists on the NEAR blockchain
3. **429 Too Many Requests**: Implement rate limiting or upgrade your NearBlocks plan
4. **500 Internal Server Error**: Check the server logs for more details

### Debugging Steps

1. Check that your environment variables are properly set
2. Verify your API key is valid by testing with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        https://api.nearblocks.io/v1/account/example.near/txns
   ```
3. Check the development server logs for error messages
4. Ensure you're using the correct account ID format (e.g., `example.near`)

## Further Resources

- [NearBlocks API Documentation](https://nearblocks.io/apis)
- [NEAR Protocol Documentation](https://docs.near.org)
- [NearBlocks Developer Portal](https://nearblocks.io/developers)