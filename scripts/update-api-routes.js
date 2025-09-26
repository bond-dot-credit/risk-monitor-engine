const fs = require('fs');
const path = require('path');

// API route'larının bulunduğu dizin
const apiDir = path.join(__dirname, '../src/app/api');

// Statik export için gerekli içerik
const staticConfig = `
import { staticConfig, staticResponses } from '../_utils/static-export';

export const dynamic = staticConfig.dynamic;
export const revalidate = staticConfig.revalidate;

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

// Tüm route.ts dosyalarını bul ve güncelle
function updateRouteFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      updateRouteFiles(fullPath);
    } else if (file.name === 'route.ts' || file.name === 'route.js') {
      console.log(`Updating ${fullPath}`);
      fs.writeFileSync(fullPath, staticConfig);
    }
  });
}

// İşlemi başlat
console.log('Updating API routes for static export...');
updateRouteFiles(apiDir);
console.log('API routes updated successfully!');
