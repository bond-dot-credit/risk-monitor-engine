import { staticResponses } from '@/app/_utils/static-export';

export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour

// Mock data for static export
const mockData = {
  message: 'This is a static API response',
  timestamp: new Date().toISOString(),
};

export async function GET() {
  return staticResponses.mockData(mockData);
}

export async function POST() {
  return staticResponses.notAllowed();
}
