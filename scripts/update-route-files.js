const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

// The new content for route files
const routeContent = `import { staticResponses } from '@/app/_utils/static-export';

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
`;

function updateRouteFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      updateRouteFiles(fullPath);
    } else if (file.name === 'route.ts' || file.name === 'route.js') {
      console.log(`Updating ${fullPath}`);
      fs.writeFileSync(fullPath, routeContent);
    }
  });
}

console.log('Updating all route files...');
updateRouteFiles(apiDir);
console.log('All route files updated successfully!');
