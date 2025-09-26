const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

function updateImportPaths(dir, depth = 0) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      updateImportPaths(fullPath, depth + 1);
    } else if (file.name === 'route.ts' || file.name === 'route.js') {
      const relativePath = Array(depth).fill('..').join('/') || '.';
      const importPath = `${relativePath}/_utils/static-export`;
      
      // Read the file
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Update the import path
      content = content.replace(
        /from ['"](.*?)\/_utils\/static-export['"]/g,
        `from '${importPath}'`
      );
      
      // Write the updated content back
      fs.writeFileSync(fullPath, content);
      console.log(`Updated imports in ${fullPath}`);
    }
  });
}

console.log('Updating import paths in API routes...');
updateImportPaths(apiDir);
console.log('Import paths updated successfully!');
